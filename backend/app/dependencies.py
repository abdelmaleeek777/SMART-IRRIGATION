# pyrefly: ignore [missing-import]
from app.database import SessionLocal
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.security import SECRET_KEY, ALGORITHM
from app.models.agriculteur import Agriculteur


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise auth_error

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        agriculteur_id = payload.get("sub")
        if agriculteur_id is None:
            raise auth_error
        try:
            agriculteur_id = int(agriculteur_id)
        except (TypeError, ValueError):
            raise auth_error
    except JWTError:
        raise auth_error

    agriculteur = (
        db.query(Agriculteur)
        .filter(Agriculteur.id_agriculteur == agriculteur_id)
        .first()
    )
    if not agriculteur:
        raise auth_error
    return agriculteur
