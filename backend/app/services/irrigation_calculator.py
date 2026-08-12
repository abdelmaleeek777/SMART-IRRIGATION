"""Deterministic daily irrigation quantity calculations.

Weather units: temperature °C, relative humidity %, wind km/h, sunshine h,
rain mm, latitude degrees. Results are mm/day unless stated otherwise.

FAO-56 Penman-Monteith is used with solar radiation estimated from sunshine
duration using the Angstrom relationship. Because this API does not receive
daily min/max temperature or measured radiation, a configurable ±5°C diurnal
range is used only to derive radiation/vapour-pressure terms. It is an explicit
planning assumption and should be replaced by measurements when available.
"""
from datetime import date
from math import acos, cos, exp, log, pi, sin, sqrt, tan

from .crop_coefficients import (
    CROP_KC, DEFAULT_KC, IRRIGATION_EFFICIENCY, PREDICTION_DEMAND_FACTOR,
    SOIL_MOISTURE_CONFIG,
)


def _clamp(value, low, high):
    return max(low, min(high, value))


def get_crop_coefficient(crop_type, growth_stage):
    crop = next((k for k in CROP_KC if k.lower() == str(crop_type).strip().lower()), None)
    stage = str(growth_stage).strip().title()
    return float(CROP_KC.get(crop, {}).get(stage, DEFAULT_KC))


def calculate_et0(temperature_c, humidity, wind_speed_kmh, sunlight_hours, latitude=0.0, calculation_date=None):
    """Calculate reference ET0 (mm/day) with daily FAO-56 PM.

    Net radiation uses extraterrestrial radiation and Angstrom sunshine
    duration. Wind speed is converted km/h -> m/s; vapour pressures are kPa.
    """
    t = float(temperature_c)
    rh = _clamp(float(humidity), 0.0, 100.0)
    u2 = max(0.0, float(wind_speed_kmh)) / 3.6
    n = _clamp(float(sunlight_hours), 0.0, 24.0)
    doy = (calculation_date or date.today()).timetuple().tm_yday
    phi = float(latitude) * pi / 180.0
    dr = 1 + 0.033 * cos(2 * pi * doy / 365)
    delta_solar = 0.409 * sin(2 * pi * doy / 365 - 1.39)
    ws = acos(_clamp(-tan(phi) * tan(delta_solar), -1.0, 1.0))
    ra = (24 * 60 / pi) * 0.0820 * dr * (ws * sin(phi) * sin(delta_solar) + cos(phi) * cos(delta_solar) * sin(ws))
    nmax = 24 / pi * ws
    rs = (0.25 + 0.50 * (n / max(nmax, 1e-6))) * ra
    rso = (0.75 + 2e-5 * 0.0) * ra
    rns = (1 - 0.23) * rs
    # Explicit configurable proxy for unavailable Tmin/Tmax.
    diurnal_range = 5.0
    tmin, tmax = t - diurnal_range, t + diurnal_range
    ea = (rh / 100.0) * 0.6108 * exp(17.27 * t / (t + 237.3))
    es = (0.6108 * exp(17.27 * tmin / (tmin + 237.3)) + 0.6108 * exp(17.27 * tmax / (tmax + 237.3))) / 2
    rnl = 4.903e-9 * (((tmin + 273.16) ** 4 + (tmax + 273.16) ** 4) / 2) * (0.34 - 0.14 * sqrt(max(ea, 0))) * (1.35 * min(rs / max(rso, 1e-6), 1.0) - 0.35)
    rn = rns - max(0.0, rnl)
    delta = 4098 * (0.6108 * exp(17.27 * t / (t + 237.3))) / ((t + 237.3) ** 2)
    gamma = 0.665e-3 * 101.3
    et0 = (0.408 * delta * rn + gamma * (900 / (t + 273)) * u2 * max(es - ea, 0)) / (delta + gamma * (1 + 0.34 * u2))
    return round(max(0.0, et0), 4)


def calculate_effective_rainfall(rainfall_mm, etc_mm):
    """Daily effective rain is capped at crop demand; excess is runoff/deep drainage."""
    return round(min(max(0.0, float(rainfall_mm)), max(0.0, float(etc_mm))), 4)


def calculate_water_volume(irrigation_mm, field_area_hectare):
    """1 mm over 1 hectare equals 10 m³."""
    return round(max(0.0, float(irrigation_mm)) * max(0.0, float(field_area_hectare)) * 10.0, 4)


def calculate_irrigation_requirement(*, temperature_c, humidity, rainfall_mm, wind_speed_kmh,
                                     sunlight_hours, latitude, crop_type, crop_growth_stage,
                                     irrigation_type, soil_moisture_percent, field_area_hectare,
                                     prediction="HIGH", calculation_date=None):
    et0 = calculate_et0(temperature_c, humidity, wind_speed_kmh, sunlight_hours, latitude, calculation_date)
    kc = get_crop_coefficient(crop_type, crop_growth_stage)
    etc = round(et0 * kc, 4)
    effective_rain = calculate_effective_rainfall(rainfall_mm, etc)
    moisture = _clamp(float(soil_moisture_percent), 0.0, 100.0)
    sm = SOIL_MOISTURE_CONFIG
    # Moisture is normalized between configured WP and FC, never interpreted as mm.
    # A percentage above the planning FC is treated as wet soil, not as proof
    # that no irrigation is ever needed. Keep a 25% baseline so the quantity
    # remains useful and the ML label cannot turn the result into a hard zero.
    depletion_factor = _clamp((sm["field_capacity_percent"] - moisture) / (sm["field_capacity_percent"] - sm["wilting_point_percent"]), 0.25, 1.0)
    demand_factor = PREDICTION_DEMAND_FACTOR.get(str(prediction).upper(), 1.0)
    net = round(max(0.0, etc - effective_rain) * depletion_factor * demand_factor, 4)
    efficiency = IRRIGATION_EFFICIENCY.get(str(irrigation_type).strip().title(), IRRIGATION_EFFICIENCY["Drip"])
    gross = round(net / efficiency, 4) if efficiency else 0.0
    return {"et0_mm": et0, "kc": kc, "etc_mm": etc, "effective_rainfall_mm": effective_rain,
            "net_irrigation_mm": net, "irrigation_efficiency": efficiency,
            "gross_irrigation_mm": gross, "recommended_irrigation_mm": gross,
            "recommended_volume_m3": calculate_water_volume(gross, field_area_hectare)}
