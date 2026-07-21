from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ParcelleCreate(BaseModel):
    id_exploitation: int
    nom: str = Field(min_length=1, max_length=100)
    type_sol: str = Field(min_length=1, max_length=100)
    type_culture: str = Field(min_length=1, max_length=100)
    superficie: float = Field(gt=0)
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


class ParcelleReponse(BaseModel):
    id_parcelle: int
    id_exploitation: int
    nom: str
    type_sol: str
    type_culture: str
    superficie: float
    latitude: float
    longitude: float
    polygon: Any
    date_creation: datetime

    model_config = {"from_attributes": True}
