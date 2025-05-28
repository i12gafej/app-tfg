import os
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from typing import Dict, List, Optional, Any
from app.config import Settings
from bs4 import BeautifulSoup
from app.utils.data_dump import DataDump
import re
from app.utils.text_processing import paginate_html_text, paginate_html_tables, paginate_material_topics
import dotenv

dotenv.load_dotenv()

settings = Settings()



class ReportGenerator:
    def __init__(self):
        self.output_folder = settings.REPORTS_DIR
        os.makedirs(self.output_folder, exist_ok=True)
        self.template_env = Environment(loader=FileSystemLoader(searchpath=Path(__file__).parent / "../templates"))

    def generate_combined_html(self, data: Dict[str, Any]) -> str:
        """
        Genera el reporte completo combinando todas las secciones.
        Args:
            data: Diccionario con la información de todas las secciones
        Returns:
            str: HTML renderizado del reporte completo
        """
        template = self.template_env.get_template("combined_template.html")
        return template.render(data=data)


    def generate_cover(self, data: Dict[str, Any]) -> str:
        """
        Genera la portada del reporte.
        Args:
            data: Diccionario con la información de la portada (imagen, título, logos, etc.)
        Returns:
            str: HTML renderizado de la portada
        """
        template = self.template_env.get_template("cover_template.html")
        return template.render(data=data)

    def generate_resource_info(self, data: Dict[str, Any]) -> str:
        """
        Genera la página de información del recurso patrimonial.
        Returns:
            str: HTML renderizado de la información del recurso
        """
        template = self.template_env.get_template("resource_info_template.html")
        return template.render(data=data)

    def generate_simple_text(self, data: Dict[str, Any], background_color: str = "#FFFFFF") -> str:
        """
        Genera una página con título y texto simple.
        Returns:
            str: HTML renderizado del texto simple
        """
        template = self.template_env.get_template("simple_text_template.html")
        return template.render(data=data, background_color=background_color)

    def generate_preview_simple_text(self, data: Dict[str, Any], background_color: str = "#FFFFFF") -> str:
        """
        Genera una página de vista previa con título y texto simple.
        Returns:
            str: HTML renderizado del texto simple para vista previa
        """
        template = self.template_env.get_template("simple_preview_text_template.html")
        return template.render(data=data, background_color=background_color)


    def detect_and_format_urls(self, items: list) -> list:
        """
        Detecta URLs en los elementos de la lista y los convierte en enlaces HTML.
        Args:
            items (list): Lista de strings.
        Returns:
            list: Lista de strings o HTML con enlaces.
        """
        url_regex = re.compile(r'(https?://\S+)')
        formatted = []
        for item in items:
            def repl(match):
                url = match.group(0)
                return f'<a href="{url}" target="_blank">{url}</a>'
            new_item = url_regex.sub(repl, item)
            formatted.append(new_item)
        return formatted

    def generate_list_text(self, data: Dict[str, Any]) -> str:
        """
        Genera una página con una lista de elementos, detectando URLs.
        Returns:
            str: HTML renderizado de la lista
        """
        
        items = self.detect_and_format_urls(data)
        template = self.template_env.get_template("list_text_template.html")
        return template.render(items=items, data=data)

    def generate_photo(self, data: Dict[str, Any], background_color: str = None) -> str:
        """
        Genera una página con una fotografía y su descripción.
        Returns:
            str: HTML renderizado de la foto con descripción
        """
        template = self.template_env.get_template("photo_template.html")
        return template.render(data=data, background_color=background_color)

    def generate_ods_dimensions_text(self, data: Dict[str, Any]) -> str:
        """
        Genera el texto de diagnóstico con imágenes de ODS y dimensiones.
        Args:
            data: Diccionario con los datos necesarios para el diagnóstico
                - ods: Diccionario con las rutas de las imágenes de ODS y 5P
        Returns:
            str: HTML renderizado del diagnóstico
        """
        # Renderizar el template principal de ODS y dimensiones
        ods_template = self.template_env.get_template("ods_dimension_template.html")
        
        # Preparar los datos para el template
        return ods_template.render(ods=data)

    def generate_material_topics_text(self, material_topics_intro: Dict[str, Any], material_topics: List[Dict[str, Any]]) -> str:
        """
        Genera el texto de los asuntos de materialidad.
        Args:
            material_topics_intro: Diccionario con la introducción de los asuntos de materialidad
            material_topics: Lista de asuntos de materialidad
        Returns:
            str: HTML renderizado de los asuntos de materialidad
        """
        template = self.template_env.get_template("material_topics_template.html")
        return template.render(material_topics_intro=material_topics_intro, material_topics=material_topics)
    
    def generate_topics_table(self, data: Dict[str, Any], show_priority: bool = False) -> str:
        """
        Genera la tabla de asuntos de materialidad.
        Returns:
            str: HTML renderizado de la tabla de asuntos de materialidad
        """
        template = self.template_env.get_template("topics_table_template.html")
        return template.render(data=data, show_priority=show_priority)

    def generate_diagnosis_tables(self, data: Dict[str, Any], show_indicators: bool = True, introduction_text: str = None) -> str:
        """
        Genera las tablas de indicadores de diagnóstico.
        Returns:
            str: HTML renderizado de las tablas de indicadores
        """
        template = self.template_env.get_template("diagnosis_tables_template.html")
        return template.render(data=data, show_indicators=show_indicators, intro_text=introduction_text)

    def generate_action_plan_tables(self, data: Dict[str, Any], show_responsible: bool = False, show_indicators: bool = True) -> str:
        """
        Genera las tablas del plan de acción.
        Returns:
            str: HTML renderizado de las tablas del plan de acción
        """
        template = self.template_env.get_template("action_plan_tables_template.html")
        return template.render(data=data, show_responsible=show_responsible, show_indicators=show_indicators)
    
    def generate_impacts_graphs_legend(self, data: Dict[str, Any]) -> str:
        """
        Genera la leyenda de los impactos principales y secundarios.
        """
        template = self.template_env.get_template("impacts_graphs_legend.html")
        return template.render(ods=data)

    def generate_consistency_legend(self, data: Dict[str, Any]) -> str:
        """
        Genera la leyenda de la coherencia interna.
        """
        template = self.template_env.get_template("consistency_legend.html")
        return template.render(data=data)

    def generate_report(self, data: Dict[str, Any]) -> str:
        """
        Genera el reporte completo combinando todas las secciones.
        Returns:
            str: HTML renderizado del reporte completo
        """
        try:
            data_dump = DataDump()

            import logging
            logger = logging.getLogger(__name__)
            # PORTADA
            cover_html = self.generate_cover(
                data_dump.dump_cover_data(data)
            )

            # INFORMACIÓN DEL RECURSO
            resource_info_html = self.generate_resource_info(data_dump.dump_resource_info_data(data["resource"]))
            
            # ÍNDICE
            index_template = self.template_env.get_template("index_template.html")
            index_html = index_template.render()
            
            # CARTA DE COMPROMISO
            pages = paginate_html_text(data["commitment_letter"], max_lines=60, chars_per_line=35)
            commitment_letter_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        commitment_letter_html += self.generate_simple_text({"title": "Carta de compromiso", "text": page})
                    else:
                        commitment_letter_html += self.generate_simple_text({"title": "", "text": page})
            
            # MISION
            pages = paginate_html_text(data["mission"], max_lines=60, chars_per_line=35)
            mission_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        mission_html += self.generate_simple_text({"title": "Misión", "text": page})
                    else:
                        mission_html += self.generate_simple_text({"title": "", "text": page})

            # VISION
            pages = paginate_html_text(data["vision"], max_lines=60, chars_per_line=35)
            vision_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        vision_html += self.generate_simple_text({"title": "Visión", "text": page})
                    else:
                        vision_html += self.generate_simple_text({"title": "", "text": page})

            # VALORES
            pages = paginate_html_text(data["values"], max_lines=60, chars_per_line=35)
            values_section_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        values_section_html += self.generate_simple_text({"title": "Valores", "text": page})
                    else:
                        values_section_html += self.generate_simple_text({"title": "", "text": page})
            
            # NORMATIVA
            norms = self.generate_list_text(data_dump.dump_norms_data(data["norms"]))
            pages = paginate_html_text(norms, max_lines=60, chars_per_line=35)
            norms_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                        if i == 1:
                            norms_html += self.generate_simple_text({"title": "Normativa", "text": page})
                        else:
                            norms_html += self.generate_simple_text({"title": "", "text": page})

            # ORGANIGRAMA
            
            organization_chart = data["org_chart_text"] if data["org_chart_text"] else ""
            
            team_members = data_dump.dump_team_members_data(data["team_members"])
            organization_chart += self.generate_list_text(team_members)
            organization_chart += self.generate_photo({"photo_url": data["org_chart_figure"], "description": "Organigrama"}, background_color="#FFFFFF")
            pages = paginate_html_text(organization_chart, max_lines=40, chars_per_line=35)
            organization_chart_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        organization_chart_html += self.generate_simple_text({"title": "Organigrama", "text": page})
                    else:
                        organization_chart_html += self.generate_simple_text({"title": "", "text": page})

            # GRUPOS DE INTERÉS
            
            stakeholders = data["stakeholders_description"] if data["stakeholders_description"] else ""
            stakeholder_dict = data_dump.dump_stakeholders_data(data["stakeholders"])
            stakeholders += "<h3>Internos</h3>"
            stakeholders += self.generate_list_text(stakeholder_dict["internal"])
            stakeholders += "<h3>Externos</h3>"
            stakeholders += self.generate_list_text(stakeholder_dict["external"])

            pages = paginate_html_text(stakeholders, max_lines=55, chars_per_line=35)
            stakeholders_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        stakeholders_html += self.generate_simple_text({"title": "Análisis de los grupos de interés", "text": page})
                    else:
                        stakeholders_html += self.generate_simple_text({"title": "", "text": page})

            # DIAGNÓSTICO
            diagnosis = data["diagnosis_description"]
            pages = paginate_html_text(diagnosis, max_lines=60, chars_per_line=35)
            diagnosis_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        diagnosis_html += self.generate_simple_text({"title": "Diagnóstico", "text": page})
                    else:
                        diagnosis_html += self.generate_simple_text({"title": "", "text": page})

            # ASUNTOS DE MATERIALIZIDAD: TABLA
            material_topics = data_dump.dump_material_topics_data(data["material_topics"])
            material_topic_legend = data_dump.material_topics_data_from_legend(data["legend"])
            topics_table_html = self.generate_topics_table(material_topic_legend)
            pages = paginate_html_tables(topics_table_html, max_lines=9)
            topics_table_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        topics_table_html += self.generate_simple_text({"title": "Asuntos de materialidad", "text": page})
                    else:
                        topics_table_html += self.generate_simple_text({"title": "", "text": page})
            
            # 5p y ODS
            
            ods_images = data_dump.get_ods_images_dict(settings.IMAGES_DIR)
            ods_dimensions_html = self.generate_ods_dimensions_text(ods_images)

            material_topics_table = paginate_html_tables(topics_table_html, max_lines=60)
            material_topics_table_html = ""
            if material_topics_table is not None:
                for table,i in zip(material_topics_table, range(1, len(material_topics_table) + 1)):
                    if i == 1:
                        material_topics_table_html += self.generate_simple_text({"title": "Asuntos de materialidad", "text": table})
                    else:
                        material_topics_table_html += self.generate_simple_text({"title": "", "text": table})
            
            # ASUNTOS DE MATERIALIZIDAD: INTRODUCCIÓN
            
            materiality_text = data["materiality_text"] if data["materiality_text"] else ""
            
            pages = paginate_html_text(materiality_text, max_lines=60, chars_per_line=35)
            materiality_text_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        materiality_text_html += self.generate_simple_text({"title": "Asuntos de materialidad", "text": page})
                    else:
                        materiality_text_html += self.generate_simple_text({"title": "", "text": page})

            # ASUNTOS DE MATERIALIZIDAD: LISTA
            
           
            material_topics_html = self.generate_material_topics_text("", material_topics["material_topics"])
            pages = paginate_material_topics(material_topics_html, max_lines=55, chars_per_line=35)
            material_topics_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        material_topics_html += self.generate_simple_text({"title": "Asuntos de materialidad", "text": page})
                    else:
                        material_topics_html += self.generate_simple_text({"title": "", "text": page})
            
            # INDICADORES DE DIAGNÓSTICO
            
            diagnosis_indicators_text = """
            <p>
            Una vez definidos los asuntos de materialidad para el recurso patrimonial, se han construido unos indicadores cualitativos y cuantitativos para cada uno y se han recopilado los datos pertinentes.
            </p>
            """

            diagnosis_indicators_text_html = self.generate_simple_text({"title": "Indicadores de diagnóstico", "text": diagnosis_indicators_text})

            # INDICADORES DE DIAGNÓSTICO: TABLA
            
            diagnosis_tables_data = data_dump.dump_diagnosis_tables_data(data)
            
            
            diagnosis_indicators_tables = self.generate_diagnosis_tables(diagnosis_tables_data, show_indicators=True)
            diagnosis_indicators_tables_html = ""
            tables = paginate_html_tables(diagnosis_indicators_tables, max_lines=56)
            if tables is not None:
                for table,i in zip(tables, range(1, len(tables) + 1)):
                    if i == 1:
                        diagnosis_indicators_tables_html += self.generate_simple_text({"title": "Indicadores de diagnóstico", "text": table})
                    else:
                        diagnosis_indicators_tables_html += self.generate_simple_text({"title": "", "text": table})

            # MATRIZ DE MATERIALIDAD
            
            
            materiality_matrix = data["materiality_matrix_text"] if data["materiality_matrix_text"] else ""
            # Añadir la imagen de la matriz
            materiality_matrix += self.generate_photo({"photo_url": data["materiality_matrix"], "description": "Matriz de materialidad"}, background_color="#FFFFFF")
            
            materiality_matrix_text_html = ""
            pages = paginate_html_text(materiality_matrix, max_lines=30, chars_per_line=60)
            for page,i in zip(pages, range(1, len(pages) + 1)):
                if i == 1:
                    materiality_matrix_text_html += self.generate_simple_text({"title": "Matriz de materialidad", "text": page})
                else:
                    materiality_matrix_text_html += self.generate_simple_text({"title": "", "text": page})

            topics_priority_table_html = self.generate_topics_table(material_topic_legend, show_priority=True)
            pages = paginate_html_tables(topics_priority_table_html, max_lines=9)
            topics_priority_table_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        topics_priority_table_html += self.generate_simple_text({"title": "Asuntos de materialidad", "text": page})
                    else:
                        topics_priority_table_html += self.generate_simple_text({"title": "", "text": page})
            # IMPACTOS PRINCIPALES Y SECUNDARIOS
            
            main_impacts_graph = self.generate_photo({"photo_url": data["main_impacts_graph"], "description": "Impactos principales"}, background_color="#FFFFFF")
            secondary_impacts_graph = self.generate_photo({"photo_url": data["secondary_impacts_graph"], "description": "Impactos secundarios"}, background_color="#FFFFFF")

            main_secondary_impacts_graphs_html = ""
            main_secondary_impacts_graphs_html += data["main_secondary_impacts_text"] if data["main_secondary_impacts_text"] else ""
            main_secondary_impacts_graphs_html += main_impacts_graph
            main_secondary_impacts_graphs_html += secondary_impacts_graph

            main_secondary_impacts_graphs = paginate_html_text(main_secondary_impacts_graphs_html, max_lines=40, chars_per_line=35)
            main_secondary_impacts_graphs_html = ""
            if main_secondary_impacts_graphs is not None:
                for page,i in zip(main_secondary_impacts_graphs, range(1, len(main_secondary_impacts_graphs) + 1)):
                    if i == 1:
                        main_secondary_impacts_graphs_html += self.generate_simple_text({"title": "Impactos principales y secundarios", "text": page})
                    else:
                        main_secondary_impacts_graphs_html += self.generate_simple_text({"title": "", "text": page})

            impacts_graphs_legend_html = self.generate_impacts_graphs_legend(ods_images)

            # HOJA DE RUTA DE LA SOSTENIBILIDAD
            roadmap_description = data["roadmap_description"] if data["roadmap_description"] else ""
            pages = paginate_html_text(roadmap_description, max_lines=60, chars_per_line=35)
            roadmap_description_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        roadmap_description_html += self.generate_simple_text({"title": "Hoja de ruta de la sostenibilidad", "text": page})
                    else:
                        roadmap_description_html += self.generate_simple_text({"title": "", "text": page})

            # PLAN DE ACCIÓN
            
            action_plan_text = data["action_plan_text"] if data["action_plan_text"] else ""
            pages = paginate_html_text(action_plan_text, max_lines=60, chars_per_line=35)
            action_plan_text_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        action_plan_text_html += self.generate_simple_text({"title": "Plan de acción", "text": page})
                    else:
                        action_plan_text_html += self.generate_simple_text({"title": "", "text": page})

            # PLAN DE ACCIÓN: TABLAS
            
            action_plan = data_dump.dump_action_plan_data(data)
            action_plan_tables = self.generate_action_plan_tables(action_plan)

            tables = paginate_html_tables(action_plan_tables, max_lines=46)
            action_plan_tables_html = ""
            if tables is not None:
                for table,i in zip(tables, range(1, len(tables) + 1)):
                    if i == 1:
                        action_plan_tables_html += self.generate_simple_text({"title": "Plan de acción", "text": table})
                    else:
                        action_plan_tables_html += self.generate_simple_text({"title": "", "text": table})
            
            # COHERENCIA INTERNA
            
            internal_consistency_text = data["internal_consistency_description"] if data["internal_consistency_description"] else ""
            internal_consistency_text += self.generate_photo({"photo_url": data["internal_consistency_graph"], "description": "Impactos del Plan de acción en las dimensiones del desarrollo sostenible"}, background_color="#FFFFFF")
            pages = paginate_html_text(internal_consistency_text, max_lines=60, chars_per_line=35)
            
            internal_consistency_text_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        internal_consistency_text_html += self.generate_simple_text({"title": "Impactos del Plan de acción en las dimensiones del desarrollo sostenible", "text": page})
                    else:
                        internal_consistency_text_html += self.generate_simple_text({"title": "", "text": page})

            internal_consistency_legend = self.generate_consistency_legend(data["dimension_totals"])
            # DIFUSION
            
            diffusion_text = data["diffusion_text"]
            pages = paginate_html_text(diffusion_text, max_lines=50, chars_per_line=35)
            diffusion_text_html = ""
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        diffusion_text_html += self.generate_simple_text({"title": "Difusión", "text": page})
                    else:
                        diffusion_text_html += self.generate_simple_text({"title": "", "text": page})
            
            # Convenios de colaboración

            agreements = self.generate_list_text(data_dump.dump_agreements_data(data["agreements"]))
            agreements_html = ""
            pages = paginate_html_text(agreements, max_lines=60, chars_per_line=35)
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        agreements_html += self.generate_simple_text({"title": "Convenios de colaboración", "text": page})
                    else:
                        agreements_html += self.generate_simple_text({"title": "", "text": page})

            # Bibliografía
            
            bibliography = self.generate_list_text(data_dump.dump_bibliography_data(data["bibliographies"]))
            bibliography_html = ""
            pages = paginate_html_text(bibliography, max_lines=60, chars_per_line=35)
            if pages is not None:
                for page,i in zip(pages, range(1, len(pages) + 1)):
                    if i == 1:
                        bibliography_html += self.generate_simple_text({"title": "Bibliografía", "text": page})
                    else:
                        bibliography_html += self.generate_simple_text({"title": "", "text": page})
            
            # Galería fotográfica
            gallery = data_dump.dump_gallery_data(data["gallery"])
            gallery_html = ""
            for item in gallery:
                gallery_html += self.generate_photo({"photo_url": item["photo"], "description": item["description"]}, background_color="#FFFFFF")
            pages = paginate_html_text(gallery_html, max_lines=40, chars_per_line=60)
            gallery_pages_html = ""
            for page,i in zip(pages, range(1, len(pages) + 1)):
                if i == 1:
                    gallery_pages_html += self.generate_simple_text({"title": "Galería fotográfica", "text": page})
                else:
                    gallery_pages_html += self.generate_simple_text({"title": "", "text": page})

            combined_text_data = {
                "id": data["id"],
                "cover": cover_html,
                "resource_info": resource_info_html,
                "index": index_html,
                "commitment_letter": commitment_letter_html,
                "mission": mission_html,
                "vision": vision_html,
                "values_section": values_section_html,
                "norms": norms_html,
                "org_chart": organization_chart_html,
                "stakeholders": stakeholders_html,
                "diagnosis": diagnosis_html,
                "topics_table": topics_table_html,
                "materiality_text": materiality_text_html,
                "ods_dimensions": ods_dimensions_html,
                "material_topics": material_topics_html,
                "diagnosis_indicators": diagnosis_indicators_text_html,
                "diagnosis_indicators_tables": diagnosis_indicators_tables_html,
                "materiality_matrix": materiality_matrix_text_html,
                "topics_priority_table": topics_priority_table_html,
                "main_secondary_impacts_graphs": main_secondary_impacts_graphs_html,
                "impacts_graphs_legend": impacts_graphs_legend_html,
                "roadmap": roadmap_description_html,
                "action_plan": action_plan_text_html,
                "action_plan_tables": action_plan_tables_html,
                "internal_consistency": internal_consistency_text_html,
                "internal_consistency_legend": internal_consistency_legend,
                "diffusion": diffusion_text_html,
                "agreements": agreements_html,
                "bibliography": bibliography_html,
                "gallery": gallery_pages_html,
            }

            combined_html = self.generate_combined_html(combined_text_data)
            # Crear subdirectorio para el reporte
            report_dir = os.path.join(settings.REPORTS_DIR, str(data['id']))
            if not os.path.exists(report_dir):
                os.makedirs(report_dir, exist_ok=True)
            filename = f"report_{data['id']}.html"
            path = os.path.join(report_dir, filename)
            with open(path, "w", encoding="utf-8") as file:
                file.write(combined_html)
            # Devuelve la URL pública, no la ruta absoluta
            return f"/static/uploads/reports/{data['id']}/{filename}"
        except Exception as e:
            logger.error(f"Error al generar el reporte: {str(e)}")
            raise e

    def generate_report_preview(self, data: Dict[str, Any]) -> str:
        """
        Genera una vista previa del reporte sin paginación.
        Returns:
            str: HTML renderizado del reporte completo sin paginación
        """
        try:
            data_dump = DataDump()

            import logging
            logger = logging.getLogger(__name__)
            # PORTADA
            cover_html = self.generate_cover(
                data_dump.dump_cover_data(data)
            )

            # INFORMACIÓN DEL RECURSO
            resource_info_html = self.generate_resource_info(data_dump.dump_resource_info_data(data["resource"]))
            
            # ÍNDICE
            index_template = self.template_env.get_template("index_template.html")
            index_html = index_template.render()
            
            # CARTA DE COMPROMISO
            commitment_letter_html = self.generate_preview_simple_text({
                "title": "Carta de compromiso", 
                "text": data["commitment_letter"]
            })
            
            # MISION
            mission_html = self.generate_preview_simple_text({
                "title": "Misión", 
                "text": data["mission"]
            })

            # VISION
            vision_html = self.generate_preview_simple_text({
                "title": "Visión", 
                "text": data["vision"]
            })

            # VALORES
            values_section_html = self.generate_preview_simple_text({
                "title": "Valores", 
                "text": data["values"]
            })

            # NORMATIVA
            norms = self.generate_list_text(data_dump.dump_norms_data(data["norms"]))
            norms_html = self.generate_preview_simple_text({
                "title": "Normativa", 
                "text": norms
            })

            # ORGANIGRAMA
            organization_chart = data["org_chart_text"] if data["org_chart_text"] else ""
            team_members = data_dump.dump_team_members_data(data["team_members"])
            organization_chart += self.generate_list_text(team_members)
            organization_chart += self.generate_photo({"photo_url": data["org_chart_figure"], "description": "Organigrama"}, background_color="#FFFFFF")
            organization_chart_html = self.generate_preview_simple_text({
                "title": "Organigrama", 
                "text": organization_chart
            })

            # GRUPOS DE INTERÉS
            stakeholders = data["stakeholders_description"] if data["stakeholders_description"] else ""
            stakeholder_dict = data_dump.dump_stakeholders_data(data["stakeholders"])
            stakeholders += "<h3>Internos</h3>"
            stakeholders += self.generate_list_text(stakeholder_dict["internal"])
            stakeholders += "<h3>Externos</h3>"
            stakeholders += self.generate_list_text(stakeholder_dict["external"])
            stakeholders_html = self.generate_preview_simple_text({
                "title": "Análisis de los grupos de interés", 
                "text": stakeholders
            })

            # DIAGNÓSTICO
            diagnosis_html = self.generate_preview_simple_text({
                "title": "Diagnóstico", 
                "text": data["diagnosis_description"]
            })

            # ASUNTOS DE MATERIALIZIDAD: TABLA
            material_topics = data_dump.dump_material_topics_data(data["material_topics"])
            material_topic_legend = data_dump.material_topics_data_from_legend(data["legend"])
            topics_table_html = self.generate_topics_table(material_topic_legend)
            material_topics_table_html = self.generate_preview_simple_text({
                "title": "Asuntos de materialidad", 
                "text": topics_table_html
            })
            
            # 5p y ODS
            ods_images = data_dump.get_ods_images_dict(settings.IMAGES_DIR)
            ods_dimensions_html = self.generate_ods_dimensions_text(ods_images)
            
            # ASUNTOS DE MATERIALIZIDAD: INTRODUCCIÓN
            materiality_text = data["materiality_text"] if data["materiality_text"] else ""
            materiality_text_html = self.generate_preview_simple_text({
                "title": "Asuntos de materialidad", 
                "text": materiality_text
            })

            # ASUNTOS DE MATERIALIZIDAD: LISTA
            material_topics_html = self.generate_material_topics_text("", material_topics["material_topics"])
            material_topics_html = self.generate_preview_simple_text({
                "title": "Asuntos de materialidad", 
                "text": material_topics_html
            })
            
            # INDICADORES DE DIAGNÓSTICO
            diagnosis_indicators_text = """
            <p>
            Una vez definidos los asuntos de materialidad para el recurso patrimonial, se han construido unos indicadores cualitativos y cuantitativos para cada uno y se han recopilado los datos pertinentes.
            </p>
            """
            diagnosis_indicators_text_html = self.generate_preview_simple_text({
                "title": "Indicadores de diagnóstico", 
                "text": diagnosis_indicators_text
            })

            # INDICADORES DE DIAGNÓSTICO: TABLA
            diagnosis_tables_data = data_dump.dump_diagnosis_tables_data(data)
            diagnosis_indicators_tables = self.generate_diagnosis_tables(diagnosis_tables_data, show_indicators=True)
            diagnosis_indicators_tables_html = self.generate_preview_simple_text({
                "title": "Indicadores de diagnóstico", 
                "text": diagnosis_indicators_tables
            })

            # MATRIZ DE MATERIALIDAD
            materiality_matrix = data["materiality_matrix_text"] if data["materiality_matrix_text"] else ""
            materiality_matrix += self.generate_photo({"photo_url": data["materiality_matrix"], "description": "Matriz de materialidad"}, background_color="#FFFFFF")
            materiality_matrix_text_html = self.generate_preview_simple_text({
                "title": "Matriz de materialidad", 
                "text": materiality_matrix
            })

            topics_priority_table_html = self.generate_topics_table(material_topic_legend, show_priority=True)



            # IMPACTOS PRINCIPALES Y SECUNDARIOS
            main_impacts_graph = self.generate_photo({"photo_url": data["main_impacts_graph"], "description": "Impactos principales"}, background_color="#FFFFFF")
            secondary_impacts_graph = self.generate_photo({"photo_url": data["secondary_impacts_graph"], "description": "Impactos secundarios"}, background_color="#FFFFFF")
            main_secondary_impacts_graphs_html = data["main_secondary_impacts_text"] if data["main_secondary_impacts_text"] else ""
            main_secondary_impacts_graphs_html += main_impacts_graph
            main_secondary_impacts_graphs_html += secondary_impacts_graph
            main_secondary_impacts_graphs_html = self.generate_preview_simple_text({
                "title": "Impactos principales y secundarios", 
                "text": main_secondary_impacts_graphs_html
            })

            impacts_graphs_legend_html = self.generate_impacts_graphs_legend(ods_images)

            # HOJA DE RUTA DE LA SOSTENIBILIDAD
            roadmap_description = data["roadmap_description"] if data["roadmap_description"] else ""
            roadmap_description_html = self.generate_preview_simple_text({
                "title": "Hoja de ruta de la sostenibilidad", 
                "text": roadmap_description
            })

            # PLAN DE ACCIÓN
            action_plan_text = data["action_plan_text"] if data["action_plan_text"] else ""
            action_plan_text_html = self.generate_preview_simple_text({
                "title": "Plan de acción", 
                "text": action_plan_text
            })

            # PLAN DE ACCIÓN: TABLAS
            action_plan = data_dump.dump_action_plan_data(data)
            action_plan_tables = self.generate_action_plan_tables(action_plan)
            action_plan_tables_html = self.generate_preview_simple_text({
                "title": "Plan de acción", 
                "text": action_plan_tables
            })
            
            # COHERENCIA INTERNA
            internal_consistency_text = data["internal_consistency_description"] if data["internal_consistency_description"] else ""
            internal_consistency_text += self.generate_photo({"photo_url": data["internal_consistency_graph"], "description": "Impactos del Plan de acción en las dimensiones del desarrollo sostenible"}, background_color="#FFFFFF")
            internal_consistency_text_html = self.generate_preview_simple_text({
                "title": "Impactos del Plan de acción en las dimensiones del desarrollo sostenible", 
                "text": internal_consistency_text
            })

            internal_consistency_legend = self.generate_consistency_legend(data["dimension_totals"])
            print("dimension_totals:", data["dimension_totals"])

            # DIFUSION
            diffusion_text = data["diffusion_text"]
            diffusion_text_html = self.generate_preview_simple_text({
                "title": "Difusión", 
                "text": diffusion_text
            })
            
            # Convenios de colaboración
            agreements = self.generate_list_text(data_dump.dump_agreements_data(data["agreements"]))
            agreements_html = self.generate_preview_simple_text({
                "title": "Convenios de colaboración", 
                "text": agreements
            })

            # Bibliografía
            bibliography = self.generate_list_text(data_dump.dump_bibliography_data(data["bibliographies"]))
            bibliography_html = self.generate_preview_simple_text({
                "title": "Bibliografía", 
                "text": bibliography
            })

            # Galería fotográfica
            gallery = data_dump.dump_gallery_data(data["gallery"])
            gallery_html = ""
            for item in gallery:
                gallery_html += self.generate_photo({"photo_url": item["photo"], "description": item["description"]}, background_color="#FFFFFF")
            
            combined_text_data = {
                "id": data["id"],
                "cover": cover_html,
                "resource_info": resource_info_html,
                "index": index_html,
                "commitment_letter": commitment_letter_html,
                "mission": mission_html,
                "vision": vision_html,
                "values_section": values_section_html,
                "norms": norms_html,
                "org_chart": organization_chart_html,
                "stakeholders": stakeholders_html,
                "diagnosis": diagnosis_html,
                "topics_table": topics_table_html,
                "materiality_text": materiality_text_html,
                "ods_dimensions": ods_dimensions_html,
                "material_topics": material_topics_html,
                "diagnosis_indicators": diagnosis_indicators_text_html,
                "diagnosis_indicators_tables": diagnosis_indicators_tables_html,
                "materiality_matrix": materiality_matrix_text_html,
                "topics_priority_table": topics_priority_table_html,
                "main_secondary_impacts_graphs": main_secondary_impacts_graphs_html,
                "impacts_graphs_legend": impacts_graphs_legend_html,
                "roadmap": roadmap_description_html,
                "action_plan": action_plan_text_html,
                "action_plan_tables": action_plan_tables_html,
                "internal_consistency": internal_consistency_text_html,
                "internal_consistency_legend": internal_consistency_legend,
                "diffusion": diffusion_text_html,
                "agreements": agreements_html,
                "bibliography": bibliography_html,
                "gallery": gallery_html,
            }

            combined_html = self.generate_combined_html(combined_text_data)
            # Crear subdirectorio para el reporte
            report_dir = os.path.join(settings.REPORTS_DIR, str(data['id']))
            if not os.path.exists(report_dir):
                os.makedirs(report_dir, exist_ok=True)
            filename = f"report_{data['id']}_preview.html"
            path = os.path.join(report_dir, filename)
            with open(path, "w", encoding="utf-8") as file:
                file.write(combined_html)
            # Devuelve la URL pública, no la ruta absoluta
            return f"/static/uploads/reports/{data['id']}/{filename}"
        except Exception as e:
            logger.error(f"Error al generar la vista previa del reporte: {str(e)}")
            raise e