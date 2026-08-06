from datetime import datetime
from pydantic import BaseModel, Field

class ParcelProfileBase(BaseModel):
    soil_type: str = Field(min_length=1, max_length=100)
    crop_type: str = Field(min_length=1, max_length=100)
    organic_carbon: float | None = Field(default=None)
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    irrigation_type: str | None = Field(default=None, max_length=30)
    crop_growth_stage: str | None = Field(default=None, max_length=30)
    mulching_used: str | None = Field(default=None, max_length=10)

class ParcelProfileCreate(ParcelProfileBase):
    parcel_id: int

class ParcelProfileUpdate(BaseModel):
    soil_type: str | None = Field(default=None, min_length=1, max_length=100)
    crop_type: str | None = Field(default=None, min_length=1, max_length=100)
    organic_carbon: float | None = Field(default=None)
    soil_ph: float | None = Field(default=None, ge=0, le=14)
    irrigation_type: str | None = Field(default=None, max_length=30)
    crop_growth_stage: str | None = Field(default=None, max_length=30)
    mulching_used: str | None = Field(default=None, max_length=10)

class ParcelProfileResponse(ParcelProfileBase):
    id: int
    parcel_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
