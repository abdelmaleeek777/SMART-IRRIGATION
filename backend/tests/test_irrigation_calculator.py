import pytest

from app.services.irrigation_calculator import (
    calculate_effective_rainfall,
    calculate_et0,
    calculate_irrigation_requirement,
    calculate_water_volume,
)


def base(**overrides):
    values = dict(
        temperature_c=25, humidity=50, rainfall_mm=0, wind_speed_kmh=10,
        sunlight_hours=10, latitude=34, crop_type="Wheat",
        crop_growth_stage="Vegetative", irrigation_type="Drip",
        soil_moisture_percent=20, field_area_hectare=1, prediction="HIGH",
    )
    values.update(overrides)
    return values


def test_et0_is_deterministic_and_non_negative():
    assert calculate_et0(25, 50, 10, 10, 34) == calculate_et0(25, 50, 10, 10, 34)
    assert calculate_et0(25, 50, 10, 10, 34) >= 0


def test_effective_rainfall_is_capped_at_crop_demand():
    assert calculate_effective_rainfall(0, 5) == 0
    assert calculate_effective_rainfall(100, 5) == 5


def test_water_volume_conversion():
    assert calculate_water_volume(1, 1) == 10
    assert calculate_water_volume(18, 2.03) == pytest.approx(365.4)
    assert calculate_water_volume(10, 0.1) == 10


def test_requirement_contains_net_and_gross_values():
    result = calculate_irrigation_requirement(**base())
    assert result["etc_mm"] >= 0
    assert result["gross_irrigation_mm"] >= result["net_irrigation_mm"]
    assert result["recommended_volume_m3"] >= 0


def test_high_moisture_and_low_prediction_keep_a_small_estimate():
    assert calculate_irrigation_requirement(**base(soil_moisture_percent=100))["recommended_irrigation_mm"] > 0
    assert calculate_irrigation_requirement(**base(prediction="LOW"))["recommended_irrigation_mm"] > 0


def test_rainfall_and_irrigation_types_are_accounted_for():
    dry = calculate_irrigation_requirement(**base(rainfall_mm=0, irrigation_type="Drip"))
    rainy = calculate_irrigation_requirement(**base(rainfall_mm=100, irrigation_type="Flood"))
    assert rainy["effective_rainfall_mm"] > 0
    assert rainy["recommended_irrigation_mm"] == 0
    assert dry["irrigation_efficiency"] > rainy["irrigation_efficiency"]


def test_crop_stage_changes_kc():
    initial = calculate_irrigation_requirement(**base(crop_growth_stage="Sowing"))
    flowering = calculate_irrigation_requirement(**base(crop_growth_stage="Flowering"))
    assert initial["kc"] != flowering["kc"]
