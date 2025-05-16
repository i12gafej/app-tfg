import os
from typing import Optional
from app.core.config import Settings

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
        return {
            "title": f"Memoria de Sostenibilidad {data['heritage_resource_name']}",
            "cover_image": self.get_photo(settings.COVERS_DIR, data["cover_photo"]),
            "logos": [self.get_photo(settings.LOGOS_DIR, logo) for logo in data["logos"]],
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
    def dump_team_members_data(data: dict) -> dict:
        """
        Vuelca los datos de los miembros del equipo ordenados por rol (de gestor a aseor externo) en un diccionario.
        """
        data = sorted(data, key=lambda x: x["role"])
        return [f"{member.name} {member.surname} - {member.role} ({member.organization})" for member in data]
            
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
            if stakeholder.type == "internal":
                stakeholders["internal"].append(stakeholder)
            else:
                stakeholders["external"].append(stakeholder)
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
        Ordena los temas por dimensión y por id, asignando un número secuencial.
        
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
        
        # Ordenar los temas primero por dimensión según el orden definido y luego por id
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
        ods_dict = {f"{i}": f"{os.path.join(base_dir, f'ods_{i}.jpg')}" for i in range(1, 18)}
        ods_dict["5p"] = f"{os.path.join(base_dir, '5p.png')}"
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
        
        # Procesar cada tema material
        for topic in data['material_topics']:
            # Obtener los indicadores de diagnóstico para este tema
            topic_indicators = [
                indicator for indicator in data['diagnostic_indicators']
                if indicator.material_topic_id == topic.id
            ]
            
            # Separar indicadores cualitativos y cuantitativos
            qualitative_indicators = []
            quantitative_indicators = []
            
            for indicator in topic_indicators:
                if indicator.type == 'qualitative':
                    qualitative_response = next(
                        (q.response for q in indicator.qualitative_responses),
                        None
                    )
                    if qualitative_response:
                        qualitative_indicators.append({
                            "name": indicator.name,
                            "response": qualitative_response
                        })
                else:  # quantitative
                    quantitative_response = next(
                        (q for q in indicator.quantitative_responses),
                        None
                    )
                    if quantitative_response:
                        quantitative_indicators.append({
                            "name": indicator.name,
                            "response": str(quantitative_response.numeric_response),
                            "unit": quantitative_response.unit
                        })
            
            # Obtener ODS secundarios
            secondary_ods = [
                ods_dict[impact.ods_id]
                for impact in data['secondary_impacts']
                if impact.material_topic_id == topic.id
            ]
            
            # Obtener ODS principal
            main_ods = f"ODS {topic.goal_ods_id} - {ods_dict[topic.goal_ods_id]}" if topic.goal_ods_id else None
            main_ods_goal = f"{topic.goal_ods_id}.{topic.goal_number}" if topic.goal_ods_id and topic.goal_number else None
            
            # Crear entrada del tema material
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

        
