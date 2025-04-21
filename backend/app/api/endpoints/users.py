from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserSearch
from app.schemas.auth import TokenData
from app.models.models import User as UserModel

router = APIRouter()

@router.post("/users/search", response_model=List[User])
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

    # Si hay un término de búsqueda general, busca en todos los campos
    if search_params.search_term:
        search = f"%{search_params.search_term}%"
        query = query.filter(
            or_(
                UserModel.name.ilike(search),
                UserModel.surname.ilike(search),
                UserModel.email.ilike(search)
            )
        )

    # Aplicar filtros específicos si se proporcionan
    if search_params.name:
        query = query.filter(UserModel.name.ilike(f"%{search_params.name}%"))
    if search_params.surname:
        query = query.filter(UserModel.surname.ilike(f"%{search_params.surname}%"))
    if search_params.email:
        query = query.filter(UserModel.email.ilike(f"%{search_params.email}%"))
    if search_params.is_admin is not None:
        query = query.filter(UserModel.admin == search_params.is_admin)

    users = query.all()
    return users 