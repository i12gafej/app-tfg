from typing import List, Optional, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.models import Assessment, SustainabilityReport, MaterialTopic, Stakeholder, HeritageResource
import logging

logger = logging.getLogger(__name__)

def create_assessments(
    db: Session,
    stakeholder_id: int,
    assessments: List[Dict],
    report_id: int,
    scale: int
) -> List[Assessment]:
    try:
        # Verificar que la encuesta está activa
        report = db.query(SustainabilityReport).filter(SustainabilityReport.id == report_id).first()
        if not report or report.survey_state != 'active':
            raise ValueError("La encuesta no está activa")

        created_assessments = []
        for assessment_data in assessments:
            # Verificar que el score está en el rango permitido
            score = assessment_data['score']
            if score < 1 or score > scale:
                raise ValueError(f"Score {score} fuera del rango permitido [1,{scale}]")
            
            assessment = Assessment(
                material_topic_id=assessment_data['material_topic_id'],
                stakeholder_id=stakeholder_id,
                score=score
            )
            db.add(assessment)
            created_assessments.append(assessment)
        
        db.commit()
        return created_assessments
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear valoraciones: {str(e)}")
        raise

def search_assessments(
    db: Session,
    material_topic_id: Optional[int] = None,
    stakeholder_id: Optional[int] = None,
    is_internal: Optional[bool] = None
) -> List[Assessment]:
    try:
        query = db.query(Assessment)

        if material_topic_id is not None:
            query = query.filter(Assessment.material_topic_id == material_topic_id)
        
        if stakeholder_id is not None:
            query = query.filter(Assessment.stakeholder_id == stakeholder_id)
        
        if is_internal is not None:
            query = query.join(Stakeholder).filter(Stakeholder.is_internal == is_internal)

        return query.all()
    except Exception as e:
        logger.error(f"Error al buscar valoraciones: {str(e)}")
        raise

def search_private_surveys(
    db: Session,
    search_term: Optional[str] = None,
    heritage_resource_name: Optional[str] = None,
    year: Optional[str] = None,
    skip: int = 0,
    limit: int = 10
) -> Tuple[List[SustainabilityReport], int]:
    try:
        query = db.query(SustainabilityReport).filter(SustainabilityReport.survey_state == 'active')

        # Aplicar filtros si se proporcionan
        if heritage_resource_name:
            # Buscar recursos por nombre
            resources = db.query(HeritageResource).filter(
                HeritageResource.name.ilike(f"%{heritage_resource_name}%")
            ).all()
            if resources:
                resource_ids = [r.id for r in resources]
                query = query.filter(SustainabilityReport.heritage_resource_id.in_(resource_ids))
            else:
                return [], 0

        if year:
            query = query.filter(SustainabilityReport.year == year)

        if search_term:
            # Buscar en recursos por nombre
            resources = db.query(HeritageResource).filter(
                HeritageResource.name.ilike(f"%{search_term}%")
            ).all()
            if resources:
                resource_ids = [r.id for r in resources]
                query = query.filter(SustainabilityReport.heritage_resource_id.in_(resource_ids))
            else:
                return [], 0

        # Obtener el total antes de aplicar la paginación
        total = query.count()

        # Aplicar paginación
        reports = query.offset(skip).limit(limit).all()

        return reports, total
    except Exception as e:
        logger.error(f"Error al buscar encuestas privadas: {str(e)}")
        raise

def get_all_assessments(
    db: Session,
    report_id: int
) -> List[Assessment]:
    try:
        # Obtener todas las valoraciones para los asuntos relevantes del reporte
        assessments = db.query(Assessment)\
            .join(MaterialTopic, Assessment.material_topic_id == MaterialTopic.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()
        
        return assessments
    except Exception as e:
        logger.error(f"Error al obtener todas las valoraciones: {str(e)}")
        raise
