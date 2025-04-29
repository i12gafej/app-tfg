from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.ods import ODS, ODSList, SecondaryImpactUpdate, SecondaryImpactResponse
from app.schemas.auth import TokenData
from app.crud import ods as crud_ods

router = APIRouter()

@router.get("/ods/get-all", response_model=ODSList)
def get_all_ods(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los ODS.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        ods_list = crud_ods.get_all_ods(db)
        return {
            "items": ods_list,
            "total": len(ods_list)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener ODS: {str(e)}"
        )

@router.get("/ods/get/secondary-impacts/{material_topic_id}", response_model=SecondaryImpactResponse)
def get_secondary_impacts(
    material_topic_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener los impactos secundarios de un asunto relevante.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        ods_ids = crud_ods.get_secondary_impacts(db, material_topic_id)
        return {
            "material_topic_id": material_topic_id,
            "ods_ids": ods_ids
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener impactos secundarios: {str(e)}"
        )

@router.put("/ods/update/secondary-impacts", response_model=SecondaryImpactResponse)
def update_secondary_impacts(
    update_data: SecondaryImpactUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar los impactos secundarios de un asunto relevante.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        crud_ods.update_secondary_impacts(
            db,
            update_data.material_topic_id,
            update_data.ods_ids
        )
        return {
            "material_topic_id": update_data.material_topic_id,
            "ods_ids": update_data.ods_ids
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar impactos secundarios: {str(e)}"
        )
