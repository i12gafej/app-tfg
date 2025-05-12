from typing import Dict, Any

class ReportGenerator:
    def generate_diagnosis_text(self, data: Dict[str, Any]) -> str:
        """Genera el texto del diagnóstico con los asuntos de materialidad."""
        # Extraer los datos necesarios
        material_topics = data.get('material_topics', [])
        get_ods_image_path = data.get('get_ods_image_path')
        get_5p_image_path = data.get('get_5p_image_path')
        
        # Preparar el contexto para el template
        context = {
            'material_topics': material_topics,
            'get_ods_image_path': get_ods_image_path,
            'get_5p_image_path': get_5p_image_path
        }
        
        return self.env.get_template('ods_dimension_template.html').render(**context) 