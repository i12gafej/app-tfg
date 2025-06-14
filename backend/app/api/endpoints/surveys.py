from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db, get_current_user
from app.schemas.auth import TokenData
from app.schemas.surveys import (
    Assessment,
    AssessmentCreate,
    MultipleAssessmentsCreate,
    SurveySearch,
    Survey
)
from app.crud import surveys as crud_surveys

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
        
        assesments_schema = [ Assessment(
                id=assesment.id,
                stakeholder_id=assesment.stakeholder_id,
                material_topic_id=assesment.material_topic_id,
                score=assesment.score
            ) 
            for assesment in created_assessments
        ]

        return {
            "items": assesments_schema,
            "total": len(assesments_schema)
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
async def search_surveys(
    search_params: SurveySearch,
    db: Session = Depends(get_db)
):
    """
    Buscar encuestas privadas activas con filtros opcionales.
    """
    try:

        
        year = str(search_params.year) if search_params.year is not None else None
            
        
        reports = crud_surveys.search_surveys(
            db=db,
            search_term=search_params.search_term,
            heritage_resource_name=search_params.heritage_resource_name,
            year=year
        )

        
        surveys = [
            Survey(
                id=report.id,
                heritage_resource_id=report.heritage_resource_id,
                heritage_resource_name=report.heritage_resource_name,
                year=str(report.year),
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
        raise HTTPException(
            status_code=500,
            detail=f"Error al buscar encuestas privadas: {str(e)}"
        )

@router.get("/survey/get-all/assessments/{report_id}", response_model=List[Assessment])
def get_all_assessments(
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
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener valoraciones: {str(e)}"
        )
