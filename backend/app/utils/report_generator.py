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

    def generate_simple_text(self, data: Dict[str, Any]) -> str:
        """
        Genera una página con título y texto simple.
        Returns:
            str: HTML renderizado del texto simple
        """
        template = self.template_env.get_template("simple_text_template.html")
        return template.render(data=data)

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

    def generate_photo(self, data: Dict[str, Any]) -> str:
        """
        Genera una página con una fotografía y su descripción.
        Returns:
            str: HTML renderizado de la foto con descripción
        """
        template = self.template_env.get_template("photo_template.html")
        return template.render(data=data)

    def generate_diagnosis_text(self, data: Dict[str, Any]) -> str:
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

    def generate_material_topics_text(self, material_topics: List[Dict[str, Any]]) -> str:
        """
        Genera el texto de los asuntos de materialidad.
        Args:
            material_topics: Lista de asuntos de materialidad
        Returns:
            str: HTML renderizado de los asuntos de materialidad
        """
        template = self.template_env.get_template("material_topics_template.html")
        return template.render(material_topics=material_topics)

    def generate_diagnosis_impact_tables(self, data: Dict[str, Any]) -> str:
        """
        Genera las tablas de impactos ODS.
        Returns:
            str: HTML renderizado de las tablas de impactos
        """
        template = self.template_env.get_template("diagnosis_impact_tables_template.html")
        return template.render(data=data)

    def generate_diagnosis_indicator_tables(self, data: Dict[str, Any]) -> str:
        """
        Genera las tablas de indicadores de diagnóstico.
        Returns:
            str: HTML renderizado de las tablas de indicadores
        """
        template = self.template_env.get_template("diagnosis_indicator_tables_template.html")
        return template.render(data=data)

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

    def generate_roadmap_tables(self, data: Dict[str, Any], show_responsible: bool = False) -> str:
        """
        Genera las tablas de hoja de ruta.
        Returns:
            str: HTML renderizado de las tablas de hoja de ruta
        """
        template = self.template_env.get_template("roadmap_tables_template.html")
        return template.render(data=data, show_responsible=show_responsible)

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

    def generate_full_report(self, data: Dict[str, Any]) -> str:
        """
        Genera el reporte completo combinando todas las secciones.
        Returns:
            str: HTML renderizado del reporte completo
        """
        template = self.template_env.get_template("full_report_template.html")
        return template.render(data=data)

    def paginate_html_text(self, html: str, max_lines: int = 60, chars_per_line: int = 40) -> list:
        """
        Divide el texto HTML en páginas según un límite de líneas virtuales y caracteres por línea,
        partiendo párrafos y listas si es necesario.
        """
        def count_lines(text):
            return max(1, (len(text) // chars_per_line) + (1 if len(text) % chars_per_line else 0))

        soup = BeautifulSoup(html, "html.parser")
        blocks = []
        current_page = ""
        current_lines = 0

        def add_page(content):
            nonlocal current_page, current_lines
            blocks.append(current_page)
            current_page = content
            current_lines = 0

        for elem in soup.contents:
            if elem.name == "p":
                text = elem.get_text()
                lines = count_lines(text) + 1
                if lines > max_lines:
                    # Divide el párrafo en trozos que quepan en una página
                    words = text.split()
                    chunk = []
                    chunk_lines = 0
                    for word in words:
                        chunk.append(word)
                        chunk_text = " ".join(chunk)
                        needed = count_lines(chunk_text)
                        if current_lines + needed + 1 > max_lines:
                            # Añade el trozo anterior como página
                            current_page += f"<p>{' '.join(chunk[:-1])}</p>"
                            add_page("")
                            chunk = [word]
                            current_lines = 0
                        current_lines = count_lines(" ".join(chunk))
                    if chunk:
                        current_page += f"<p>{' '.join(chunk)}</p>"
                        current_lines += 1
                else:
                    if current_lines + lines > max_lines and current_page:
                        add_page("")
                    current_page += str(elem)
                    current_lines += lines

            elif elem.name in ["ul", "ol"]:
                items = elem.find_all("li", recursive=False)
                is_ordered = elem.name == "ol"
                start = int(elem.get("start", 1)) if is_ordered else 1
                i = 0
                while i < len(items):
                    list_lines = 0
                    list_html = ""
                    if is_ordered:
                        list_html += f'<ol start="{start + i}">'
                    else:
                        list_html += "<ul>"
                    while i < len(items):
                        li_text = items[i].get_text()
                        li_lines = count_lines(li_text) + 1
                        if current_lines + list_lines + li_lines > max_lines and list_lines > 0:
                            break
                        list_html += str(items[i])
                        list_lines += li_lines
                        i += 1
                    list_html += "</ol>" if is_ordered else "</ul>"
                    if current_lines + list_lines > max_lines and current_page:
                        add_page("")
                    current_page += list_html
                    current_lines += list_lines
                    if i < len(items):
                        add_page("")

            elif elem.name == "br":
                if current_lines + 1 > max_lines and current_page:
                    add_page("")
                current_page += "<br>"
                current_lines += 1

            else:
                text = elem.get_text() if hasattr(elem, 'get_text') else str(elem)
                lines = count_lines(text)
                if current_lines + lines > max_lines and current_page:
                    add_page("")
                current_page += str(elem)
                current_lines += lines

        if current_page:
            blocks.append(current_page)
        return blocks

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
    pages = generator.paginate_html_text(
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