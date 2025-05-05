from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app import crud
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal
from app.schemas.auth import TokenData
from app.models.models import SustainabilityTeamMember

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.user.get_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return TokenData(id=user.id, email=email, admin=user.admin)

async def get_user_report_role(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Optional[SustainabilityTeamMember]:
    """
    Obtiene el rol del usuario actual en una memoria específica.
    """
    if current_user.admin:
        return None  # Los admins no necesitan verificación de rol
    
    team_member = db.query(SustainabilityTeamMember).filter(
        SustainabilityTeamMember.report_id == report_id,
        SustainabilityTeamMember.user_id == current_user.id
    ).first()
    
    return team_member

def check_report_access(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
    team_member: Optional[SustainabilityTeamMember] = Depends(get_user_report_role)
) -> bool:
    """
    Verifica si el usuario tiene acceso a una memoria específica.
    """
    if current_user.admin:
        return True
    
    if not team_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a esta memoria"
        )
    
    return True

def check_report_edit_access(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
    team_member: Optional[SustainabilityTeamMember] = Depends(get_user_report_role)
) -> bool:
    """
    Verifica si el usuario tiene permisos de edición en una memoria específica.
    """
    if current_user.admin:
        return True
    
    if not team_member or team_member.type != 'manager':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar esta memoria"
        )
    
    return True 