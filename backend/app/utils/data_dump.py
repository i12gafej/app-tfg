import os
from typing import Optional
from app.config import Settings
import datetime
from app.models.models import SustainabilityTeamMember
from app.schemas.diagnosis_indicators import DiagnosisIndicator as DiagnosisIndicatorSchema
import re



settings = Settings()

class DataDump:
    """
    Clase para volcar los datos de la memoria en el report_generator.
    Proporciona funciones para obtener y procesar diferentes tipos de datos.
    """
    
    
    @staticmethod
    def get_photo(base_dir: str, url: str) -> Optional[str]:
        """
        Obtiene la ruta completa de una foto dado el directorio base y la URL.
        
        Args:
            base_dir (str): Directorio base donde se encuentran las fotos
            url (str): URL relativa de la foto (ej: "report_5_logo_9b749bc4-2d5a-4410-8d8d-c6112131e8b6.jpg")
            
        Returns:
            Optional[str]: Ruta completa de la foto si existe, None si no existe
        """
        try:
            # Construir la ruta completa
            full_path = os.path.join(base_dir, url)
            
            # Verificar si el archivo existe
            if os.path.exists(full_path):
                return full_path
            return None
            
        except Exception as e:
            print(f"Error al obtener la foto: {str(e)}")
            return None
    
    @staticmethod
    def get_html_image(url: str) -> str:
        """
        Devuelve la ruta completa de una imagen en formato HTML.
        """
        return f"<img src='{url}' alt='Imagen' />"

    @staticmethod
    def dump_cover_data(data: dict) -> dict:
        """
        Vuelca los datos de la portada en un diccionario.
        """
        logos_names = [logo.logo for logo in data["logos"]]
        return {
            "title": f"Memoria de Sostenibilidad {data['heritage_resource_name']}",
            "cover_image": data["cover_photo"],
            "logos": [logo for logo in logos_names],
            "year": data["year"]
        }
    
    @staticmethod
    def dump_resource_info_data(data: dict) -> dict:
        """
        Vuelca los datos de la información del recurso en un diccionario.
        """
        month = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ]
        today = datetime.datetime.now()
        publish_date = f"{today.day} de {month[today.month-1]} del {today.year}"
        
        data["publish_date"] = publish_date
        return data

    @staticmethod
    def dump_norms_data(data: dict) -> dict:
        """
        Vuelca los datos de la normativa en un diccionario.
        """
        return [norm.norm for norm in data]
    
    @staticmethod
    def dump_agreements_data(data: dict) -> dict:
        """
        Vuelca los datos de los acuerdos en un diccionario.
        """
        return [agreement.agreement for agreement in data]
    
    @staticmethod
    def dump_bibliography_data(data: dict) -> dict:
        """
        Vuelca los datos de la bibliografía en un diccionario. Detecta si tiene link, y los mete en un enlace html.
        """
        
        return [bibliography.reference for bibliography in data]

    @staticmethod
    def dump_gallery_data(data: dict) -> dict:
        """
        Vuelca los datos de la galería fotográfica en un diccionario.
        """
        return [{'photo': gallery.photo, 'description': gallery.description} for gallery in data]
    
    @staticmethod
    def dump_team_members_data(data: dict) -> dict:
        """
        Vuelca los datos de los miembros del equipo ordenados por rol (de gestor a aseor externo) en un diccionario.
        """
        data = sorted(data, key=lambda x: x["role"])
        
        for member in data:
            if member['role'] == "external_advisor":
                member['role'] = "Asesor externo"
            elif member['role'] == "manager":
                member['role'] = "Gestor"
            elif member['role'] == "consultant":
                member['role'] = "Consultor"
        return [f"{member['name']} {member['surname']} - {member['role']} ({member['organization']})" for member in data]
            
    @staticmethod
    def dump_stakeholders_data(data: dict) -> dict:
        """
        Vuelca los datos de los grupos de interés separacos por tipo en un diccionario.
        """
        stakeholders = {
            "internal": [],
            "external": []
        }
        for stakeholder in data:
            if stakeholder["type"] == "internal":
                stakeholders["internal"].append(stakeholder["name"])
            else:
                stakeholders["external"].append(stakeholder["name"])
        return stakeholders

    @staticmethod
    def get_dimension_order(goal_ods_id: Optional[int]) -> str:
        """
        Determina la dimensión basada en el ID del ODS.
        
        Args:
            goal_ods_id (Optional[int]): ID del objetivo ODS
            
        Returns:
            str: Dimensión correspondiente
        """
        if not goal_ods_id:
            return 'SIN_DIMENSION'
        if 1 <= goal_ods_id <= 5:
            return 'PERSONAS'
        if goal_ods_id in [6, 12, 13, 14, 15]:
            return 'PLANETA'
        if 7 <= goal_ods_id <= 11:
            return 'PROSPERIDAD'
        if goal_ods_id == 16:
            return 'PAZ'
        if goal_ods_id == 17:
            return 'ALIANZAS'
        return 'SIN_DIMENSION'

    @staticmethod
    def dump_material_topics_data(data: list) -> dict:
        """
        Vuelca los datos de los asuntos de materialidad en un diccionario.
        Calcula el número de elementos por dimensión y asigna la dimensión a cada asunto.
        Ordena los asuntos por dimensión y por id, asignando un número secuencial.
        
        Args:
            data (list): Lista de asuntos de materialidad
            
        Returns:
            dict: Diccionario con el tamaño de cada dimensión y los asuntos procesados
        """
        # Definir el orden de las dimensiones
        dimension_order = ['PERSONAS', 'PLANETA', 'PROSPERIDAD', 'PAZ', 'ALIANZAS']
        
        # Inicializar contador de dimensiones
        dimension_size = {
            'PERSONAS': 0,
            'PLANETA': 0,
            'PROSPERIDAD': 0,
            'PAZ': 0,
            'ALIANZAS': 0,
            'SIN_DIMENSION': 0
        }
        
        # Procesar cada asunto de materialidad
        material_topics = []
        for topic in data:
            dimension = DataDump.get_dimension_order(topic.goal_ods_id)
            dimension_size[dimension] += 1
            
            material_topics.append({
                "name": topic.name,
                "description": topic.description,
                "dimension": dimension,
                "id": topic.id  # Guardamos el id para ordenar
            })
        
        # Ordenar los asuntos primero por dimensión según el orden definido y luego por id
        material_topics.sort(key=lambda x: (
            dimension_order.index(x['dimension']) if x['dimension'] in dimension_order else len(dimension_order),
            x['id']
        ))
        
        # Asignar número secuencial
        for i, topic in enumerate(material_topics, 1):
            topic['order'] = i
            del topic['id']  # Eliminamos el id ya que no lo necesitamos en el resultado final
        
        return {
            "dimension_size": dimension_size,
            "material_topics": material_topics
        }

    @staticmethod
    def get_ods_images_dict(base_dir: str) -> dict:
        '''
        Obtiene un diccionario con las URLs de las imágenes de los ODS y la 5P.
        '''
        ods_dict = {f"{i}": f"/static/on_report/images/ods_{i}.jpg" for i in range(1, 18)}
        ods_dict["5p"] = "/static/on_report/images/5p.png"
        return ods_dict

    @staticmethod
    def dump_diagnosis_tables_data(data: dict) -> dict:
        """
        Vuelca los datos de los indicadores de diagnóstico en un diccionario.
        Transforma los datos del modelo a la estructura de diagnóstico requerida.
        
        Args:
            data (dict): Diccionario con los datos del reporte obtenidos de get_report_data
            
        Returns:
            dict: Diccionario con la estructura de diagnóstico
        """
        diagnosis_tables = {
            "material_topics": []
        }
        
        # Obtener el diccionario de ODS para mapear IDs a nombres
        ods_dict = {ods.id: ods.name for ods in data['ods']}
        
        # Crear diccionario de goals por ODS
        goals_dict = {}
        for goal in data['goals']:
            if goal.ods_id not in goals_dict:
                goals_dict[goal.ods_id] = {}
            goals_dict[goal.ods_id][goal.goal_number] = goal.description

        # Procesar cada asunto material
        for topic in data['material_topics']:
            # Obtener los indicadores de diagnóstico para este asunto
            topic_indicators = [
                indicator for indicator in data['diagnosis_indicators']
                if indicator.material_topic_id == topic.id
            ]
            
            # Separar indicadores cualitativos y cuantitativos
            qualitative_indicators = []
            quantitative_indicators = []
            
            for indicator in topic_indicators:
                if indicator.type == 'qualitative':
                    # La respuesta cualitativa ya viene en el schema
                    if indicator.qualitative_data:
                        qualitative_indicators.append({
                            "name": indicator.name,
                            "response": indicator.qualitative_data.response
                        })
                else:  # quantitative
                    # La respuesta cuantitativa ya viene en el schema
                    if indicator.quantitative_data:
                        quantitative_indicators.append({
                            "name": indicator.name,
                            "response": str(indicator.quantitative_data.numeric_response),
                            "unit": indicator.quantitative_data.unit
                        })

            # Obtener ODS secundarios
            secondary_ods = [
                f"ODS {ods_id} - {ods_dict[ods_id]}"
                for impact in data['secondary_impacts'] if impact["material_topic_id"] == topic.id
                for ods_id in (impact['ods_ids'] if isinstance(impact['ods_ids'], list) else [impact['ods_ids']])
            ]
            
            # Obtener ODS principal
            main_ods = f"ODS {topic.goal_ods_id} - {ods_dict[topic.goal_ods_id]}" if topic.goal_ods_id else None
            
            # Formatear main_ods_goal y obtener su descripción
            main_ods_goal = None
            if topic.goal_ods_id and topic.goal_number:
                # Verificar si goal_number es numérico
                if topic.goal_number.isdigit():
                    goal_number = f"{topic.goal_ods_id}.{topic.goal_number}"
                else:
                    goal_number = f"{topic.goal_ods_id}{topic.goal_number}"
                
                # Obtener la descripción del goal si existe
                goal_description = ""
                if topic.goal_ods_id in goals_dict and topic.goal_number in goals_dict[topic.goal_ods_id]:
                    goal_description = f" - {goals_dict[topic.goal_ods_id][topic.goal_number]}"
                
                main_ods_goal = f"{goal_number}{goal_description}"
            
            # Crear entrada del asunto material
            diagnosis_tables["material_topics"].append({
                "dimension": DataDump.get_dimension_order(topic.goal_ods_id),
                "topic": topic.name,
                "main_ODS": main_ods,
                "main_ODS_goal": main_ods_goal,
                "secondary_ODS": secondary_ods,
                "qualitative_indicators": qualitative_indicators,
                "quantitative_indicators": quantitative_indicators
            })
        
        return diagnosis_tables
    
    @staticmethod
    def dump_action_plan_data(data: dict) -> dict:
        """
        Vuelca los datos del plan de acción en un diccionario.
        Transforma los datos del modelo a la estructura de plan de acción requerida.
        
        Args:
            data (dict): Diccionario con los datos del reporte obtenidos de get_report_data
            
        Returns:
            dict: Diccionario con la estructura de plan de acción
        """
        try: 
            action_plan = []
            
            # Obtener el diccionario de ODS para mapear IDs a nombres
            ods_dict = {ods.id: ods.name for ods in data['ods']}
            
            # Procesar cada asunto material
            for topic in data['material_topics']:
                # Obtener los objetivos específicos para este asunto material
                specific_objectives = [
                    obj for obj in data['specific_objectives']
                    if obj.material_topic_id == topic.id
                ]
                
                if not specific_objectives:
                    continue
                    
                # Crear entrada del asunto material
                topic_entry = {
                    "dimension": DataDump.get_dimension_order(topic.goal_ods_id),
                    "topic": topic.name,
                    "priority": "-" if topic.priority is None else "Alta" if topic.priority == "high" else "Media" if topic.priority == "medium" else "Baja" if topic.priority == "low" else topic.priority,
                    "main_objective": topic.main_objective,
                    "specific_objectives": []
                }
                
                # Procesar cada objetivo específico
                for obj in specific_objectives:
                    # Obtener las acciones para este objetivo
                    actions = [
                        action for action in data['actions']
                        if action.specific_objective_id == obj.id
                    ]
                    
                    if not actions:
                        continue
                        
                    # Crear entrada del objetivo específico
                    objective_entry = {
                        "objective": obj.description,
                        "responsible": "-" if obj.responsible is None else obj.responsible,
                        "actions": []
                    }
                    
                    # Procesar cada acción
                    for action in actions:
                            
                        # Obtener los indicadores de rendimiento para esta acción
                        performance_indicators = [
                            indicator for indicator in data['performance_indicators']
                            if indicator.action_id == action.id
                        ]
                            
                        
                        # Obtener ODS secundarios para esta acción
                        secondary_ods = [
                                f"ODS {impact['ods_id']} - {ods_dict[impact['ods_id']]}"
                            for impact in data['action_secondary_impacts']
                                if impact['action_id'] == action.id
                        ]
                        
                        # Obtener ODS principal
                        main_ods = f"ODS {action.ods_id} - {ods_dict[action.ods_id]}" if action.ods_id else None
                        
                        # Crear entrada de la acción
                        action_entry = {
                            "action": action.description,
                            "difficulty": "-" if action.difficulty is None else "Alta" if action.difficulty == "high" else "Media" if action.difficulty == "medium" else "Baja" if action.difficulty == "low" else action.difficulty,
                            "execution_time": "-" if action.execution_time is None else action.execution_time,
                            "main_ODS": main_ods,
                            "secondary_ODS": secondary_ods,
                            "indicators": []
                        }
                        
                        # Procesar indicadores de rendimiento
                        for indicator in performance_indicators:
                            indicator_entry = {
                                "name": indicator.name,
                                "type": "Cualitativo" if indicator.type == "qualitative" else "Cuantitativo",
                                "human_resources": "-" if indicator.human_resources is None else indicator.human_resources,
                                "material_resources": "-" if indicator.material_resources is None else indicator.material_resources
                            }
                                
                            # Añadir datos específicos según el tipo
                            if indicator.type == 'quantitative' and indicator.quantitative_data:
                                indicator_entry.update({
                                    "numeric_response": indicator.quantitative_data.numeric_response,
                                    "unit": "-" if indicator.quantitative_data.unit is None else indicator.quantitative_data.unit,
                                    "response": str(indicator.quantitative_data.numeric_response)
                                })
                            elif indicator.type == 'qualitative' and indicator.qualitative_data:
                                indicator_entry.update({
                                    "response": indicator.qualitative_data.response,
                                    "unit": None
                                })
                                    
                            action_entry["indicators"].append(indicator_entry)
                        
                        objective_entry["actions"].append(action_entry)
                    
                    topic_entry["specific_objectives"].append(objective_entry)
                    
                action_plan.append(topic_entry)
        
            return {"action_plan": action_plan}
        except Exception as e:
            print(f"Error al obtener el plan de acción: {str(e)}")
            raise e

    @staticmethod
    def material_topics_data_from_legend(legend: dict) -> dict:
        # Calcular el tamaño de cada dimensión
        dimension_size = {dim: 0 for dim in ['PERSONAS', 'PLANETA', 'PROSPERIDAD', 'PAZ', 'ALIANZAS']}
        scale = legend.get('scale', 10)  # Valor por defecto si no está presente

        for tid in legend['leyenda_order']:
            dim = legend['dimensions'][tid]
            if dim in dimension_size:
                dimension_size[dim] += 1

        # Construir la lista de topics en el orden de leyenda
        material_topics = []
        for order, tid in enumerate(legend['leyenda_order'], 1):
            # Calcular prioridad
            punto = legend['points'][tid]
            media = (punto['x'] + punto['y']) / 2
            if media < 0.6 * scale:
                priority = "Baja"
            elif media < 0.8 * scale:
                priority = "Media"
            else:
                priority = "Alta"

            material_topics.append({
                "name": legend['topic_names'][tid],
                "dimension": legend['dimensions'][tid],
                "order": order,
                "priority": priority
            })

        return {
            "dimension_size": dimension_size,
            "material_topics": material_topics
        }

        
