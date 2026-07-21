from datetime import datetime, timedelta, timezone


from pwdlib import PasswordHash 
import os 
from dotenv import load_dotenv
from jose import jwt


load_dotenv()

password_hash = PasswordHash.recommended()

def hash_password(password: str) :
    return password_hash.hash(password)

def hash_otp(otp: str):
    return password_hash.hash(otp)

def verify_otp(otp: str, hashed_otp: str):
    return password_hash.verify(otp, hashed_otp)    

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

def verify_password(plain_password:str,hashed_password:str):
    return password_hash.verify(
        plain_password,
        hashed_password
    )

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


