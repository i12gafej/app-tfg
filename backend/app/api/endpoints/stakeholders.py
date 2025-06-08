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
from app.crud import stakeholders as crud_stakeholder
from app.services.user import check_user_permissions
from app.schemas.stakeholders import StakeholderSearch

router = APIRouter()

@router.post("/stakeholders/search", response_model=dict)
def search_stakeholders(
    search_params: StakeholderSearch = Body(...),
    db: Session = Depends(get_db)
):
    """
    Buscar grupos de interés con filtros opcionales.
    """
    try:
        stakeholders = crud_stakeholder.search(
            db=db,
            search_term=search_params.search_term,
            name=search_params.name,
            type=search_params.type,
            report_id=search_params.report_id
        )

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

        total = len(stakeholders_schema)

        return {
            "items": stakeholders_schema,
            "total": total
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar grupos de interés: {str(e)}"
        )

@router.post("/stakeholders/create", response_model=Stakeholder)
def create_stakeholder(
    stakeholder_data: StakeholderCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo grupo de interés.
    Solo permite la creación si el usuario es admin o si es gestor del reporte.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=stakeholder_data.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
    
        
        existing_stakeholder = crud_stakeholder.get_by_name(db, stakeholder_data.name)
        if existing_stakeholder and existing_stakeholder.report_id == stakeholder_data.report_id:
            raise HTTPException(
                status_code=400,
                detail="Ya existe un grupo de interés con este nombre en este reporte"
            )
    
        new_stakeholder = crud_stakeholder.create(db, stakeholder_data)
        return new_stakeholder

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el grupo de interés: {str(e)}"
        )

@router.put("/stakeholders/update/{stakeholder_id}", response_model=Stakeholder)
def update_stakeholder(
    stakeholder_id: int,
    stakeholder_data: StakeholderUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un grupo de interés.
    Solo permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:

        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=stakeholder_data.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        db_stakeholder = crud_stakeholder.get(db, stakeholder_id)
        if not db_stakeholder:
            raise HTTPException(
                status_code=404,
                detail="Grupo de interés no encontrado"
            )
    
        
        if db_stakeholder.report_id != stakeholder_data.report_id:
            raise HTTPException(
                status_code=400,
                detail="El grupo de interés no pertenece al reporte especificado"
            )
        
        updated_stakeholder = crud_stakeholder.update(db, db_stakeholder, stakeholder_data)
        return updated_stakeholder

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el grupo de interés: {str(e)}"
        )

@router.delete("/stakeholders/delete/{stakeholder_id}")
def delete_stakeholder(
    stakeholder_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un grupo de interés.
    Solo permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
    
        db_stakeholder = crud_stakeholder.get(db, stakeholder_id)
        if not db_stakeholder:
            raise HTTPException(
                status_code=404,
                detail="Grupo de interés no encontrado"
            )
    
        crud_stakeholder.delete(db, db_stakeholder)
        return {"message": "Grupo de interés eliminado correctamente"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el grupo de interés: {str(e)}"
        )