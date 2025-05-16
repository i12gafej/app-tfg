from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from sqlalchemy import func
from collections import Counter
from app.crud import material_topics as crud_material_topics

from app.models.models import (
    SpecificObjective, Action, PerformanceIndicator,
    PerformanceIndicatorQuantitative, PerformanceIndicatorQualitative,
    MaterialTopic, ODS
)
from app.schemas.action_plan import (
    SpecificObjectiveCreate, SpecificObjectiveUpdate,
    ActionCreate, ActionUpdate,
    PerformanceIndicatorCreate, PerformanceIndicatorUpdate
)

# Funciones para Objetivos Específicos
def get_all_specific_objectives(db: Session, material_topic_id: int) -> List[SpecificObjective]:
    try:
        return db.query(SpecificObjective).filter(
            SpecificObjective.material_topic_id == material_topic_id
        ).all()
    except Exception as e:
        raise e

def get_all_responsibles(db: Session, report_id: int) -> List[str]:
    try:
        # Obtener todos los ids de asuntos relevantes de la memoria
        topic_ids = db.query(MaterialTopic.id).filter(MaterialTopic.report_id == report_id).all()
        topic_ids = [tid[0] for tid in topic_ids]
        # Obtener responsables únicos de los objetivos específicos de esos asuntos
        responsibles = db.query(SpecificObjective.responsible)\
            .filter(SpecificObjective.material_topic_id.in_(topic_ids))\
            .filter(SpecificObjective.responsible.isnot(None))\
            .filter(SpecificObjective.responsible != '')\
            .distinct().all()
        return [r[0] for r in responsibles]
    except Exception as e:
        raise e


def create_specific_objective(
    db: Session,
    objective: SpecificObjectiveCreate
) -> SpecificObjective:
    try:
        db_objective = SpecificObjective(**objective.model_dump())
        db.add(db_objective)
        db.commit()
        db.refresh(db_objective)
        return db_objective
    except Exception as e:
        raise e

def update_specific_objective(
    db: Session,
    objective_id: int,
    objective_update: SpecificObjectiveUpdate
) -> Optional[SpecificObjective]:
    try:
        db_objective = db.query(SpecificObjective).filter(
            SpecificObjective.id == objective_id
        ).first()
    
        if not db_objective:
            return None

        update_data = objective_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_objective, field, value)

        db.commit()
        db.refresh(db_objective)
        return db_objective
    except Exception as e:
        raise e

def delete_specific_objective(db: Session, objective_id: int) -> bool:
    try:
        db_objective = db.query(SpecificObjective).filter(
            SpecificObjective.id == objective_id
        ).first()

        if not db_objective:
            return False

        db.delete(db_objective)
        db.commit()
        return True
    except Exception as e:
        raise e

# Funciones para Acciones
def get_all_actions(db: Session, specific_objective_id: int) -> List[Action]:
    try:
        return db.query(Action).filter(
            Action.specific_objective_id == specific_objective_id
        ).all()
    except Exception as e:
        raise e


def get_action_by_id(db: Session, action_id: int) -> Optional[Action]:
    try:
        return db.query(Action).filter(Action.id == action_id).first()
    except Exception as e:
        raise e

def get_report_id_by_action(db: Session, action_id: int) -> int:
    try:
        material_topic = db.query(MaterialTopic
        ).join(SpecificObjective, MaterialTopic.id == SpecificObjective.material_topic_id
        ).join(Action, SpecificObjective.id == Action.specific_objective_id
        ).filter(Action.id == action_id).first()
        if not material_topic:
            return None
        return material_topic.report_id
    except Exception as e:
        raise e

def create_action(db: Session, action: ActionCreate) -> Action:
    try:
        db_action = Action(**action.model_dump())
        db.add(db_action)
        db.commit()
        db.refresh(db_action)
        return db_action
    except Exception as e:
        raise e

def update_action(
    db: Session,
    action_id: int,
    action_update: ActionUpdate
) -> Optional[Action]:
    try:
        db_action = db.query(Action).filter(Action.id == action_id).first()
        
        if not db_action:
            return None

        update_data = action_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_action, field, value)

        db.commit()
        db.refresh(db_action)
        return db_action
    except Exception as e:
        raise e

def delete_action(db: Session, action_id: int) -> bool:
    try:
        db_action = db.query(Action).filter(Action.id == action_id).first()
        
        if not db_action:
            return False

        db.delete(db_action)
        db.commit()
        return True
    except Exception as e:
        raise e

# Funciones para Indicadores de Rendimiento
def get_all_performance_indicators(db: Session, action_id: int) -> List[PerformanceIndicator]:
    try:
        indicators = db.query(PerformanceIndicator).filter(
            PerformanceIndicator.action_id == action_id
        ).all()

        for indicator in indicators:
            if indicator.type == 'quantitative':
                quantitative_data = db.query(PerformanceIndicatorQuantitative).filter(
                    PerformanceIndicatorQuantitative.performance_indicator_id == indicator.id
                ).first()
                if quantitative_data:
                    indicator.quantitative_data = quantitative_data
            else:
                qualitative_data = db.query(PerformanceIndicatorQualitative).filter(
                    PerformanceIndicatorQualitative.performance_indicator_id == indicator.id
                ).first()
                if qualitative_data:
                    indicator.qualitative_data = qualitative_data

        return indicators
    except Exception as e:
        raise e

def get_action_plan_by_report(db: Session, report_id: int) -> dict:
    try:
        return {
            "specific_objectives": get_all_specific_objectives(db, report_id),
            "actions": get_all_actions(db, report_id),
            "performance_indicators": get_all_performance_indicators(db, report_id)
        }
    except Exception as e:
        raise e
