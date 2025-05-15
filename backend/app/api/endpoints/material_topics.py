from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.material_topics import (
    MaterialTopic,
    MaterialTopicCreate,
    MaterialTopicUpdate,
    MaterialTopicSearch
)
from app.schemas.auth import TokenData
from app.models.models import MaterialTopic as MaterialTopicModel, SustainabilityTeamMember
from app.crud import material_topics as crud_material_topic
from app.graphs.materiality_matrix import create_materiality_matrix_data, generate_matrix_image
from app.services.user import check_user_permissions

router = APIRouter()



@router.post("/material-topics/search", response_model=dict)
def search_material_topics(
    search_params: MaterialTopicSearch,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar asuntos relevantes con filtros opcionales.
    """
    try:
        # Verificar si el usuario es admin o tiene un rol en el reporte
        if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=search_params.report_id
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

        # Quitar paginación: obtener todos los asuntos que cumplan los filtros
        material_topics = crud_material_topic.search(
            db=db,
            search_term=search_params.search_term,
            name=search_params.name,
            report_id=search_params.report_id,
            
        )

        # Convertir los material topics a esquema Pydantic
        material_topics_schema = [
            MaterialTopic(
                id=material_topic.id,
                name=material_topic.name,
                description=material_topic.description,
                priority=material_topic.priority,
                main_objective=material_topic.main_objective,
                goal_ods_id=material_topic.goal_ods_id,
                goal_number=material_topic.goal_number,
                report_id=material_topic.report_id
            )
            for material_topic in material_topics
        ]

        total = len(material_topics_schema)
        return {
            "items": material_topics_schema,
            "total": total,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar asuntos relevantes: {str(e)}"
        )

@router.post("/material-topics/create", response_model=MaterialTopic)
def create_material_topic(
    material_topic_data: MaterialTopicCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo asunto de materialidad.
    """
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=search_params.report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)
    
    existing_material_topic = crud_material_topic.get_by_name(db, material_topic_data.name)
    if existing_material_topic and existing_material_topic.report_id == material_topic_data.report_id:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un asunto de materialidad con este nombre en este reporte"
        )
    
    try:
        new_material_topic = crud_material_topic.create(db, material_topic_data)
        return new_material_topic
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el asunto de materialidad: {str(e)}"
        )

@router.put("/material-topics/update/{material_topic_id}", response_model=MaterialTopic)
def update_material_topic(
    material_topic_id: int,
    material_topic_data: MaterialTopicUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un asunto de materialidad.
    """
    # Obtener el asunto de materialidad existente
    db_material_topic = crud_material_topic.get(db, material_topic_id)
    if not db_material_topic:
        raise HTTPException(
            status_code=404,
            detail="asunto de materialidad no encontrado"
        )

    # Verificar si el usuario es admin o tiene un rol en el reporte
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=db_material_topic.report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)
    
    try:
        updated_material_topic = crud_material_topic.update(db, db_material_topic, material_topic_data)
        return updated_material_topic
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el asunto de materialidad: {str(e)}"
        )

@router.delete("/material-topics/delete/{material_topic_id}")
def delete_material_topic(
    material_topic_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un asunto de materialidad.
    """
    # Primero obtener el material topic para saber a qué reporte pertenece
    db_material_topic = crud_material_topic.get(db, material_topic_id)
    if not db_material_topic:
        raise HTTPException(
            status_code=404,
            detail="asunto de materialidad no encontrado"
        )

    # Verificar si el usuario es admin o tiene un rol en el reporte
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=db_material_topic.report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)
    
    try:
        crud_material_topic.delete(db, db_material_topic)
        return {"message": "asunto de materialidad eliminado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el asunto de materialidad: {str(e)}"
        )

@router.get("/material-topics/get-all/{report_id}", response_model=List[MaterialTopic])
def get_all_material_topics(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener todos los asuntos relevantes de un reporte.
    """
    try:
        material_topics = crud_material_topic.get_all_by_report(db, report_id)
        return material_topics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener asuntos relevantes: {str(e)}"
        )

@router.post("/material-topics/get/materiality-matrix", response_model=dict)
async def get_materiality_matrix(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    report_id = data.get('report_id')
    normalize = data.get('normalize', False)
    scale = data.get('scale', None)
    if report_id is None:
        raise HTTPException(status_code=400, detail="report_id es requerido")
    
    # Verificar si el usuario es admin o tiene un rol en el reporte
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)

    try:
        matrix_data = create_materiality_matrix_data(db, report_id, normalize=normalize, scale=scale)
        matrix_image = generate_matrix_image(matrix_data, scale=scale)
        return {
            "matrix_data": matrix_data,
            "matrix_image": matrix_image
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la matriz de materialidad: {str(e)}"
        )
