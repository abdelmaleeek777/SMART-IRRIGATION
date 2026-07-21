# pyrefly: ignore [missing-import]
from app.core import otp
from datetime import datetime
from datetime import timezone
# from IPython import core
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.models.agriculteur import Agriculteur
from app.schemas.agriculteur import AgriculteurCreate, AgriculteurReponse, AgriculteurMe
from app.core import security
from app.dependencies import get_db
from app.core.otp import generate_otp
from app.models.email_verification import EmailVerification
from app.services.email_service import send_email_verification
from app.schemas.verify_email import EmailVerificationRequest, ResendOtpRequest
from app.schemas.agriculteur import TokenResponse, LoginRequest
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/register", response_model=AgriculteurReponse, status_code=201)
def register(user: AgriculteurCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(Agriculteur).filter(Agriculteur.email == user.email).first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="L'email existe deja")
    hashed_password = security.hash_password(user.mot_de_passe)
    new_user = Agriculteur(
        nom=user.nom, prenom=user.prenom, email=user.email, mot_de_passe=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print("STEP 1: User saved")

    otp = generate_otp()
    print("STEP 2: OTP generated:", otp)

    hashed_otp = security.hash_otp(otp)
    print("STEP 3: OTP hashed")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    print("STEP 4: Expiration created")

    verification = EmailVerification(
        id_agriculteur=new_user.id_agriculteur,
        code_hash=hashed_otp,
        expires_at=expires_at,
    )
    print("STEP 5: Verification object created")

    db.add(verification)
    db.commit()
    db.refresh(verification)

    send_email_verification(new_user.email, otp)

    print("STEP 6: Verification saved")
    return new_user

@router.post("/verify-email")
def verify_email(
    data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    # 1. Find the agriculteur using their email
    agriculteur = (
        db.query(Agriculteur)
        .filter(Agriculteur.email == data.email)
        .first()
    )

    # 2. Check if the email/account exists
    if not agriculteur:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist"
        )

    # 3. Check if the email is already verified
    if agriculteur.email_verifie:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )

    # 4. Find the OTP verification record
    verification = (
        db.query(EmailVerification)
        .filter(
            EmailVerification.id_agriculteur
            == agriculteur.id_agriculteur
        )
        .first()
    )

    # 5. Check if an OTP exists
    if not verification:
        raise HTTPException(
            status_code=404,
            detail="No verification code found. Please request a new code."
        )

    # 6. Check if the OTP has expired
    if datetime.now(timezone.utc) > verification.expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired"
        )

    # 7. Verify the OTP entered by the user
    is_valid = security.verify_otp(
        data.otp,
        verification.code_hash
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code"
        )

    # 8. Mark the email as verified
    agriculteur.email_verifie = True

    # 9. Delete the OTP because it can no longer be reused
    db.delete(verification)

    # 10. Save the changes
    db.commit()

    return {
        "message": "Email verified successfully"
    }

@router.post("/resend-otp")
def resend_otp(
    data: ResendOtpRequest,
    db: Session = Depends(get_db)
):
    # 1. Find the agriculteur
    agriculteur = (
        db.query(Agriculteur)
        .filter(Agriculteur.email == data.email)
        .first()
    )

    if not agriculteur:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist"
        )

    # 2. Check if email is already verified
    if agriculteur.email_verifie:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )

    # 3. Delete old OTP if it exists
    old_verification = (
        db.query(EmailVerification)
        .filter(
            EmailVerification.id_agriculteur
            == agriculteur.id_agriculteur
        )
        .first()
    )

    if old_verification:
        db.delete(old_verification)

    # 4. Generate new OTP
    otp = generate_otp()

    # 5. Hash OTP
    hashed_otp = security.hash_otp(otp)

    # 6. New expiration time
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # 7. Create new verification record
    new_verification = EmailVerification(
        id_agriculteur=agriculteur.id_agriculteur,
        code_hash=hashed_otp,
        expires_at=expires_at
    )

    db.add(new_verification)
    db.commit()

    # 8. Send new OTP
    send_email_verification(
        agriculteur.email,
        otp
    )

    return {
        "message": "A new verification code has been sent"
    }

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest,
          db: Session = Depends(get_db)):
    agriculteur = (
        db.query(Agriculteur)
        .filter(Agriculteur.email == data.email)
        .first()
    )

    if not agriculteur:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not security.verify_password(data.mot_de_passe, agriculteur.mot_de_passe):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    if not agriculteur.email_verifie:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please verify your email before logging in."
        )
    
    access_token = security.create_access_token({
        "sub": str(agriculteur.id_agriculteur),
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=AgriculteurMe)
def get_me(
    current_user: Agriculteur = Depends(get_current_user)
):
    return {
        "id_agriculteur": current_user.id_agriculteur,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "email": current_user.email,
        "email_verifie": current_user.email_verifie,
    }