def create_performance_indicator(
    db: Session,
    indicator: PerformanceIndicatorCreate
) -> PerformanceIndicator:
    try:
        # Crear el indicador base
        db_indicator = PerformanceIndicator(
            name=indicator.name,
            human_resources=indicator.human_resources,
            material_resources=indicator.material_resources,
            type=indicator.type,
            action_id=indicator.action_id
        )
        db.add(db_indicator)
        db.flush()

        # Crear datos específicos según el tipo
        if indicator.type == 'quantitative' and indicator.numeric_response is not None:
            db_quantitative = PerformanceIndicatorQuantitative(
                performance_indicator_id=db_indicator.id,
                numeric_response=indicator.numeric_response,
                unit=indicator.unit or ''
            )
            db.add(db_quantitative)
        elif indicator.type == 'qualitative' and indicator.response is not None:
            db_qualitative = PerformanceIndicatorQualitative(
                performance_indicator_id=db_indicator.id,
                response=indicator.response
            )
            db.add(db_qualitative)

        db.commit()
        db.refresh(db_indicator)
        return db_indicator
    except Exception as e:
        raise e

def update_performance_indicator(
    db: Session,
    indicator_id: int,
    indicator_update: PerformanceIndicatorUpdate
) -> Optional[PerformanceIndicator]:
    try:
        db_indicator = db.query(PerformanceIndicator).filter(
            PerformanceIndicator.id == indicator_id
        ).first()
        
        if not db_indicator:
            return None

        update_data = indicator_update.model_dump(exclude_unset=True)
        
        # Actualizar campos básicos
        for field in ['name', 'human_resources', 'material_resources', 'type']:
            if field in update_data:
                setattr(db_indicator, field, update_data[field])

        # Si el tipo ha cambiado, eliminar datos antiguos
        if 'type' in update_data and update_data['type'] != db_indicator.type:
            # Eliminar datos antiguos
            if db_indicator.type == 'quantitative':
                db.query(PerformanceIndicatorQuantitative).filter(
                    PerformanceIndicatorQuantitative.performance_indicator_id == indicator_id
                ).delete()
            else:
                db.query(PerformanceIndicatorQualitative).filter(
                    PerformanceIndicatorQualitative.performance_indicator_id == indicator_id
                ).delete()
            
            db_indicator.type = update_data['type']
            db.commit()

        # Actualizar o crear datos específicos según el tipo
        if db_indicator.type == 'quantitative':
            # Eliminar datos cualitativos si existen
            db.query(PerformanceIndicatorQualitative).filter(
                PerformanceIndicatorQualitative.performance_indicator_id == indicator_id
            ).delete()
            
            if 'numeric_response' in update_data or 'unit' in update_data:
                db_quantitative = db.query(PerformanceIndicatorQuantitative).filter(
                    PerformanceIndicatorQuantitative.performance_indicator_id == indicator_id
                ).first()
                
                if db_quantitative:
                    if 'numeric_response' in update_data:
                        db_quantitative.numeric_response = update_data['numeric_response']
                    if 'unit' in update_data:
                        db_quantitative.unit = update_data['unit']
                else:
                    db_quantitative = PerformanceIndicatorQuantitative(
                        performance_indicator_id=indicator_id,
                        numeric_response=update_data.get('numeric_response', Decimal('0')),
                        unit=update_data.get('unit', '')
                    )
                    db.add(db_quantitative)

        elif db_indicator.type == 'qualitative':
            # Eliminar datos cuantitativos si existen
            db.query(PerformanceIndicatorQuantitative).filter(
                PerformanceIndicatorQuantitative.performance_indicator_id == indicator_id
            ).delete()
            
            if 'response' in update_data:
                db_qualitative = db.query(PerformanceIndicatorQualitative).filter(
                    PerformanceIndicatorQualitative.performance_indicator_id == indicator_id
                ).first()
                
                if db_qualitative:
                    db_qualitative.response = update_data['response']
                else:
                    db_qualitative = PerformanceIndicatorQualitative(
                        performance_indicator_id=indicator_id,
                        response=update_data['response']
                    )
                    db.add(db_qualitative)

        db.commit()
        db.refresh(db_indicator)
        return db_indicator
    except Exception as e:
        raise e

def delete_performance_indicator(db: Session, indicator_id: int) -> bool:
    try:
        db_indicator = db.query(PerformanceIndicator).filter(
            PerformanceIndicator.id == indicator_id
        ).first()
    
        if not db_indicator:
            return False

        db.delete(db_indicator)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_all_action_main_impacts(db: Session, report_id: int) -> List[dict]:
    """
    Obtiene el recuento de impactos principales de todas las acciones de un reporte.
    """
    try:
        # Obtener todas las acciones del reporte a través de las relaciones
        actions = db.query(Action.ods_id, ODS.name.label('ods_name'))\
            .join(SpecificObjective, Action.specific_objective_id == SpecificObjective.id)\
            .join(MaterialTopic, SpecificObjective.material_topic_id == MaterialTopic.id)\
            .outerjoin(ODS, Action.ods_id == ODS.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .filter(Action.ods_id.isnot(None))\
            .all()

        # Contar las ocurrencias de cada ODS y mantener el nombre
        ods_counts = {}
        for ods_id, ods_name in actions:
            if ods_id not in ods_counts:
                ods_counts[ods_id] = {"ods_id": ods_id, "ods_name": ods_name, "count": 0}
            ods_counts[ods_id]["count"] += 1
        
        # Convertir a lista de diccionarios
        result = list(ods_counts.values())
        
        return result
    except Exception as e:
        raise e


