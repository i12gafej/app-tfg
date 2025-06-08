from typing import Optional, List
from sqlalchemy.orm import Session
from app.services.security import verify_password
from app.models.models import User
from app.schemas.user import UserCreate
from app.services.security import get_password_hash
from datetime import datetime, timedelta
import secrets
import logging


def authenticate(db: Session, *, email: str, password: str) -> Optional[User]:
    """
    Autentica un usuario por email y contraseña.
    """
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user
    except Exception as e:
        raise e

import logging

logger = logging.getLogger(__name__)

def get_by_email(db: Session, *, email: str) -> Optional[User]:
    """
    Obtiene un usuario por email.
    """
    try:    
        logger.info(f"Buscando usuario por email: {email}")
        
        query = db.query(User).filter(User.email == email)
           
        return query.first()
    except Exception as e:
        logger.error(f"Error al buscar usuario por email: {str(e)}")
        raise e

def create(db: Session, user_data: UserCreate) -> User:
    try:
        
        hashed_password = get_password_hash(user_data.password)
        
        
        user = User(
            name=user_data.name,
            surname=user_data.surname,
            email=user_data.email,
            password=hashed_password,
            admin=user_data.admin,
            phone_number=user_data.phone_number
        )
        
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    except Exception as e:
        raise e

def get(db: Session, user_id: int) -> Optional[User]:
    """
    Obtiene un usuario por ID.
    """
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        logger.error(f"Error al obtener usuario: {str(e)}")
        return None

def update(db: Session, user: User, user_data: dict) -> User:
    """
    Actualiza un usuario.
    """
    try:
        
        if hasattr(user_data, 'dict'):
            user_data = user_data.dict(exclude_unset=True)
            
        for field, value in user_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        raise e

def delete(db: Session, user: User) -> None:
    """
    Elimina un usuario de la base de datos.
    """
    try:
        db.delete(user)
        db.commit()
    except Exception as e:
        raise e 

def search(
    db: Session,
    search_term: Optional[str] = None,
    name: Optional[str] = None,
    surname: Optional[str] = None,
    email: Optional[str] = None,
    is_admin: Optional[bool] = None
) -> List[User]:
    """
    Busca usuarios con filtros opcionales.
    """
    try:
        query = db.query(User)

        def normalize_text(text: str) -> Optional[str]:
            if not text or text.isspace():
                return None
            return text.strip()

        
        if search_term:
            search = normalize_text(search_term)
            if search:
                search = f"%{search}%"
                query = query.filter(
                    User.name.ilike(search) |
                    User.surname.ilike(search) |
                    User.email.ilike(search)
                )

        
        if name:
            name_val = normalize_text(name)
            if name_val:
                query = query.filter(User.name.ilike(f"%{name_val}%"))
        if surname:
            surname_val = normalize_text(surname)
            if surname_val:
                query = query.filter(User.surname.ilike(f"%{surname_val}%"))
        if email:
            email_val = normalize_text(email)
            if email_val:
                query = query.filter(User.email.ilike(f"%{email_val}%"))
        if is_admin is not None:
            query = query.filter(User.admin == is_admin)

        return query.all() 
    except Exception as e:
        raise e

def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> Optional[User]:
    """
    Cambia la contraseña de un usuario.
    """
    try:
        user = get(db, user_id)
        if not user:
            return None
        if not verify_password(old_password, user.password):
            return None
        user.password = get_password_hash(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user 
    except Exception as e:
        print("Error al cambiar la contraseña: ", e)
        raise e

async def generate_change_password_token(db: Session, email: str) -> str:
    """
    Genera un token de cambio de contraseña.
    """
    try:
        user = get_by_email(db, email=email)
        if not user:
            return None
        
        
        token = secrets.token_urlsafe(32)
        expiration = datetime.utcnow() + timedelta(minutes=30)
        
        
        user.reset_token = token
        user.reset_token_expiration = expiration
        db.commit()
        
        return token
    except Exception as e:
        logger.error(f"Error al generar token de cambio de contraseña: {str(e)}")
        raise e

def verify_reset_token(db: Session, token: str) -> User:
    """
    Verifica un token de cambio de contraseña.
    """
    try:
        user = db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expiration > datetime.utcnow()
        ).first()
        return user
    except Exception as e:
        raise e

def reset_password(db: Session, token: str, new_password: str) -> User:
    """
    Reinicia la contraseña de un usuario.
    """
    try:
        user = db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expiration > datetime.utcnow()
        ).first()
        if not user:
            return None
        
        
        user.password = get_password_hash(new_password)
        
        
        user.reset_token = None
        user.reset_expires = None
        
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        raise e
