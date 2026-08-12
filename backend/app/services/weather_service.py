import requests


FALLBACK_WEATHER = {
    "temperature": 25.0,
    "humidity": 50.0,
    "rainfall": 0.0,
    "wind_speed": 10.0,
    "sunlight_hours": 10.0,
}

def get_today_weather(latitude: float, longitude: float) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,rain,wind_speed_10m",
        "daily": "sunshine_duration",
        "timezone": "auto"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        daily = data.get("daily", {})
        
        temperature = current.get("temperature_2m", 25.0)
        humidity = current.get("relative_humidity_2m", 50.0)
        rainfall = current.get("rain", 0.0)
        wind_speed = current.get("wind_speed_10m", 10.0)
        
        # sunshine_duration is in seconds, convert to hours
        sunshine_duration_list = daily.get("sunshine_duration", [36000.0])
        sunshine_duration_s = sunshine_duration_list[0] if sunshine_duration_list else 36000.0
        if sunshine_duration_s is None:
            sunshine_duration_s = 36000.0
        sunlight_hours = round(sunshine_duration_s / 3600.0, 2)
        
        return {
            "temperature": float(temperature),
            "humidity": float(humidity),
            "rainfall": float(rainfall),
            "wind_speed": float(wind_speed),
            "sunlight_hours": float(sunlight_hours)
        }
    except requests.RequestException as e:
        # A temporary weather-provider/network failure should not prevent the
        # farmer from receiving an irrigation recommendation. The prediction
        # service can continue with clearly defined conservative defaults.
        print(f"Open-Meteo unavailable; using fallback weather data: {e}")
        return FALLBACK_WEATHER.copy()
    except (ValueError, TypeError, KeyError, IndexError) as e:
        print(f"Invalid Open-Meteo response; using fallback weather data: {e}")
        return FALLBACK_WEATHER.copy()
