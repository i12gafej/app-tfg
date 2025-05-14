from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.security import verify_password
from app.models.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
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

def create(db: Session, user_data: UserCreate) -> User:
    try:
        # Hashear la contraseña
        hashed_password = get_password_hash(user_data.password)
        
        # Crear el objeto de usuario
        db_user = User(
            name=user_data.name,
            surname=user_data.surname,
            email=user_data.email,
            password=hashed_password,
            admin=user_data.admin,
            phone_number=user_data.phone_number
        )
        
        # Guardar en la base de datos
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except Exception as e:
        db.rollback()
        raise e

def get(db: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID
    """
    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        logger.error(f"Error al obtener usuario: {str(e)}")
        return None

def update(db: Session, db_user: User, user_data: dict) -> User:
    """
    Update a user
    """
    try:
        # Convertir el objeto Pydantic a diccionario si es necesario
        if hasattr(user_data, 'dict'):
            user_data = user_data.dict(exclude_unset=True)
            
        for field, value in user_data.items():
            if hasattr(db_user, field):
                setattr(db_user, field, value)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar usuario: {str(e)}")
        raise 

def delete(db: Session, db_user: User) -> None:
    """
    Eliminar un usuario de la base de datos.
    """
    try:
        db.delete(db_user)
        db.commit()
    except Exception as e:
        db.rollback()
        logging.error(f"Error al eliminar usuario: {str(e)}")
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
    Buscar usuarios con filtros opcionales.
    """
    query = db.query(User)

    def normalize_text(text: str) -> Optional[str]:
        if not text or text.isspace():
            return None
        return text.strip()

    # Filtro por término de búsqueda general
    if search_term:
        search = normalize_text(search_term)
        if search:
            search = f"%{search}%"
            query = query.filter(
                User.name.ilike(search) |
                User.surname.ilike(search) |
                User.email.ilike(search)
            )

    # Filtros específicos
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