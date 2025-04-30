from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.ods import ODS, ODSList, SecondaryImpactUpdate, SecondaryImpactResponse, DimensionResponse
from app.schemas.auth import TokenData
from app.crud import ods as crud_ods
from app.crud import material_topics as crud_material_topics
from app.graphs.main_secondary_impacts import (
    get_main_impacts_material_topics_graph,
    get_secondary_impacts_material_topics_graph
)
import logging

logger = logging.getLogger(__name__)

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

@router.get("/ods/get/all-secondary-impacts/{report_id}")
def get_all_secondary_impacts(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los impactos secundarios de un reporte.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        secondary_impacts = crud_ods.get_all_secondary_impacts_by_report(db, report_id)
        return secondary_impacts
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener impactos secundarios: {str(e)}"
        )

@router.get("/ods/get/main-impacts-graph/{report_id}")
def get_main_impacts_graph(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la gráfica de impactos principales de un reporte.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        # Obtener todos los material topics del reporte
        material_topics = crud_material_topics.get_all_by_report(db, report_id)
        
        # Generar la gráfica
        graph_data_url = get_main_impacts_material_topics_graph(material_topics)
        
        return {"graph_data_url": graph_data_url}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la gráfica de impactos principales: {str(e)}"
        )

@router.get("/ods/get/secondary-impacts-graph/{report_id}")
def get_secondary_impacts_graph(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener la gráfica de impactos secundarios de un reporte.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        # Obtener todos los impactos secundarios del reporte
        secondary_impacts = crud_ods.get_all_secondary_impacts_by_report(db, report_id)
        
        # Generar la gráfica
        graph_data_url = get_secondary_impacts_material_topics_graph(secondary_impacts)
        
        return {"graph_data_url": graph_data_url}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la gráfica de impactos secundarios: {str(e)}"
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

@router.get("/ods/get-all/dimensions", response_model=DimensionResponse)
async def get_all_dimensions(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtiene todas las dimensiones de los ODS con sus ODS correspondientes.
    """
    try:
        ods_by_dimension = crud_ods.get_all_ods_with_dimension(db)
        
        # Convertir el diccionario a la estructura de respuesta esperada
        dimensions = []
        for dimension_name, ods_list in ods_by_dimension.items():
            dimensions.append({
                "name": dimension_name,
                "description": f"ODS relacionados con la dimensión {dimension_name}",
                "ods": ods_list
            })
        
        return {"dimensions": dimensions}
    except Exception as e:
        logger.error(f"Error al obtener dimensiones: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener dimensiones: {str(e)}"
        )
