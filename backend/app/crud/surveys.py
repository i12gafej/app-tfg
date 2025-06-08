from typing import List, Optional, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.models import Assessment, SustainabilityReport, MaterialTopic, Stakeholder, HeritageResource


def create_assessments(
    db: Session,
    stakeholder_id: int,
    assessments: List[Dict],
    report_id: int,
    scale: int
) -> List[Assessment]:
    """
    Crea las evaluaciones de una encuesta.
    """
    try:
        
        report = db.query(SustainabilityReport).filter(SustainabilityReport.id == report_id).first()
        if not report or report.survey_state != 'active':
            raise ValueError("La encuesta no está activa")

        created_assessments = []
        for assessment_data in assessments:
            
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
        raise e

def search_surveys(
    db: Session,
    search_term: Optional[str] = None,
    heritage_resource_name: Optional[str] = None,
    year: Optional[str] = None
) -> List[SustainabilityReport]:
    """
    Busca encuestas.
    """
    try:
        query = db.query(
            SustainabilityReport.id,
            SustainabilityReport.heritage_resource_id,
            SustainabilityReport.year,
            SustainabilityReport.survey_state,
            SustainabilityReport.scale,
            HeritageResource.name.label('heritage_resource_name')
        ).join(
            HeritageResource, SustainabilityReport.heritage_resource_id == HeritageResource.id
        ).filter(
            SustainabilityReport.survey_state == 'active'
        )

        
        if heritage_resource_name:
            
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
            
            resources = db.query(HeritageResource).filter(
                HeritageResource.name.ilike(f"%{search_term}%")
            ).all()
            if resources:
                resource_ids = [r.id for r in resources]
                query = query.filter(SustainabilityReport.heritage_resource_id.in_(resource_ids))
            else:
                return [], 0

        return query.all()

        
    except Exception as e:
        raise e

def get_all_assessments(
    db: Session,
    report_id: int
) -> List[Assessment]:
    """
    Obtiene todas las evaluaciones de una memoria.
    """
    try:
        
        assessments = db.query(Assessment)\
            .join(MaterialTopic, Assessment.material_topic_id == MaterialTopic.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()
        
        return assessments
    except Exception as e:
        raise e
