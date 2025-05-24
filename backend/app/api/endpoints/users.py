from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserSearch, UserUpdate, UserCreate, ChangePasswordRequest
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
    try:

        # Usar la función search del crud
        users = crud_user.search(
            db=db,
            search_term=search_params.search_term,
            name=search_params.name,
            surname=search_params.surname,
            email=search_params.email,
            is_admin=search_params.is_admin
        )
        total = len(users)

        # Convertir los usuarios a esquema Pydantic
        users_schema = [User.from_orm(user) for user in users]

        return {
                "items": users_schema,
                "total": total
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/update/{user_id}", response_model=User)
def update_user(
    user_id: int,
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
    user = crud_user.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verificar si el email ya está en uso por otro usuario
    if user_data.email and user_data.email != user.email:
        existing_user = crud_user.get_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    try:
        # Actualizar el usuario
        updated_user = crud_user.update(db, user, user_data)
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/delete/{user_id}", response_model=dict)
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
    try:
        # Verificar si el usuario existe
        user = crud_user.get(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
        # Eliminar el usuario
        crud_user.delete(db, user)
        
        return {"message": "Usuario eliminado correctamente"} 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/create", response_model=User)
def create_user(
    user_data: UserCreate = Body(...),
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
    user = crud_user.get_by_email(db, email=user_data.email)
    if user:
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

@router.put("/user/change-password", response_model=dict)
def change_password(
    data: ChangePasswordRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cambiar la contraseña de un usuario autenticado.
    """
    # Solo el propio usuario o un admin pueden cambiar la contraseña
    if not (current_user.admin or current_user.id == data.user_id):
        raise HTTPException(status_code=403, detail="No tienes permisos para cambiar esta contraseña")
    try:

        user = crud_user.change_password(db, data.user_id, data.old_password, data.new_password)
        if not user:
            raise HTTPException(status_code=400, detail="Usuario no encontrado o contraseña incorrecta")
        return {"message": "Contraseña actualizada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/verify-reset-token/{token}")
async def verify_reset_token(token: str, db: Session = Depends(get_db)):
    user = crud_user.verify_reset_token(db, token)
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    return {"email": user.email}

@router.post("/users/reset-password", response_model=dict)
async def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(get_db)
):

    try:
        user = crud_user.reset_password(db, token, new_password)
        if not user:
            raise HTTPException(status_code=400, detail="Token inválido o expirado")
        return {"message": "Contraseña actualizada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))