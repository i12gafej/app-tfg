from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.security import verify_password
from app.models.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
import logging


def authenticate(db: Session, *, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
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

def get_by_email(db: Session, *, email: str) -> Optional[User]:
    """
    Get a user by email
    """
    try:    
        # Realizar la búsqueda específica
        query = db.query(User).filter(User.email == email)
           
        return query.first()
    except Exception as e:
        raise e

def create(db: Session, user_data: UserCreate) -> User:
    try:
        # Hashear la contraseña
        hashed_password = get_password_hash(user_data.password)
        
        # Crear el objeto de usuario
        user = User(
            name=user_data.name,
            surname=user_data.surname,
            email=user_data.email,
            password=hashed_password,
            admin=user_data.admin,
            phone_number=user_data.phone_number
        )
        
        # Guardar en la base de datos
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return user
    except Exception as e:
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

def update(db: Session, user: User, user_data: dict) -> User:
    """
    Update a user
    """
    try:
        # Convertir el objeto Pydantic a diccionario si es necesario
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
    Eliminar un usuario de la base de datos.
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
    Buscar usuarios con filtros opcionales.
    """
    try:
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
    except Exception as e:
        raise e

def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> Optional[User]:
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
        raise e