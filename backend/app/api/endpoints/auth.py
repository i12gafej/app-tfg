from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud
from app.api import deps
from app.services import security
from app.config import settings
from app.schemas.auth import Token, UserLogin

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    form_data: UserLogin,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Login for access token using email and password
    """
    user = crud.user.get_by_email(db, email=form_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )
    
    if not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "admin": user.admin,
            "name": user.name,
            "surname": user.surname,
            "phone_number": user.phone_number
        }
    }