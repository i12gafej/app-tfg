from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import SustainabilityReport, HeritageResource
from app.schemas.reports import SustainabilityReportCreate, SustainabilityReportUpdate
from app.crud import resources as resources_crud

def create_report(db: Session, report: SustainabilityReportCreate) -> SustainabilityReport:
    db_report = SustainabilityReport(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def search_reports(
    db: Session,
    search_term: Optional[str] = None,
    heritage_resource_ids: Optional[List[int]] = None,
    year: Optional[int] = None,
    state: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[SustainabilityReport], int]:
    """
    Busca memorias de sostenibilidad con los filtros especificados.
    Retorna una tupla con la lista de memorias y el total de resultados.
    """
    query = db.query(SustainabilityReport)
    
    # Aplicar filtros
    if heritage_resource_ids:
        query = query.filter(SustainabilityReport.heritage_resource_id.in_(heritage_resource_ids))
    
    if year:
        query = query.filter(SustainabilityReport.year == year)
    
    if state:
        query = query.filter(SustainabilityReport.state == state)
    
    if search_term:
        query = query.filter(
            or_(
                SustainabilityReport.observation.ilike(f"%{search_term}%"),
                SustainabilityReport.mission.ilike(f"%{search_term}%"),
                SustainabilityReport.vision.ilike(f"%{search_term}%")
            )
        )
    
    # Obtener total antes de paginación
    total = query.count()
    
    # Aplicar paginación
    reports = query.offset(skip).limit(limit).all()
    
    return reports, total

def get_reports_by_resource_ids(
    db: Session,
    resource_ids: List[int],
    year: Optional[int] = None,
    state: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[SustainabilityReport], int]:
    """
    Busca memorias por una lista de IDs de recursos.
    """
    query = db.query(SustainabilityReport).filter(
        SustainabilityReport.heritage_resource_id.in_(resource_ids)
    )
    
    if year:
        query = query.filter(SustainabilityReport.year == year)
    
    if state:
        query = query.filter(SustainabilityReport.state == state)
    
    total = query.count()
    reports = query.offset(skip).limit(limit).all()
    
    return reports, total

def get_report(db: Session, report_id: int) -> Optional[SustainabilityReport]:
    return db.query(SustainabilityReport).filter(SustainabilityReport.id == report_id).first()

def update_report(db: Session, report_id: int, report: SustainabilityReportUpdate) -> Optional[SustainabilityReport]:
    db_report = get_report(db, report_id)
    if db_report:
        for key, value in report.dict(exclude_unset=True).items():
            setattr(db_report, key, value)
        db.commit()
        db.refresh(db_report)
    return db_report

def delete_report(db: Session, report_id: int) -> bool:
    db_report = get_report(db, report_id)
    if db_report:
        db.delete(db_report)
        db.commit()
        return True
    return False
