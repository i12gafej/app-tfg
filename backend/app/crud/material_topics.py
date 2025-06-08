from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import MaterialTopic
from app.schemas.material_topics import MaterialTopicCreate, MaterialTopicUpdate

def create(db: Session, material_topic_data: MaterialTopicCreate) -> MaterialTopic:
    """
    Crea un asunto de materialidad.
    """
    try:
        db_material_topic = MaterialTopic(
            name=material_topic_data.name,
            description=material_topic_data.description,
            priority=material_topic_data.priority,
            main_objective=material_topic_data.main_objective,
            goal_ods_id=material_topic_data.goal_ods_id,
            goal_number=material_topic_data.goal_number,
            report_id=material_topic_data.report_id
        )
        
        db.add(db_material_topic)
        db.commit()
        db.refresh(db_material_topic)
        
        return db_material_topic
    except Exception as e:
        raise e

def get(db: Session, material_topic_id: int) -> Optional[MaterialTopic]:
    """
    Obtiene un asunto de materialidad.
    """
    try:
        return db.query(MaterialTopic).filter(MaterialTopic.id == material_topic_id).first()
    except Exception as e:
        return None

def get_by_name(db: Session, name: str) -> Optional[MaterialTopic]:
    """
    Obtiene un asunto de materialidad por su nombre.
    """
    try:
        return db.query(MaterialTopic).filter(MaterialTopic.name == name).first()
    except Exception as e:
        return None

def update(db: Session, db_material_topic: MaterialTopic, material_topic_data: MaterialTopicUpdate) -> MaterialTopic:
    """
    Actualiza un asunto de materialidad.
    """
    try:
        if hasattr(material_topic_data, 'dict'):
            material_topic_data = material_topic_data.dict(exclude_unset=True)

        if (
            ('goal_ods_id' in material_topic_data and material_topic_data['goal_ods_id'] is None)
        ):
            material_topic_data['goal_ods_id'] = None
            material_topic_data['goal_number'] = None

        for field, value in material_topic_data.items():
            if hasattr(db_material_topic, field):
                setattr(db_material_topic, field, value)
        
        db.add(db_material_topic)
        db.commit()
        db.refresh(db_material_topic)
        return db_material_topic
    except Exception as e:
        raise e

def delete(db: Session, db_material_topic: MaterialTopic) -> None:
    """
    Elimina un asunto de materialidad.
    """
    try:
        db.delete(db_material_topic)
        db.commit()
    except Exception as e:
        raise e

def search(
    db: Session,
    search_term: Optional[str] = None,
    name: Optional[str] = None,
    report_id: Optional[int] = None,
) -> tuple[List[MaterialTopic], int]:
    """
    Busca asuntos de materialidad.
    """
    try:
        query = db.query(MaterialTopic)

        if report_id:
            query = query.filter(MaterialTopic.report_id == report_id)

        if search_term:
            search = f"%{search_term}%"
            query = query.filter(
                or_(
                    MaterialTopic.name.ilike(search),
                    MaterialTopic.description.ilike(search)
                )
            )

        if name:
            query = query.filter(MaterialTopic.name.ilike(f"%{name}%"))

        material_topics = query.all()

        return material_topics
    except Exception as e:
        raise

def get_all_by_report(db: Session, report_id: int) -> List[MaterialTopic]:
    """
    Obtiene todos los asuntos de materialidad de una memoria.
    """
    try:
        return db.query(MaterialTopic).filter(MaterialTopic.report_id == report_id).all()
    except Exception as e:
        raise
