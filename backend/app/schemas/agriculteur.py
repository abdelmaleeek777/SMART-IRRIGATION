from pydantic import EmailStr, BaseModel, Field


class AgriculteurCreate(BaseModel):
    nom: str = Field(min_length=2, max_length=50)
    prenom: str = Field(min_length=2, max_length=50)
    email: EmailStr = Field(max_length=50)
    mot_de_passe: str = Field(min_length=8, max_length=50)


class AgriculteurReponse(BaseModel):
    id_agriculteur: int
    nom: str
    prenom: str
    email: EmailStr
    model_config = {"from_attributes": True}


class AgriculteurMe(AgriculteurReponse):
    email_verifie: bool


class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str = Field(min_length=8, max_length=50)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
