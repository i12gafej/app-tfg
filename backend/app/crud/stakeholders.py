from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import Stakeholder
from app.schemas.stakeholders import StakeholderCreate, StakeholderUpdate


def create(db: Session, stakeholder_data: StakeholderCreate) -> Stakeholder:
    try:
        stakeholder = Stakeholder(
            name=stakeholder_data.name,
            description=stakeholder_data.description,
            type=stakeholder_data.type,
            report_id=stakeholder_data.report_id
        )
        
        db.add(stakeholder)
        db.commit()
        db.refresh(stakeholder)
        
        return stakeholder
    except Exception as e:
        raise e

def get(db: Session, stakeholder_id: int) -> Optional[Stakeholder]:
    try:
        return db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
    except Exception as e:
        return None

def get_by_name(db: Session, name: str) -> Optional[Stakeholder]:
    try:
        return db.query(Stakeholder).filter(Stakeholder.name == name).first()
    except Exception as e:
        return None

def update(db: Session, stakeholder: Stakeholder, stakeholder_data: StakeholderUpdate) -> Stakeholder:
    try:
        if hasattr(stakeholder_data, 'dict'):
            stakeholder_data = stakeholder_data.dict(exclude_unset=True)
            
        for field, value in stakeholder_data.items():
            if hasattr(stakeholder, field):
                setattr(stakeholder, field, value)
        
        db.add(stakeholder)
        db.commit()
        db.refresh(stakeholder)
        return stakeholder
    except Exception as e:
        raise e

def delete(db: Session, stakeholder: Stakeholder) -> None:
    try:
        db.delete(stakeholder)
        db.commit()
    except Exception as e:
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
        raise e

def get_all_stakeholders_by_report(db: Session, report_id: int) -> List[Stakeholder]:
    try:
        stakeholders = db.query(Stakeholder).filter(Stakeholder.report_id == report_id).all()
        return [{"name": stakeholder.name, "description": stakeholder.description, "type": stakeholder.type} for stakeholder in stakeholders]
    except Exception as e:
        raise e