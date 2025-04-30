from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.schemas.auth import TokenData
from app.schemas.surveys import (
    Assessment,
    AssessmentResponse,
    AssessmentSearch,
    MultipleAssessmentsCreate,
    PrivateSurveySearch,
    PrivateSurveyResponse,
    PrivateSurvey
)
from app.crud import surveys as crud_surveys
from app.models.models import HeritageResource
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/survey/create/assessments", response_model=AssessmentResponse)
def create_assessments(
    assessments_data: MultipleAssessmentsCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear múltiples valoraciones para una encuesta.
    """
    try:
        created_assessments = crud_surveys.create_assessments(
            db,
            assessments_data.stakeholder_id,
            assessments_data.assessments,
            assessments_data.report_id,
            scale=5  # TODO: Obtener scale del reporte
        )
        return {
            "items": created_assessments,
            "total": len(created_assessments)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear las valoraciones: {str(e)}"
        )

@router.get("/survey/search/assessments", response_model=AssessmentResponse)
def search_assessments(
    search_params: AssessmentSearch = Depends(),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar valoraciones según diferentes criterios.
    """
    if not current_user.admin:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción"
        )

    try:
        assessments = crud_surveys.search_assessments(
            db,
            material_topic_id=search_params.material_topic_id,
            stakeholder_id=search_params.stakeholder_id,
            is_internal=search_params.is_internal
        )
        return {
            "items": assessments,
            "total": len(assessments)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar valoraciones: {str(e)}"
        )

@router.post("/surveys/search/private", response_model=PrivateSurveyResponse)
async def search_private_surveys_endpoint(
    search_params: PrivateSurveySearch,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Buscar encuestas privadas activas con filtros opcionales.
    """
    try:
        # Calcular skip para la paginación
        skip = (search_params.page - 1) * search_params.per_page

        # Convertir el año a string si es un número
        year = str(search_params.year) if search_params.year is not None else None

        # Buscar las encuestas
        reports, total = crud_surveys.search_private_surveys(
            db=db,
            search_term=search_params.search_term,
            heritage_resource_name=search_params.heritage_resource_name,
            year=year,
            skip=skip,
            limit=search_params.per_page
        )

        # Obtener los recursos asociados a las memorias
        resource_ids = [report.heritage_resource_id for report in reports]
        resources = db.query(HeritageResource).filter(HeritageResource.id.in_(resource_ids)).all()
        
        # Crear un diccionario para acceder rápidamente a los recursos por ID
        resources_dict = {resource.id: resource for resource in resources}

        # Convertir los reportes a esquema Pydantic
        surveys = [
            PrivateSurvey(
                id=report.id,
                heritage_resource_id=report.heritage_resource_id,
                heritage_resource_name=resources_dict.get(report.heritage_resource_id).name if report.heritage_resource_id in resources_dict else None,
                year=str(report.year),  # Asegurarnos de que el año es string
                survey_state=report.survey_state
            )
            for report in reports
        ]

        return {
            "items": surveys,
            "total": total,
            "page": search_params.page,
            "per_page": search_params.per_page,
            "total_pages": (total + search_params.per_page - 1) // search_params.per_page
        }

    except Exception as e:
        logger.error(f"Error al buscar encuestas privadas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar encuestas privadas: {str(e)}"
        )

@router.get("/survey/get-all/assessments/{report_id}", response_model=List[Assessment])
def get_all_assessments_endpoint(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las valoraciones para un reporte específico.
    """
    try:
        assessments = crud_surveys.get_all_assessments(db=db, report_id=report_id)
        return assessments
    except Exception as e:
        logger.error(f"Error al obtener valoraciones: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener valoraciones: {str(e)}"
        )
