from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
import re
from app.api.deps import get_db, get_current_user
from app.schemas.auth import TokenData
from app.schemas.monitoring import MonitoringTemplateResponse
from app.schemas.material_topics import MaterialTopic
from app.schemas.action_plan import SpecificObjective, Action, PerformanceIndicator
from app.crud import material_topics as crud_material_topics
from app.crud import action_plan as crud_action_plan
from app.crud import ods as crud_ods
from app.templates.monitoring_templates import generate_monitoring_template

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter()

def translate_level(level: str) -> str:
    level_map = {
        "low": "Baja",
        "medium": "Media",
        "high": "Alta"
    }
    return level_map.get(level, "No definida")

def clean_html(text: str) -> str:
    if not text:
        return "No definido"
    # Eliminar todas las etiquetas HTML
    clean_text = re.sub(r'<[^>]+>', '', text)
    # Reemplazar múltiples espacios en blanco por uno solo
    clean_text = re.sub(r'\s+', ' ', clean_text)
    # Eliminar espacios al inicio y final
    return clean_text.strip()

@router.get("/monitoring-template/{report_id}", response_model=MonitoringTemplateResponse)
def get_monitoring_template(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Genera una plantilla de monitorización para todas las acciones del reporte.
    """
    try:
        logger.info(f"Iniciando generación de plantilla para report_id: {report_id}")

        # 1. Obtener todos los asuntos relevantes
        logger.debug("Obteniendo asuntos relevantes...")
        material_topics = crud_material_topics.get_all_by_report(db, report_id)
        if not material_topics:
            logger.warning(f"No se encontraron asuntos relevantes para el report_id: {report_id}")
            raise HTTPException(status_code=404, detail="No se encontraron asuntos relevantes")
        logger.info(f"Se encontraron {len(material_topics)} asuntos relevantes")

        # 2. Obtener todos los ODS
        logger.debug("Obteniendo ODS...")
        all_ods = crud_ods.get_all_ods(db)
        ods_dict = {ods.id: ods for ods in all_ods}
        logger.info(f"Se encontraron {len(all_ods)} ODS")

        # 3. Preparar la estructura de datos para la plantilla
        template_data = []
        for topic in material_topics:
            logger.debug(f"Procesando asunto relevante id: {topic.id}")
            
            # Obtener objetivos específicos
            objectives = crud_action_plan.get_all_specific_objectives(db, topic.id)
            topic_objectives = []

            for objective in objectives:
                # Obtener acciones
                actions = crud_action_plan.get_all_actions(db, objective.id)
                objective_actions = []

                for action in actions:
                    # Obtener indicadores
                    indicators = crud_action_plan.get_all_performance_indicators(db, action.id)
                    
                    # Obtener información del ODS si existe
                    ods_info = ""
                    if action.ods_id and action.ods_id in ods_dict:
                        ods = ods_dict[action.ods_id]
                        ods_info = f"ODS {ods.id}: {ods.name}"
                    
                    # Crear diccionario de acción
                    action_dict = {
                        "id": action.id,
                        "description": action.description,
                        "difficulty": translate_level(action.difficulty) if action.difficulty else "No definida",
                        "main_impact": ods_info,
                        "indicators": [
                            {
                                "name": ind.name,
                                "type": ind.type,
                                "human_resources": ind.human_resources,
                                "material_resources": ind.material_resources
                            } for ind in indicators
                        ]
                    }
                    objective_actions.append(action_dict)

                # Crear diccionario de objetivo
                objective_dict = {
                    "id": objective.id,
                    "description": objective.description,
                    "responsible": objective.responsible or "No definido",
                    "execution_time": objective.execution_time,
                    "actions": objective_actions
                }
                topic_objectives.append(objective_dict)

            # Crear diccionario de asunto relevante
            topic_dict = {
                "id": topic.id,
                "name": topic.name,
                "priority": translate_level(topic.priority) if topic.priority else "No definida",
                "main_objective": clean_html(topic.main_objective),
                "objectives": topic_objectives
            }
            template_data.append(topic_dict)

        # 4. Generar el HTML de la plantilla
        logger.info("Generando HTML de la plantilla...")
        html_content = generate_monitoring_template(template_data)
        logger.info("HTML generado correctamente")

        return MonitoringTemplateResponse(html_content=html_content)

    except Exception as e:
        logger.error(f"Error en get_monitoring_template: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar la plantilla de monitorización: {str(e)}"
        )
