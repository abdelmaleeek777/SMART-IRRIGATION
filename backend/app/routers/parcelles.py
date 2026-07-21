from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.agriculteur import Agriculteur
from app.models.exploitation import Exploitation
from app.models.parcelle import Parcelle
from app.schemas.parcelle import ParcelleCreate, ParcelleReponse

router = APIRouter(prefix="/parcelles", tags=["Parcelles"])


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
        new_parcelle = Parcelle(**parcelle.model_dump())
        db.add(new_parcelle)
        db.commit()
        db.refresh(new_parcelle)
        return new_parcelle
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to create parcel")

@router.get("/", response_model=list[ParcelleReponse])
def get_parcelles(
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    parcelles = db.query(Parcelle).join(Exploitation).filter(Exploitation.id_agriculteur == current_user.id_agriculteur).all()
    return parcelles

@router.get("/{parcelle_id}", response_model=ParcelleReponse)
def get_parcelle(
    parcelle_id:int,
    db: Session = Depends(get_db),
    current_user: Agriculteur = Depends(get_current_user)
):
    parcelle = db.query(Parcelle).join(Exploitation).filter(
        Parcelle.id_parcelle == parcelle_id,
        Exploitation.id_agriculteur == current_user.id_agriculteur
    ).first()
    if parcelle is None:
        raise HTTPException(status_code=404, detail="Parcelle not found")
    return parcelle