from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserSearch, UserUpdate, UserCreate
from app.schemas.auth import TokenData
from app.models.models import User as UserModel
from app.crud import user as crud_user

router = APIRouter()

@router.post("/users/search", response_model=dict)
def search_users(
    search_params: UserSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar usuarios con filtros opcionales.
    Si no se proporcionan filtros, devuelve todos los usuarios.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    query = db.query(UserModel)

    # Función para limpiar y normalizar el texto
    def normalize_text(text: str) -> str:
        if not text or text.isspace():
            return None
        return text.strip()

    # Aplicar filtros solo si tienen valores
    if search_params.search_term:
        search = normalize_text(search_params.search_term)
        if search:
            search = f"%{search}%"
            query = query.filter(
                or_(
                    UserModel.name.ilike(search),
                    UserModel.surname.ilike(search),
                    UserModel.email.ilike(search)
                )
            )

    # Aplicar filtros específicos solo si tienen valores
    if search_params.name:
        name = normalize_text(search_params.name)
        if name:
            query = query.filter(UserModel.name.ilike(f"%{name}%"))
    
    if search_params.surname:
        surname = normalize_text(search_params.surname)
        if surname:
            query = query.filter(UserModel.surname.ilike(f"%{surname}%"))
    
    if search_params.email:
        email = normalize_text(search_params.email)
        if email:
            query = query.filter(UserModel.email.ilike(f"%{email}%"))
    
    if search_params.is_admin is not None:
        query = query.filter(UserModel.admin == search_params.is_admin)

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    total = query.count()
    total_pages = (total + per_page - 1) // per_page

    # Aplicar paginación
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    # Convertir los usuarios a esquema Pydantic
    users_schema = [User.from_orm(user) for user in users]

    return {
        "items": users_schema,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.post("/users/update", response_model=User)
def update_user(
    user_id: int = Body(...),
    user_data: UserUpdate = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a user.
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verificar si el usuario existe
    db_user = crud_user.get(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verificar si el email ya está en uso por otro usuario
    if user_data.email and user_data.email != db_user.email:
        existing_user = crud_user.get_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Actualizar el usuario
    updated_user = crud_user.update(db, db_user, user_data)
    return updated_user

@router.delete("/users/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Eliminar un usuario.
    """
    if not current_user.admin:
        raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")
    
    # Verificar si el usuario existe
    db_user = crud_user.get(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Eliminar el usuario
    crud_user.delete(db, db_user)
    
    return {"message": "Usuario eliminado correctamente"} 

@router.post("/users/create", response_model=User)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar permisos de administrador
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear usuarios"
        )
    
    # Verificar si el email ya existe
    db_user = crud_user.get_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    try:
        # Crear el nuevo usuario
        new_user = crud_user.create(db, user_data)
        return new_user
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el usuario: {str(e)}"
        )

