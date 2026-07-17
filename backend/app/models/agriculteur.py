from app.database import Base

# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, DateTime, Boolean

# pyrefly: ignore [missing-import]
from sqlalchemy.sql import func


class Agriculteur(Base):
    __tablename__ = "agriculteur"
    id_agriculteur = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    mot_de_passe = Column(String(255), nullable=False)
    email_verifie = Column(Boolean, nullable=False, default=False, server_default="false")
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
