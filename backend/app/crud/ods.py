from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.models.models import ODS, SecondaryODSMaterialTopic, MaterialTopic, SecondaryODSAction, Action, SpecificObjective
from collections import Counter

def get_all_ods(db: Session) -> List[ODS]:
    try:
        return db.query(ODS).all()
    except Exception as e:
        raise

def get_secondary_impacts(db: Session, material_topic_id: int) -> List[int]:
    try:
        secondary_impacts = db.query(SecondaryODSMaterialTopic.ods_id)\
            .filter(SecondaryODSMaterialTopic.material_topic_id == material_topic_id)\
            .all()
        return [impact[0] for impact in secondary_impacts]
    except Exception as e:
        raise

def get_all_secondary_impacts_by_report(db: Session, report_id: int) -> List[dict]:
    try:
        # Obtener todos los material topics del reporte
        material_topics = db.query(MaterialTopic)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()
        
        # Para cada material topic, obtener sus impactos secundarios
        result = []
        for topic in material_topics:
            secondary_impacts = get_secondary_impacts(db, topic.id)
            result.append({
                "material_topic_id": topic.id,
                "ods_ids": secondary_impacts
            })
        
        return result
    except Exception as e:
        raise e

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
        raise e

def get_all_ods_with_dimension(db: Session) -> Dict[str, List[ODS]]:
    """
    Obtiene todos los ODS agrupados por su dimensión.
    """
    try:
        # Obtener todos los ODS
        all_ods = db.query(ODS).all()
        
        # Definir las dimensiones y sus ODS correspondientes
        dimensions = {
            "Persona": [1, 2, 3, 4, 5],
            "Planeta": [6, 12, 13, 14, 15],
            "Prosperidad": [7, 8, 9, 10, 11],
            "Paz": [16],
            "Alianzas": [17]
        }
        
        # Agrupar los ODS por dimensión
        ods_by_dimension = {}
        for dimension, ods_numbers in dimensions.items():
            ods_by_dimension[dimension] = [
                ods for ods in all_ods if ods.id in ods_numbers
            ]
        
        return ods_by_dimension
    except Exception as e:
        raise Exception(f"Error al obtener ODS por dimensión: {str(e)}")
def get_action_secondary_impacts(db: Session, action_id: int) -> List[int]:
    """
    Obtiene los ODS de impacto secundario para una acción específica.
    """
    try:
        secondary_impacts = db.query(SecondaryODSAction.ods_id)\
            .filter(SecondaryODSAction.action_id == action_id)\
            .all()
        return [impact[0] for impact in secondary_impacts]
    except Exception as e:
        raise e

def update_action_secondary_impacts(
    db: Session,
    action_id: int,
    ods_ids: List[int]
) -> None:
    """
    Actualiza los ODS de impacto secundario para una acción específica.
    """
    try:
        # Verificar que la acción existe
        action = db.query(Action).filter(Action.id == action_id).first()
        if not action:
            raise ValueError(f"No se encontró la acción con id {action_id}")

        # Eliminar impactos secundarios existentes
        db.query(SecondaryODSAction)\
            .filter(SecondaryODSAction.action_id == action_id)\
            .delete()

        # Añadir nuevos impactos secundarios
        for ods_id in ods_ids:
            secondary_impact = SecondaryODSAction(
                action_id=action_id,
                specific_objective_id=action.specific_objective_id,
                ods_id=ods_id
            )
            db.add(secondary_impact)

        db.commit()
    except Exception as e:
        raise e

def get_all_action_secondary_impacts_counts(db: Session, report_id: int) -> List[dict]:
    """
    Obtiene el recuento de impactos secundarios de todas las acciones de un reporte.
    """
    try:
        # Obtener todos los impactos secundarios del reporte a través de las relaciones
        secondary_impacts = db.query(SecondaryODSAction.ods_id, SecondaryODSAction.action_id, ODS.name.label('ods_name'))\
            .join(Action, SecondaryODSAction.action_id == Action.id)\
            .join(SpecificObjective, Action.specific_objective_id == SpecificObjective.id)\
            .join(MaterialTopic, SpecificObjective.material_topic_id == MaterialTopic.id)\
            .join(ODS, SecondaryODSAction.ods_id == ODS.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()

        # Contar las ocurrencias de cada ODS y mantener el nombre
        ods_counts = {}
        for ods_id, ods_name in secondary_impacts:
            if ods_id not in ods_counts:
                ods_counts[ods_id] = {"ods_id": ods_id, "action_id": action_id, "ods_name": ods_name, "count": 0}
            ods_counts[ods_id]["count"] += 1
        
        # Convertir a lista de diccionarios
        result = list(ods_counts.values())
        
        return result
    except Exception as e:
        raise e

def get_all_action_secondary_impacts(db: Session, report_id: int) -> List[dict]:
    """
    Obtiene el recuento de impactos secundarios de todas las acciones de un reporte.
    """
    try:
        # Obtener todos los impactos secundarios del reporte a través de las relaciones
        secondary_impacts = db.query(SecondaryODSAction.ods_id, SecondaryODSAction.action_id, ODS.name.label('ods_name'))\
            .join(Action, SecondaryODSAction.action_id == Action.id)\
            .join(SpecificObjective, Action.specific_objective_id == SpecificObjective.id)\
            .join(MaterialTopic, SpecificObjective.material_topic_id == MaterialTopic.id)\
            .join(ODS, SecondaryODSAction.ods_id == ODS.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()

        # Convertir a lista de diccionarios manteniendo todos los campos
        result = []
        for ods_id, action_id, ods_name in secondary_impacts:
            result.append({
                "ods_id": ods_id,
                "action_id": action_id,
                "ods_name": ods_name
            })
        
        return result
    except Exception as e:
        raise e

