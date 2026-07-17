from pwdlib import PasswordHash 

password_hash = PasswordHash.recommended()

def hash_password(password: str) :
    return password_hash.hash(password)

def hash_otp(otp: str):
    return password_hash.hash(otp)

def verify_otp(otp: str, hashed_otp: str):
    return password_hash.verify(otp, hashed_otp)    