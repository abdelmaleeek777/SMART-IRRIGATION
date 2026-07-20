from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base


class Parcelle(Base):
    """A map-defined parcel belonging to one exploitation."""

    __tablename__ = "parcelle"

    id_parcelle = Column(Integer, primary_key=True, autoincrement=True)
    id_exploitation = Column(
        Integer,
        ForeignKey("exploitation.id_exploitation", ondelete="CASCADE"),
        nullable=False,
    )
    nom = Column(String(100), nullable=False)
    type_sol = Column(String(100), nullable=False)
    type_culture = Column(String(100), nullable=False)
    superficie = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # Stores the GeoJSON object or coordinates exactly as sent by Leaflet.
    polygon = Column(JSONB, nullable=False)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
