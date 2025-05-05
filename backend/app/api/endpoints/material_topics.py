from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
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

router = APIRouter()

@router.post("/material-topics/search", response_model=dict)
def search_material_topics(
    search_params: MaterialTopicSearch = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar asuntos relevantes con filtros opcionales.
    """
    # Verificar si el usuario es admin o tiene un rol en el reporte
    if not current_user.admin:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == search_params.report_id,
            SustainabilityTeamMember.user_id == current_user.id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=403,
                    detail="No tienes permisos para acceder a los asuntos relevantes"
            )

    # Paginación
    page = search_params.page or 1
    per_page = search_params.per_page or 10
    skip = (page - 1) * per_page

    material_topics, total = crud_material_topic.search(
        db=db,
        search_term=search_params.search_term,
        name=search_params.name,
        report_id=search_params.report_id,
        skip=skip,
        limit=per_page
    )

    total_pages = (total + per_page - 1) // per_page

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

    return {
        "items": material_topics_schema,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

@router.post("/material-topics/create", response_model=MaterialTopic)
def create_material_topic(
    material_topic_data: MaterialTopicCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo asunto relevante.
    """
    # Verificar si el usuario es admin o gestor del reporte
    if not current_user.admin:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == material_topic_data.report_id,
            SustainabilityTeamMember.user_id == current_user.id,
            SustainabilityTeamMember.type == 'manager'
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para crear asuntos relevantes"
            )
    
    # Verificar si el nombre ya existe para este reporte
    existing_material_topic = crud_material_topic.get_by_name(db, material_topic_data.name)
    if existing_material_topic and existing_material_topic.report_id == material_topic_data.report_id:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un asunto relevante con este nombre en este reporte"
        )
    
    try:
        new_material_topic = crud_material_topic.create(db, material_topic_data)
        return new_material_topic
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear el asunto relevante: {str(e)}"
        )

@router.post("/material-topics/update", response_model=MaterialTopic)
def update_material_topic(
    material_topic_data: MaterialTopicUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un asunto relevante.
    """
    # Obtener el asunto relevante existente
    db_material_topic = crud_material_topic.get(db, material_topic_data.id)
    if not db_material_topic:
        raise HTTPException(
            status_code=404,
            detail="Asunto relevante no encontrado"
        )

    # Verificar si el usuario es admin o gestor del reporte
    if not current_user.admin:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == db_material_topic.report_id,
            SustainabilityTeamMember.user_id == current_user.id,
            SustainabilityTeamMember.type == 'manager'
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para actualizar asuntos relevantes"
        )
    
    try:
        updated_material_topic = crud_material_topic.update(db, db_material_topic, material_topic_data)
        return updated_material_topic
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar el asunto relevante: {str(e)}"
        )

@router.delete("/material-topics/{material_topic_id}")
def delete_material_topic(
    material_topic_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un asunto relevante.
    """
    # Primero obtener el material topic para saber a qué reporte pertenece
    db_material_topic = crud_material_topic.get(db, material_topic_id)
    if not db_material_topic:
        raise HTTPException(
            status_code=404,
            detail="Asunto relevante no encontrado"
        )

    # Verificar si el usuario es admin o gestor del reporte
    if not current_user.admin:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == db_material_topic.report_id,
            SustainabilityTeamMember.user_id == current_user.id,
            SustainabilityTeamMember.type == 'manager'
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para eliminar asuntos relevantes"
        )
    
    try:
        crud_material_topic.delete(db, db_material_topic)
        return {"message": "Asunto relevante eliminado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar el asunto relevante: {str(e)}"
        )

@router.get("/material-topics/get-all/{report_id}", response_model=List[MaterialTopic])
def get_all_material_topics(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los asuntos relevantes de un reporte.
    """
    # Verificar si el usuario es admin o tiene un rol en el reporte
    if not current_user.admin:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == report_id,
            SustainabilityTeamMember.user_id == current_user.id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=403,
                    detail="No tienes permisos para acceder a los asuntos relevantes"
            )

    try:
        material_topics = crud_material_topic.get_all_by_report(db, report_id)
        return material_topics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener asuntos relevantes: {str(e)}"
        )

@router.get("/material-topics/get/materiality-matrix/{report_id}")
async def get_materiality_matrix(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener los datos de la matriz de materialidad para un reporte específico.
    """
    # Verificar si el usuario es admin o tiene un rol en el reporte
    if not current_user.admin:
        # Buscar el rol del usuario en el reporte
        team_member = db.query(SustainabilityTeamMember).filter(
            SustainabilityTeamMember.report_id == report_id,
            SustainabilityTeamMember.user_id == current_user.id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para acceder a la matriz de materialidad"
            )

    try:
        # Obtener los datos de la matriz
        matrix_data = create_materiality_matrix_data(db, report_id)
        
        # Generar la imagen de la matriz
        matrix_image = generate_matrix_image(matrix_data)
        
        return {
            "matrix_data": matrix_data,
            "matrix_image": matrix_image
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la matriz de materialidad: {str(e)}"
        )
