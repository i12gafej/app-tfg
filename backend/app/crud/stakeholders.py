from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import Stakeholder
from app.schemas.stakeholders import StakeholderCreate, StakeholderUpdate
import logging

logger = logging.getLogger(__name__)

def create(db: Session, stakeholder_data: StakeholderCreate) -> Stakeholder:
    try:
        db_stakeholder = Stakeholder(
            name=stakeholder_data.name,
            description=stakeholder_data.description,
            type=stakeholder_data.type,
            report_id=stakeholder_data.report_id
        )
        
        db.add(db_stakeholder)
        db.commit()
        db.refresh(db_stakeholder)
        
        return db_stakeholder
    except Exception as e:
        db.rollback()
        raise e

def get(db: Session, stakeholder_id: int) -> Optional[Stakeholder]:
    try:
        return db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
    except Exception as e:
        logger.error(f"Error al obtener grupo de interés: {str(e)}")
        return None

def get_by_name(db: Session, name: str) -> Optional[Stakeholder]:
    try:
        return db.query(Stakeholder).filter(Stakeholder.name == name).first()
    except Exception as e:
        logger.error(f"Error al buscar grupo de interés por nombre: {str(e)}")
        return None

def update(db: Session, db_stakeholder: Stakeholder, stakeholder_data: StakeholderUpdate) -> Stakeholder:
    try:
        if hasattr(stakeholder_data, 'dict'):
            stakeholder_data = stakeholder_data.dict(exclude_unset=True)
            
        for field, value in stakeholder_data.items():
            if hasattr(db_stakeholder, field):
                setattr(db_stakeholder, field, value)
        
        db.add(db_stakeholder)
        db.commit()
        db.refresh(db_stakeholder)
        return db_stakeholder
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar grupo de interés: {str(e)}")
        raise

def delete(db: Session, db_stakeholder: Stakeholder) -> None:
    try:
        db.delete(db_stakeholder)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error al eliminar grupo de interés: {str(e)}")
        raise e

def search(
    db: Session,
    search_term: Optional[str] = None,
    name: Optional[str] = None,
    type: Optional[str] = None,
    report_id: Optional[int] = None
) -> tuple[List[Stakeholder], int]:
    try:
        query = db.query(Stakeholder)

        if report_id:
            query = query.filter(Stakeholder.report_id == report_id)

        if search_term:
            search = f"%{search_term}%"
            query = query.filter(
                or_(
                    Stakeholder.name.ilike(search),
                    Stakeholder.description.ilike(search)
                )
            )

        if name:
            query = query.filter(Stakeholder.name.ilike(f"%{name}%"))

        if type:
            query = query.filter(Stakeholder.type == type)

        
        return query.all()
        
    except Exception as e:
        logger.error(f"Error en la búsqueda de grupos de interés: {str(e)}")
        raise