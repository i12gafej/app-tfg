import matplotlib
matplotlib.use('Agg')  # Configurar el backend antes de importar pyplot
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import io
import base64
from typing import List, Dict, Tuple
import logging

# Colores oficiales ODS
ODS_COLORS = {
    "ODS 1": "#EB1C2D",   "ODS 2": "#D3A029",   "ODS 3": "#279B48",
    "ODS 4": "#C31F33",   "ODS 5": "#EF412C",   "ODS 6": "#01AED9",
    "ODS 7": "#fcc30b",   "ODS 8": "#8F1A39",   "ODS 9": "#F36F28",
    "ODS 10": "#E21A87",  "ODS 11": "#F99D28",  "ODS 12": "#CF8D2A",
    "ODS 13": "#49793F",  "ODS 14": "#007DBC",  "ODS 15": "#3FB04A",
    "ODS 16": "#04568C",  "ODS 17": "#1A386A"
}

logger = logging.getLogger(__name__)

def generate_graph(values: List[int], title: str) -> str:
    """
    Genera una gráfica de barras y la devuelve como data URL
    """
    try:
        fig, ax = plt.subplots(figsize=(8, 5), dpi=100)
        ax.set_facecolor('none')
        max_val = max(values)
        if max_val < 10:
            step = 1
            upper_limit = max_val
        else:
            step = 2
            upper_limit = max_val + 1 if max_val % 2 != 0 else max_val

        for y in range(0, upper_limit + 1, step):
            ax.axhline(y=y, linestyle=':', color='gray', linewidth=0.8, zorder=1)

        ods_labels = [f"ODS {i+1}" for i in range(17)]
        colors = [ODS_COLORS[label] for label in ods_labels]
        ax.bar(ods_labels, values, color=colors, width=1.0, edgecolor='none', zorder=2)

        ax.set_yticks(range(0, upper_limit + 1, step))
        ax.set_ylim(0, upper_limit + 1)
        ax.tick_params(axis='x', rotation=45, labelsize=10)
        ax.tick_params(axis='y', labelsize=10)
        ax.tick_params(axis='x', length=0)
        ax.tick_params(axis='y', length=0)
        for spine in ax.spines.values():
            spine.set_visible(False)
        fig.tight_layout()

        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', transparent=True)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close(fig)  # Cierra la figura explícitamente

        return f"data:image/png;base64,{base64.b64encode(image_png).decode()}"
    finally:
        plt.close('all')

def get_main_impacts_material_topics_graph(material_topics: List[Dict]) -> str:
    """
    Genera la gráfica de impactos principales
    """
    try:
        # Inicializar contador de impactos principales
        impact_counts = [0] * 17
        
        # Contar impactos principales
        for topic in material_topics:
            ods_id = getattr(topic, 'goal_ods_id', None)
            if ods_id is not None and 1 <= ods_id <= 17:
                impact_counts[ods_id - 1] += 1
        
        return generate_graph(impact_counts, "IMPACTOS ODS PRINCIPAL")
    except Exception as e:
        logger.error(f"Error al generar gráfica de impactos principales: {str(e)}")
        raise

def get_secondary_impacts_material_topics_graph(secondary_impacts: List[Dict]) -> str:
    """
    Genera la gráfica de impactos secundarios
    """
    try:
        # Inicializar contador de impactos secundarios
        impact_counts = [0] * 17
        
        logger.info(f"Recibiendo datos de impactos secundarios: {secondary_impacts}")
        
        # Contar impactos secundarios
        for impact in secondary_impacts:
            if isinstance(impact, dict) and 'ods_ids' in impact:
                logger.info(f"Procesando impacto: {impact}")
                for ods_id in impact['ods_ids']:
                    if 1 <= ods_id <= 17:
                        impact_counts[ods_id - 1] += 1
        
        logger.info(f"Conteo final de impactos secundarios: {impact_counts}")
        return generate_graph(impact_counts, "IMPACTOS ODS SECUNDARIO")
    except Exception as e:
        logger.error(f"Error al generar gráfica de impactos secundarios: {str(e)}")
        raise
