from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.stakeholders import (
    Stakeholder,
    StakeholderCreate,
    StakeholderUpdate,
    StakeholderSearch
)
from app.schemas.auth import TokenData
from app.models.models import Stakeholder as StakeholderModel
from app.crud import stakeholders as crud_stakeholder

router = APIRouter()

@router.post("/stakeholders/search", response_model=dict)
def search_stakeholders(
    search_params: StakeholderSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar grupos de interés con filtros opcionales.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    skip = (page - 1) * per_page

    stakeholders, total = crud_stakeholder.search(
        db=db,
        search_term=search_params.search_term,
        name=search_params.name,
        type=search_params.type,
        report_id=search_params.report_id,
        skip=skip,
        limit=per_page
    )

    total_pages = (total + per_page - 1) // per_page

    # Convertir los stakeholders a esquema Pydantic
    stakeholders_schema = [
        Stakeholder(
            id=stakeholder.id,
            name=stakeholder.name,
            description=stakeholder.description,
            type=stakeholder.type,
            report_id=stakeholder.report_id
        )
        for stakeholder in stakeholders
    ]

    return {
        "items": stakeholders_schema,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.post("/stakeholders/create", response_model=Stakeholder)
def create_stakeholder(
    stakeholder_data: StakeholderCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo grupo de interés.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear grupos de interés"
        )
    
    # Verificar si el nombre ya existe para este reporte
    existing_stakeholder = crud_stakeholder.get_by_name(db, stakeholder_data.name)
    if existing_stakeholder and existing_stakeholder.report_id == stakeholder_data.report_id:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un grupo de interés con este nombre en este reporte"
        )
    
    try:
        new_stakeholder = crud_stakeholder.create(db, stakeholder_data)
        return new_stakeholder
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el grupo de interés: {str(e)}"
        )

@router.post("/stakeholders/update", response_model=Stakeholder)
def update_stakeholder(
    stakeholder_id: int = Body(...),
    stakeholder_data: StakeholderUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un grupo de interés.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para actualizar grupos de interés"
        )
    
    db_stakeholder = crud_stakeholder.get(db, stakeholder_id)
    if not db_stakeholder:
        raise HTTPException(
            status_code=404,
            detail="Grupo de interés no encontrado"
        )
    
    try:
        updated_stakeholder = crud_stakeholder.update(db, db_stakeholder, stakeholder_data)
        return updated_stakeholder
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el grupo de interés: {str(e)}"
        )

@router.delete("/stakeholders/{stakeholder_id}")
def delete_stakeholder(
    stakeholder_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un grupo de interés.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar grupos de interés"
        )
    
    db_stakeholder = crud_stakeholder.get(db, stakeholder_id)
    if not db_stakeholder:
        raise HTTPException(
            status_code=404,
            detail="Grupo de interés no encontrado"
        )
    
    try:
        crud_stakeholder.delete(db, db_stakeholder)
        return {"message": "Grupo de interés eliminado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el grupo de interés: {str(e)}"
        )