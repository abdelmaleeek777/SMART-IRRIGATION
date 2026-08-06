from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.models.agriculteur import Agriculteur
from app.models.exploitation import Exploitation
from app.models.parcelle import Parcelle
from app.models.parcel_profile import ParcelProfile
from app.schemas.parcelle import ParcelleCreate, ParcelleUpdate, ParcelleReponse

router = APIRouter(prefix="/parcelles", tags=["Parcelles"])


def serialize_parcelle(parcelle: Parcelle) -> dict:
    profile = parcelle.profile
    return {
        "id_parcelle": parcelle.id_parcelle,
        "id_exploitation": parcelle.id_exploitation,
        "nom": parcelle.nom,
        "superficie": parcelle.superficie,
        "latitude": parcelle.latitude,
        "longitude": parcelle.longitude,
        "polygon": parcelle.polygon,
        "date_creation": parcelle.date_creation,
        "type_sol": profile.soil_type if profile else None,
        "type_culture": profile.crop_type if profile else None,
        "organic_carbon": profile.organic_carbon if profile else None,
        "soil_ph": profile.soil_ph if profile else None,
        "irrigation_type": profile.irrigation_type if profile else None,
        "crop_growth_stage": profile.crop_growth_stage if profile else None,
        "mulching_used": profile.mulching_used if profile else None,
    }


@router.post("/", response_model=ParcelleReponse, status_code=status.HTTP_201_CREATED)
def create_parcelle(
    parcelle: ParcelleCreate,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user),
):
    exploitation = db.query(Exploitation).filter(
        Exploitation.id_exploitation == parcelle.id_exploitation
    ).first()
    if exploitation is None:
        raise HTTPException(status_code=404, detail="Exploitation not found")
    if exploitation.id_agriculteur != current_user.id_agriculteur:
        raise HTTPException(status_code=403, detail="You do not own this exploitation")

    try:
        # 1. Create the Parcelle record
        new_parcelle = Parcelle(
            id_exploitation=parcelle.id_exploitation,
            nom=parcelle.nom,
            superficie=parcelle.superficie,
            latitude=parcelle.latitude,
            longitude=parcelle.longitude,
            polygon=parcelle.polygon,
        )
        db.add(new_parcelle)
        db.flush()

        # 2. Create the ParcelProfile record and 3. link them using parcel_id
        new_profile = ParcelProfile(
            parcel_id=new_parcelle.id_parcelle,
            soil_type=parcelle.type_sol,
            crop_type=parcelle.type_culture,
            organic_carbon=parcelle.organic_carbon,
            soil_ph=parcelle.soil_ph,
            irrigation_type=parcelle.irrigation_type,
            crop_growth_stage=parcelle.crop_growth_stage,
            mulching_used=parcelle.mulching_used,
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_parcelle)
        return serialize_parcelle(new_parcelle)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to create parcel")


@router.get("/", response_model=list[ParcelleReponse])
def get_parcelles(
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    parcelles = db.query(Parcelle).options(joinedload(Parcelle.profile)).join(Exploitation).filter(
        Exploitation.id_agriculteur == current_user.id_agriculteur
    ).all()
    return [serialize_parcelle(p) for p in parcelles]


@router.get("/{parcelle_id}", response_model=ParcelleReponse)
def get_parcelle(
    parcelle_id: int,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    parcelle = db.query(Parcelle).options(joinedload(Parcelle.profile)).join(Exploitation).filter(
        Parcelle.id_parcelle == parcelle_id,
        Exploitation.id_agriculteur == current_user.id_agriculteur
    ).first()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle not found")
    return serialize_parcelle(parcelle)


@router.put("/{parcelle_id}", response_model=ParcelleReponse)
def update_parcelle(
    parcelle_id: int,
    parcelle_update: ParcelleUpdate,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    parcelle = db.query(Parcelle).options(joinedload(Parcelle.profile)).join(Exploitation).filter(
        Parcelle.id_parcelle == parcelle_id,
        Exploitation.id_agriculteur == current_user.id_agriculteur
    ).first()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle not found")

    update_data = parcelle_update.model_dump(exclude_unset=True)

    if "id_exploitation" in update_data and update_data["id_exploitation"] != parcelle.id_exploitation:
        target_exploitation = db.query(Exploitation).filter(
            Exploitation.id_exploitation == update_data["id_exploitation"]
        ).first()
        if target_exploitation is None:
            raise HTTPException(status_code=404, detail="Target exploitation not found")
        if target_exploitation.id_agriculteur != current_user.id_agriculteur:
            raise HTTPException(status_code=403, detail="You do not own target exploitation")

    try:
        # Update Parcelle fields
        parcel_fields = {"id_exploitation", "nom", "superficie", "latitude", "longitude", "polygon"}
        for key in parcel_fields:
            if key in update_data:
                setattr(parcelle, key, update_data[key])

        # Update ParcelProfile fields
        profile_fields = {
            "type_sol": "soil_type",
            "type_culture": "crop_type",
            "organic_carbon": "organic_carbon",
            "soil_ph": "soil_ph",
            "irrigation_type": "irrigation_type",
            "crop_growth_stage": "crop_growth_stage",
            "mulching_used": "mulching_used"
        }

        # Check if any profile field needs to be updated
        has_profile_update = any(key in update_data for key in profile_fields)
        if has_profile_update:
            if parcelle.profile is None:
                parcelle.profile = ParcelProfile(parcel_id=parcelle.id_parcelle)
                db.add(parcelle.profile)

            for key, db_field in profile_fields.items():
                if key in update_data:
                    setattr(parcelle.profile, db_field, update_data[key])

        db.commit()
        db.refresh(parcelle)
        return serialize_parcelle(parcelle)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to update parcel")


@router.delete("/{parcelle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_parcelle(
    parcelle_id: int,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    parcelle = db.query(Parcelle).join(Exploitation).filter(
        Parcelle.id_parcelle == parcelle_id,
        Exploitation.id_agriculteur == current_user.id_agriculteur
    ).first()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle not found")

    try:
        db.delete(parcelle)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to delete parcel")