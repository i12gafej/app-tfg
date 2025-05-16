import os
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from typing import Dict, List, Optional, Any
from app.core.config import Settings
from bs4 import BeautifulSoup
import re

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

    def generate_simple_text(self, data: Dict[str, Any], background_color: str = None) -> str:
        """
        Genera una página con título y texto simple.
        Returns:
            str: HTML renderizado del texto simple
        """
        template = self.template_env.get_template("simple_text_template.html")
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
        items = data.get("items", [])
        items = self.detect_and_format_urls(items)
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
        template_data = {
            'ods': data.get('ods')
        }
        
        return ods_template.render(**template_data)

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

    def generate_diagnosis_impact_tables(self, data: Dict[str, Any]) -> str:
        """
        Genera las tablas de impactos ODS.
        Returns:
            str: HTML renderizado de las tablas de impactos
        """
        template = self.template_env.get_template("diagnosis_impact_tables_template.html")
        return template.render(data=data)

    def generate_diagnosis_tables(self, data: Dict[str, Any], show_indicators: bool = True, introduction_text: str = None) -> str:
        """
        Genera las tablas de indicadores de diagnóstico.
        Returns:
            str: HTML renderizado de las tablas de indicadores
        """
        template = self.template_env.get_template("diagnosis_tables_template.html")
        return template.render(data=data, show_indicators=show_indicators, intro_text=introduction_text)

    def generate_materiality_matrix(self, data: Dict[str, Any]) -> str:
        """
        Genera la matriz de materialidad con su leyenda.
        Returns:
            str: HTML renderizado de la matriz de materialidad
        """
        template = self.template_env.get_template("materiality_matrix_template.html")
        return template.render(data=data)

    def generate_impact_graph(self, data: Dict[str, Any]) -> str:
        """
        Genera el gráfico de impactos con su leyenda.
        Returns:
            str: HTML renderizado del gráfico de impactos
        """
        template = self.template_env.get_template("impact_graph_template.html")
        return template.render(data=data)

    def generate_action_plan_tables(self, data: Dict[str, Any], show_responsible: bool = True, show_indicators: bool = True) -> str:
        """
        Genera las tablas del plan de acción.
        Returns:
            str: HTML renderizado de las tablas del plan de acción
        """
        template = self.template_env.get_template("action_plan_tables_template.html")
        return template.render(data=data, show_responsible=show_responsible, show_indicators=show_indicators)

    def generate_action_plan_impact_tables(self, data: Dict[str, Any]) -> str:
        """
        Genera las tablas de impactos del plan de acción.
        Returns:
            str: HTML renderizado de las tablas de impactos del plan
        """
        template = self.template_env.get_template("action_plan_impact_tables_template.html")
        return template.render(data=data)

    def generate_internal_consistency_graph(self, data: Dict[str, Any]) -> str:
        """
        Genera el gráfico de coherencia interna con su leyenda.
        Returns:
            str: HTML renderizado del gráfico de coherencia
        """
        template = self.template_env.get_template("internal_consistency_graph_template.html")
        return template.render(data=data)

    def generate_simple(self, data: Dict[str, Any]) -> str:
        """
        Genera el reporte completo combinando todas las secciones.
        Returns:
            str: HTML renderizado del reporte completo
        """
        template = self.template_env.get_template("simple.html")
        return template.render(data=data)
    

if __name__ == "__main__":
    # Ejemplo de uso
    generator = ReportGenerator()
    
    # Aquí irían los datos de ejemplo para cada sección
    sample_data = {
        "cover": {
            "title": "Memoria de Sostenibilidad 2023",
            "cover_image": "path/to/cover.jpg",
            "logos": ["path/to/logo1.png", "path/to/logo2.png"]
        },
        # ... más datos de ejemplo
    }
    
    # Generar HTML del reporte completo
    html_content = generator.generate_full_report(sample_data)
    print("HTML generado correctamente")

    # Paginar el texto simple usando los nuevos parámetros
    pages = paginate_html_text(
        simple_text_data["text"],
        max_lines=33,         # Número de líneas virtuales por página (ajusta según tus pruebas)
        chars_per_line=40     # Número de caracteres por línea virtual (ajusta según el ancho real de tu página)
    )

    simple_text_html = ""
    for page in pages:
        simple_text_html += generator.generate_simple_text({
            "title": simple_text_data["title"],
            "text": page
        }) 