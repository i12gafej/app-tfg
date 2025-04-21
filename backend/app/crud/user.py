from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import verify_password
from app.models.models import User
import logging

logger = logging.getLogger(__name__)


def authenticate(db: Session, *, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

def get_by_email(db: Session, *, email: str) -> Optional[User]:
    """
    Get a user by email
    """
    try:    
        # Realizar la búsqueda específica
        query = db.query(User).filter(User.email == email)
           
        user = query.first()
        
        return user
    except Exception as e:
        logger.error(f"Error al buscar usuario: {str(e)}")
        logger.exception("Traceback completo:")
        return None

def create(db: Session, *, user_data: dict) -> User:
    """
    Create a new user
    """
    try:
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear usuario: {str(e)}")
        raise 