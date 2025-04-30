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
    "ODS 1": "#e5243b",   "ODS 2": "#dda63a",   "ODS 3": "#4c9f38",
    "ODS 4": "#c5192d",   "ODS 5": "#ff3a21",   "ODS 6": "#26bde2",
    "ODS 7": "#fcc30b",   "ODS 8": "#a21942",   "ODS 9": "#fd6925",
    "ODS 10": "#dd1367",  "ODS 11": "#fd9d24",  "ODS 12": "#bf8b2e",
    "ODS 13": "#3f7e44",  "ODS 14": "#0a97d9",  "ODS 15": "#56c02b",
    "ODS 16": "#00689d",  "ODS 17": "#19486a"
}

logger = logging.getLogger(__name__)

def generate_graph(values: List[int], title: str) -> str:
    """
    Genera una gráfica de barras y la devuelve como data URL
    """
    # Configurar la figura
    plt.figure(figsize=(8, 5), dpi=100, facecolor='none')
    ax = plt.gca()
    
    # Crear las barras
    ods_labels = [f"ODS {i+1}" for i in range(17)]
    colors = [ODS_COLORS[label] for label in ods_labels]
    ax.bar(ods_labels, values, color=colors, width=1.0, edgecolor='none')
    
    # Configurar el fondo y las líneas
    ax.set_facecolor('none')
    max_val = max(values)
    step = 2 if max_val >= 10 else 1
    
    # Líneas horizontales punteadas
    for y in range(0, max_val + 1, step):
        ax.axhline(y=y, linestyle=':', color='gray', linewidth=0.8)
    
    # Configurar ejes y ticks
    ax.set_yticks(range(0, max_val + 1, step))
    ax.set_ylim(0, max_val + 1)
    ax.tick_params(axis='x', rotation=45, labelsize=10)
    ax.tick_params(axis='y', labelsize=10)
    ax.tick_params(axis='x', length=0)
    ax.tick_params(axis='y', length=0)
    
    # Eliminar bordes
    for spine in ax.spines.values():
        spine.set_visible(False)
    
    plt.tight_layout()
    
    # Convertir la gráfica a data URL
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', transparent=True)
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()
    plt.close()
    
    return f"data:image/png;base64,{base64.b64encode(image_png).decode()}"

def get_main_impacts_material_topics_graph(material_topics: List[Dict]) -> str:
    """
    Genera la gráfica de impactos principales
    """
    # Inicializar contador de impactos principales
    impact_counts = [0] * 17
    
    # Contar impactos principales
    for topic in material_topics:
        ods_id = getattr(topic, 'goal_ods_id', None)
        if ods_id is not None and 1 <= ods_id <= 17:
            impact_counts[ods_id - 1] += 1
    
    return generate_graph(impact_counts, "IMPACTOS ODS PRINCIPAL")

def get_secondary_impacts_material_topics_graph(secondary_impacts: List[Dict]) -> str:
    """
    Genera la gráfica de impactos secundarios
    """
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
