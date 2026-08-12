from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(
        Integer,
        ForeignKey("parcelle.id_parcelle", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    soil_moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    sunlight_hours = Column(Float, nullable=False)
    prediction = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    previous_prediction = Column(String(50), nullable=True)
    previous_irrigation = Column(Float, nullable=True)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())
    notification_sent = Column(Boolean, default=False, nullable=False)

    parcel = relationship("Parcelle", back_populates="predictions")
