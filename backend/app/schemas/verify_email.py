from pydantic import EmailStr
from pydantic import Field, BaseModel

class EmailVerificationRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ResendOtpRequest(BaseModel):
    email: EmailStr
