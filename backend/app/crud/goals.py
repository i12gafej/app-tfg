from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Goal, MaterialTopic
import logging

logger = logging.getLogger(__name__)

def get_goals_by_ods(db: Session, ods_id: int) -> List[Goal]:
    try:
        return db.query(Goal).filter(Goal.ods_id == ods_id).all()
    except Exception as e:
        logger.error(f"Error al obtener metas por ODS: {str(e)}")
        raise

def update_main_impact(
    db: Session,
    material_topic_id: int,
    goal_ods_id: int,
    goal_number: str
) -> None:
    try:
        material_topic = db.query(MaterialTopic).filter(MaterialTopic.id == material_topic_id).first()
        if not material_topic:
            raise ValueError("Material topic no encontrado")

        material_topic.goal_ods_id = goal_ods_id
        material_topic.goal_number = goal_number

        db.add(material_topic)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar impacto principal: {str(e)}")
        raise

def get_all_goals(db: Session) -> List[Goal]:
    try:
        return db.query(Goal).all()
    except Exception as e:
        logger.error(f"Error al obtener todas las metas: {str(e)}")
        raise
