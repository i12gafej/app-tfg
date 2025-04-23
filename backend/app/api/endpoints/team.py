from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserSearch
from app.schemas.team import (
    ResourceSearch, 
    ReportSearch, 
    TeamMemberSearch,
    ResourceBase,
    ReportBase,
    TeamMemberBase
)
from app.schemas.auth import TokenData
from app.models.models import User as UserModel
from app.crud import team as crud_team

router = APIRouter()

@router.post("/team/users/search", response_model=dict)
def search_available_users(
    search_params: UserSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar usuarios disponibles para el equipo.
    Este endpoint siempre filtra por admin=false y no requiere permisos de administrador.
    """
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
    
    # Siempre filtrar por admin=false
    query = query.filter(UserModel.admin == False)

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

@router.post("/team/search/resources", response_model=dict)
def search_resources(
    search_params: ResourceSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar recursos patrimoniales con filtros opcionales.
    """
    result = crud_team.search_resources(db, search_params)
    
    # Convertir los recursos a esquema Pydantic
    resources_schema = [ResourceBase.from_orm(resource) for resource in result["items"]]
    
    return {
        "items": resources_schema,
        "total": result["total"],
        "page": result["page"],
        "per_page": result["per_page"],
        "total_pages": result["total_pages"]
    }

@router.post("/team/search/reports", response_model=dict)
def search_reports(
    search_params: ReportSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar reportes de un recurso patrimonial con filtros opcionales.
    """
    result = crud_team.search_reports(db, search_params)
    
    # Convertir los reportes a esquema Pydantic
    reports_schema = []
    for report in result["items"]:
        report_dict = {
            "id": report.id,
            "year": report.year,
            "heritage_resource_id": report.heritage_resource_id
        }
        reports_schema.append(ReportBase(**report_dict))
    
    return {
        "items": reports_schema,
        "total": result["total"],
        "page": result["page"],
        "per_page": result["per_page"],
        "total_pages": result["total_pages"]
    }

@router.post("/team/search/members", response_model=dict)
def search_team_members(
    search_params: TeamMemberSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar miembros del equipo de un reporte con filtros opcionales.
    """
    result = crud_team.search_team_members(db, search_params.report_id, search_params)
    
    # Convertir los miembros a esquema Pydantic
    members_schema = [TeamMemberBase.from_orm(member) for member in result["items"]]
    
    return {
        "items": members_schema,
        "total": result["total"],
        "page": result["page"],
        "per_page": result["per_page"],
        "total_pages": result["total_pages"]
    }

