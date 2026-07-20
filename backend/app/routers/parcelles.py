from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.exploitation import Exploitation
from app.models.parcelle import Parcelle
from app.schemas.parcelle import ParcelleCreate, ParcelleReponse

router = APIRouter(prefix="/parcelles", tags=["Parcelles"])


@router.post("/", response_model=ParcelleReponse, status_code=status.HTTP_201_CREATED)
def create_parcelle(parcelle: ParcelleCreate, db: Session = Depends(get_db)):
    """Create a parcel after confirming that its exploitation exists."""
    exploitation = (
        db.query(Exploitation)
        .filter(Exploitation.id_exploitation == parcelle.id_exploitation)
        .first()
    )
    if exploitation is None:
        raise HTTPException(status_code=404, detail="Exploitation not found")

    try:
        new_parcelle = Parcelle(**parcelle.model_dump())
        db.add(new_parcelle)
        db.commit()
        db.refresh(new_parcelle)
        return new_parcelle
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create parcel",
        )
