from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import ODS, SecondaryODSMaterialTopic
import logging

logger = logging.getLogger(__name__)

def get_all_ods(db: Session) -> List[ODS]:
    try:
        return db.query(ODS).all()
    except Exception as e:
        logger.error(f"Error al obtener ODS: {str(e)}")
        raise

def get_secondary_impacts(db: Session, material_topic_id: int) -> List[int]:
    try:
        secondary_impacts = db.query(SecondaryODSMaterialTopic.ods_id)\
            .filter(SecondaryODSMaterialTopic.material_topic_id == material_topic_id)\
            .all()
        return [impact[0] for impact in secondary_impacts]
    except Exception as e:
        logger.error(f"Error al obtener impactos secundarios: {str(e)}")
        raise

def update_secondary_impacts(
    db: Session,
    material_topic_id: int,
    ods_ids: List[int]
) -> None:
    try:
        # Eliminar impactos secundarios existentes
        db.query(SecondaryODSMaterialTopic)\
            .filter(SecondaryODSMaterialTopic.material_topic_id == material_topic_id)\
            .delete()

        # Añadir nuevos impactos secundarios
        for ods_id in ods_ids:
            secondary_impact = SecondaryODSMaterialTopic(
                material_topic_id=material_topic_id,
                ods_id=ods_id
            )
            db.add(secondary_impact)

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar impactos secundarios: {str(e)}")
        raise
