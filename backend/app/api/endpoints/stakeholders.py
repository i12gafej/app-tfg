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
from app.models.models import Stakeholder as StakeholderModel, SustainabilityTeamMember
from app.crud import stakeholders as crud_stakeholder
from app.services.user import check_user_permissions
import logging

# Configurar el logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/stakeholders/search", response_model=dict)
def search_stakeholders(
    search_params: StakeholderSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar grupos de interés con filtros opcionales.
    Permite el acceso si el usuario es admin o si tiene un rol asignado en el reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=search_params.report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

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

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar grupos de interés: {str(e)}"
        )

@router.post("/stakeholders/create", response_model=Stakeholder)
def create_stakeholder(
    stakeholder_data: StakeholderCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo grupo de interés.
    Solo permite la creación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=stakeholder_data.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
    
        # Verificar si el nombre ya existe para este reporte
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

@router.post("/stakeholders/update", response_model=Stakeholder)
def update_stakeholder(
    stakeholder_data: StakeholderUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un grupo de interés.
    Solo permite la actualización si el usuario es admin o si es gestor del reporte.
    """
    try:
        logger.info(f"Recibida petición de actualización de stakeholder: {stakeholder_data}")
        logger.info(f"Usuario actual: {current_user}")

        # Verificar permisos
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=stakeholder_data.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)
        
        logger.info(f"Buscando stakeholder con ID: {stakeholder_data.id}")
        db_stakeholder = crud_stakeholder.get(db, stakeholder_data.id)
        if not db_stakeholder:
            logger.warning(f"Stakeholder no encontrado con ID: {stakeholder_data.id}")
            raise HTTPException(
                status_code=404,
                detail="Grupo de interés no encontrado"
            )
    
        # Verificar que el stakeholder pertenece al reporte correcto
        if db_stakeholder.report_id != stakeholder_data.report_id:
            logger.warning(f"El stakeholder {stakeholder_data.id} no pertenece al reporte {stakeholder_data.report_id}")
            raise HTTPException(
                status_code=400,
                detail="El grupo de interés no pertenece al reporte especificado"
            )
        
        logger.info(f"Stakeholder encontrado: {db_stakeholder}")
        logger.info("Intentando actualizar stakeholder")
        updated_stakeholder = crud_stakeholder.update(db, db_stakeholder, stakeholder_data)
        logger.info(f"Stakeholder actualizado exitosamente: {updated_stakeholder}")
        return updated_stakeholder

    except Exception as e:
        logger.error(f"Error al actualizar el stakeholder: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el grupo de interés: {str(e)}"
        )

@router.delete("/stakeholders/{stakeholder_id}")
def delete_stakeholder(
    stakeholder_id: int,
    report_id: int = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un grupo de interés.
    Solo permite la eliminación si el usuario es admin o si es gestor del reporte.
    """
    try:
        # Verificar permisos
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