from sqlalchemy.orm import Session
from app.models.parcel_profile import ParcelProfile
from app.schemas.parcel_profile import ParcelProfileCreate, ParcelProfileUpdate


def create_parcel_profile(db: Session, profile_in: ParcelProfileCreate) -> ParcelProfile:
    db_profile = ParcelProfile(
        parcel_id=profile_in.parcel_id,
        soil_type=profile_in.soil_type,
        crop_type=profile_in.crop_type,
        organic_carbon=profile_in.organic_carbon,
        soil_ph=profile_in.soil_ph,
        irrigation_type=profile_in.irrigation_type,
        crop_growth_stage=profile_in.crop_growth_stage,
        mulching_used=profile_in.mulching_used,
    )
    db.add(db_profile)
    return db_profile


def get_parcel_profile_by_parcel_id(db: Session, parcel_id: int) -> ParcelProfile | None:
    return db.query(ParcelProfile).filter(ParcelProfile.parcel_id == parcel_id).first()


def update_parcel_profile(
    db: Session, db_profile: ParcelProfile, profile_in: ParcelProfileUpdate
) -> ParcelProfile:
    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    return db_profile
