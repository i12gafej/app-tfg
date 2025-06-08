from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.schemas.user import User, UserSearch, UserCreate
from app.schemas.team import (
    TeamMemberSearch,
    TeamMemberBase,
    TeamMemberCreate,
    TeamMemberCreateParams,
    TeamMemberList,
    TeamMemberUpdate
)
from app.schemas.auth import TokenData
from app.crud import team as crud_team
from app.crud import user as crud_user

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
    try:
        users = crud_team.search_available_users(
            db=db,
            search_term=search_params.search_term,
            name=search_params.name,
            surname=search_params.surname,
            email=search_params.email
            )
        
        total = len(users)

        users_schema = [User.from_orm(user) for user in users]

        return {
            "items": users_schema,
            "total": total
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/team/search/members", response_model=dict)
def search_team_members(
    search_params: TeamMemberSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar miembros del equipo de un reporte con filtros opcionales.
    Carga los datos de usuario para cada miembro del equipo.
    """
    try:
        result = crud_team.search_team_members(db, search_params.report_id, search_params)
        role_mapping = {
            'manager': 'Gestor de Sostenibilidad',
            'consultant': 'Consultor',
            'external_advisor': 'Asesor Externo'
        }
        members_with_user_data = []
        for member in result:
            user = crud_user.get(db, member.user_id)
            if user:
                member_dict = {
                    "id": member.id,
                    "name": user.name,
                    "surname": user.surname,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "role": role_mapping.get(member.type, member.type),
                    "organization": member.organization,
                    "report_id": member.report_id,
                    "user_id": member.user_id
                }
                members_with_user_data.append(TeamMemberList(**member_dict))
        total = len(members_with_user_data)
        return {
            "items": members_with_user_data,
            "total": total
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/team/create/member", response_model=TeamMemberBase)
def create_team_member(
    data: TeamMemberCreateParams = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo miembro del equipo de sostenibilidad.
    Primero crea el usuario y luego crea el miembro del equipo asociado.
    """
    try:
        
        
        existing_user = crud_user.get_by_email(db, email=data.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="El correo electrónico ya está en uso"
            )
        

        
        user_create = UserCreate(
            name=data.name,
            surname=data.surname,
            email=data.email,
            password=data.password,
            admin=False,
            phone_number=data.phone_number
        )
        
        user = crud_user.create(db, user_create)

        
        role_mapping = {
            'Gestor de Sostenibilidad': 'manager',
            'Consultor': 'consultant',
            'Asesor Externo': 'external_advisor'
        }
        member_type = role_mapping.get(data.role)
        if not member_type:
            raise HTTPException(
                status_code=400,
                detail="Rol no válido"
            )
        
        
        team_member_data = TeamMemberCreate(
            report_id=data.report_id,
            user_id=user.id,
            role=member_type,
            organization=data.organization
        )
        
        team_member = crud_team.create_team_member(db, team_member_data)

        return team_member
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.put("/team/update/member/{member_id}", response_model=TeamMemberBase)
def update_team_member(
    member_id: int,
    update_data: TeamMemberUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un miembro del equipo de sostenibilidad.
    """
    try:
        
        role_mapping = {
            'Gestor de Sostenibilidad': 'manager',
            'Consultor': 'consultant',
            'Asesor Externo': 'external_advisor'
        }
        member_type = role_mapping.get(update_data.role)
        if not member_type:
            raise HTTPException(
                status_code=400,
                detail="Rol no válido"
            )

        
        update_dict = {
            "role": member_type,
            "organization": update_data.organization
        }
        member = crud_team.update_team_member(db, member_id, update_dict)
        return member
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

@router.delete("/team/delete/member/{member_id}")
def delete_team_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un miembro del equipo de sostenibilidad.
    """
    try:
        crud_team.delete_team_member(db, member_id)
        return {"message": "Miembro eliminado correctamente"}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

@router.post("/team/assign/member", response_model=TeamMemberBase)
def assign_team_member(
    data: TeamMemberCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Asignar un usuario existente como miembro del equipo de sostenibilidad.
    """
    try:
        
        role_mapping = {
            'Gestor de Sostenibilidad': 'manager',
            'Consultor': 'consultant',
            'Asesor Externo': 'external_advisor'
        }
        member_type = role_mapping.get(data.role)
        if not member_type:
            raise HTTPException(
                status_code=400,
                detail="Rol no válido"
            )

        
        team_member_data = TeamMemberCreate(
            report_id=data.report_id,
            user_id=data.user_id,
            role=member_type,
            organization=data.organization
        )
        team_member = crud_team.create_team_member(db, team_member_data)
        return team_member
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

