from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.schemas.auth import TokenData
from app.schemas.surveys import (
    Assessment,
    MultipleAssessmentsCreate,
    SurveySearch,
    Survey
)
from app.crud import surveys as crud_surveys
from app.crud import resources as crud_resources
from app.models.models import HeritageResource
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/survey/create/assessments", response_model=dict)
def create_assessments(
    assessments_data: MultipleAssessmentsCreate,
    db: Session = Depends(get_db)
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
            assessments_data.scale
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

@router.post("/survey/search/", response_model=dict)
async def search_surveys_endpoint(
    search_params: SurveySearch,
    db: Session = Depends(get_db)
):
    """
    Buscar encuestas privadas activas con filtros opcionales.
    """
    try:

        # Convertir el año a string si es un número
        year = str(search_params.year) if search_params.year is not None else None

        # Buscar las encuestas
        reports = crud_surveys.search_surveys(
            db=db,
            search_term=search_params.search_term,
            heritage_resource_name=search_params.heritage_resource_name,
            year=year
        )

        # Convertir los reportes a esquema Pydantic
        surveys = [
            Survey(
                id=report.id,
                heritage_resource_id=report.heritage_resource_id,
                heritage_resource_name=resources_dict.get(report.heritage_resource_id).name if report.heritage_resource_id in resources_dict else None,
                year=str(report.year),  # Asegurarnos de que el año es string
                survey_state=report.survey_state,
                scale=report.scale
            )
            for report in reports
        ]

        total = len(surveys)

        return {
            "items": surveys,
            "total": total
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
