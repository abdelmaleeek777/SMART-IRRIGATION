from pydantic import EmailStr
from pydantic import BaseModel
from pydantic import Field


# Data received from the frontend
class AgriculteurCreate(BaseModel):
    nom: str = Field(min_length=2, max_length=50)
    prenom: str = Field(min_length=2, max_length=50)
    email: EmailStr = Field(max_length=50)
    mot_de_passe: str = Field(min_length=8, max_length=50)


# Data returned to the frontend
class AgriculteurReponse(BaseModel):
    id_agriculteur: int
    nom: str
    prenom: str
    email: EmailStr
