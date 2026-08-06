from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class ParcelProfile(Base):
    """Agricultural and soil information for a parcel."""

    __tablename__ = "parcelle_profile"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(
        Integer,
        ForeignKey("parcelle.id_parcelle", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    soil_type = Column(String(100), nullable=False)
    crop_type = Column(String(100), nullable=False)
    organic_carbon = Column(Float, nullable=True)
    soil_ph = Column(Float, nullable=True)
    irrigation_type = Column(String(30), nullable=True)
    crop_growth_stage = Column(String(30), nullable=True)
    mulching_used = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationship back to Parcelle
    parcel = relationship("Parcelle", back_populates="profile")
