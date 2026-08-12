from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class PredictRequest(BaseModel):
    parcel_id: int
    soil_moisture: float
    previous_irrigation: Optional[float] = 62.3


class WeatherInfo(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    sunlight_hours: float

class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    recommendation_message: str
    timestamp: datetime
    previous_prediction: Optional[str] = None
    previous_irrigation: Optional[float] = None
    parcel_name: str
    weather: WeatherInfo
    probabilities: Optional[dict] = None

class LatestPredictionInfo(BaseModel):
    prediction: str
    confidence: float
    predicted_at: datetime

class ParcelOptionResponse(BaseModel):
    id_parcelle: int
    nom: str
    superficie: float
    latitude: float
    longitude: float
    soil_type: Optional[str] = None
    crop_type: Optional[str] = None
    organic_carbon: Optional[float] = None
    soil_ph: Optional[float] = None
    crop_growth_stage: Optional[str] = None
    irrigation_type: Optional[str] = None
    mulching_used: Optional[str] = None
    nom_exploitation: Optional[str] = None
    latest_prediction: Optional[LatestPredictionInfo] = None

class HistoryRecordResponse(BaseModel):
    id: int
    soil_moisture: float
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    sunlight_hours: float
    prediction: str
    confidence: float
    previous_prediction: Optional[str] = None
    previous_irrigation: Optional[float] = None
    predicted_at: datetime
    notification_sent: bool
