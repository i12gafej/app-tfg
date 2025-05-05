from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.core import security
from app.models.models import User, SustainabilityTeamMember
from app.schemas.user import UserCreate, UserUpdate
from fastapi import HTTPException

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        name=user_in.name,
        surname=user_in.surname,
        phone_number=user_in.phone_number,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user

def update_user(db: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = security.get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def check_user_permissions(
    db: Session,
    user_id: int,
    report_id: int,
    require_manager: bool = False
) -> Tuple[bool, str]:
    """
    Verifica los permisos del usuario en un reporte específico.
    
    Args:
        db: Sesión de la base de datos
        user_id: ID del usuario
        report_id: ID del reporte
        require_manager: Si es True, requiere que el usuario sea gestor
        
    Returns:
        Tuple[bool, str]: (tiene_permiso, mensaje_error)
    """
    try:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == report_id,
            SustainabilityTeamMember.user_id == user_id
        ).first()
        
        if not team_member:
            return False, "No tienes permisos para acceder a este recurso"
            
        if require_manager and team_member.type != 'manager':
            return False, "Solo los gestores pueden realizar esta acción"
            
        return True, ""
        
    except Exception as e:
        return False, f"Error al verificar permisos: {str(e)}" 