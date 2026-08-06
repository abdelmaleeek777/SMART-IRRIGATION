from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator

IRRIGATION_TYPES = {"Drip", "Rainfed", "Sprinkler", "Canal"}
CROP_GROWTH_STAGES = {"Sowing", "Vegetative", "Flowering", "Harvest"}


class ParcelleCreate(BaseModel):
    id_exploitation: int
    nom: str = Field(min_length=1, max_length=100)
    type_sol: str = Field(min_length=1, max_length=100)
    type_culture: str = Field(min_length=1, max_length=100)
    superficie: float = Field(gt=0)
    organic_carbon: float | None = Field(default=None)
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    irrigation_type: str | None = Field(default=None, max_length=30)
    crop_growth_stage: str | None = Field(default=None, max_length=30)
    mulching_used: str | None = Field(default=None, max_length=10)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    polygon: Any

    @field_validator("nom", "type_sol", "type_culture")
    @classmethod
    def validate_non_blank_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field must not be empty")
        return value

    @field_validator("organic_carbon")
    @classmethod
    def validate_organic_carbon(cls, value: float | None) -> float | None:
        if value is None:
            return None
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("organic_carbon must be numeric")
        return float(value)

    @field_validator("soil_ph")
    @classmethod
    def validate_soil_ph(cls, value: float | None) -> float | None:
        if value is None:
            return None
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("soil_ph must be numeric")
        return float(value)

    @field_validator("irrigation_type")
    @classmethod
    def validate_irrigation_type(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field must not be empty")
        if value not in IRRIGATION_TYPES:
            raise ValueError("irrigation_type must be one of: Drip, Rainfed, Sprinkler, Canal")
        return value

    @field_validator("crop_growth_stage")
    @classmethod
    def validate_crop_growth_stage(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field must not be empty")
        if value not in CROP_GROWTH_STAGES:
            raise ValueError("crop_growth_stage must be one of: Sowing, Vegetative, Flowering, Harvest")
        return value

    @field_validator("polygon")
    @classmethod
    def validate_polygon(cls, value: Any) -> Any:
        if value is None:
            raise ValueError("polygon is required")
        return value


class ParcelleUpdate(BaseModel):
    id_exploitation: int | None = None
    nom: str | None = Field(default=None, min_length=1, max_length=100)
    type_sol: str | None = Field(default=None, min_length=1, max_length=100)
    type_culture: str | None = Field(default=None, min_length=1, max_length=100)
    superficie: float | None = Field(default=None, gt=0)
    organic_carbon: float | None = Field(default=None)
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    irrigation_type: str | None = Field(default=None, max_length=30)
    crop_growth_stage: str | None = Field(default=None, max_length=30)
    mulching_used: str | None = Field(default=None, max_length=10)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    polygon: Any = None

    @field_validator("nom", "type_sol", "type_culture")
    @classmethod
    def validate_non_blank_text(cls, value: str | None) -> str | None:
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("This field must not be empty")
        return value

    @field_validator("organic_carbon")
    @classmethod
    def validate_organic_carbon(cls, value: float | None) -> float | None:
        if value is None:
            return None
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("organic_carbon must be numeric")
        return float(value)

    @field_validator("soil_ph")
    @classmethod
    def validate_soil_ph(cls, value: float | None) -> float | None:
        if value is None:
            return None
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("soil_ph must be numeric")
        return float(value)

    @field_validator("irrigation_type")
    @classmethod
    def validate_irrigation_type(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field must not be empty")
        if value not in IRRIGATION_TYPES:
            raise ValueError("irrigation_type must be one of: Drip, Rainfed, Sprinkler, Canal")
        return value

    @field_validator("crop_growth_stage")
    @classmethod
    def validate_crop_growth_stage(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("This field must not be empty")
        if value not in CROP_GROWTH_STAGES:
            raise ValueError("crop_growth_stage must be one of: Sowing, Vegetative, Flowering, Harvest")
        return value


class ParcelleReponse(BaseModel):
    id_parcelle: int
    id_exploitation: int
    nom: str
    type_sol: str
    type_culture: str
    superficie: float
    organic_carbon: float | None = None
    soil_ph: float | None = None
    irrigation_type: str | None = None
    crop_growth_stage: str | None = None
    mulching_used: str | None = None
    latitude: float
    longitude: float
    polygon: Any
    date_creation: datetime

    model_config = {"from_attributes": True}
