import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import io
import base64
import math
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from app.models.models import Assessment, MaterialTopic, Stakeholder
import logging

logger = logging.getLogger(__name__)

# Definición de dimensiones y colores
DIMENSION_COLORS = {
    "PERSONAS": "#7ec7f4",
    "PLANETA": "#81c43b",
    "PROSPERIDAD": "#f3c244",
    "PAZ": "#a897d4",
    "ALIANZAS": "#e379c1"
}

def get_dimension_by_ods(ods_id: int) -> str:
    """Determina la dimensión basada en el ODS."""
    if 1 <= ods_id <= 5:
        return "PERSONAS"
    elif ods_id in [6, 12, 13, 14, 15]:
        return "PLANETA"
    elif 7 <= ods_id <= 11:
        return "PROSPERIDAD"
    elif ods_id == 16:
        return "PAZ"
    elif ods_id == 17:
        return "ALIANZAS"
    else:
        return "OTROS"

def calculate_averages(assessments: List[Assessment], stakeholders: Dict[int, Stakeholder]) -> Dict[int, Tuple[float, float]]:
    """Calcula las medias internas y externas para cada material topic."""
    topic_scores: Dict[int, Dict[str, List[float]]] = {}
    
    for assessment in assessments:
        stakeholder = stakeholders.get(assessment.stakeholder_id)
        if not stakeholder:
            continue

        topic_id = assessment.material_topic_id
        if topic_id not in topic_scores:
            topic_scores[topic_id] = {"internal": [], "external": []}

        score_type = "internal" if stakeholder.type == "internal" else "external"
        topic_scores[topic_id][score_type].append(assessment.score)

    averages = {}
    for topic_id, scores in topic_scores.items():
        internal_avg = sum(scores["internal"]) / len(scores["internal"]) if scores["internal"] else 0
        external_avg = sum(scores["external"]) / len(scores["external"]) if scores["external"] else 0
        averages[topic_id] = (internal_avg, external_avg)

    return averages

def create_materiality_matrix_data(db: Session, report_id: int) -> Dict:
    """Genera los datos para la matriz de materialidad."""
    try:
        # Obtener todos los datos necesarios
        material_topics = db.query(MaterialTopic).filter(MaterialTopic.report_id == report_id).all()
        stakeholders = {s.id: s for s in db.query(Stakeholder).filter(Stakeholder.report_id == report_id).all()}
        assessments = db.query(Assessment)\
            .join(MaterialTopic, Assessment.material_topic_id == MaterialTopic.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()

        # Calcular medias
        averages = calculate_averages(assessments, stakeholders)

        # Organizar datos por dimensión y crear respuesta
        matrix_data = {
            "points": {},
            "dimensions": {},
            "topic_names": {},
            "dimension_colors": DIMENSION_COLORS
        }

        for topic in material_topics:
            if topic.id in averages:
                matrix_data["points"][topic.id] = {
                    "x": averages[topic.id][0],  # media interna
                    "y": averages[topic.id][1],  # media externa
                }
                dimension = get_dimension_by_ods(topic.goal_ods_id) if topic.goal_ods_id else "OTROS"
                matrix_data["dimensions"][topic.id] = dimension
                matrix_data["topic_names"][topic.id] = topic.name

        return matrix_data

    except Exception as e:
        logger.error(f"Error al generar datos de la matriz de materialidad: {str(e)}")
        raise

def generate_matrix_image(matrix_data: Dict) -> str:
    """Genera la imagen de la matriz de materialidad."""
    try:
        # Verificar si hay datos de valoraciones
        if not matrix_data["points"]:
            raise ValueError("No hay datos de valoraciones disponibles para generar la matriz de materialidad. Por favor, asegúrese de que existen valoraciones para los asuntos materiales.")

        # Limpiar cualquier figura existente
        plt.close('all')
        
        # Configurar el gráfico
        fig, ax = plt.subplots(figsize=(10, 10), dpi=100)
        
        # Encontrar la escala máxima
        max_coord = max(
            max(point["x"] for point in matrix_data["points"].values()),
            max(point["y"] for point in matrix_data["points"].values())
        )
        max_escala = math.ceil(max_coord)

        # Configurar límites y zonas
        baja_lim = int(max_escala * 0.6)
        media_lim = int(max_escala * 0.8)

        ax.set_xlim(-0.1, max_escala + 0.1)
        ax.set_ylim(-0.1, max_escala + 0.1)
        ax.set_xticks(range(0, max_escala + 1))
        ax.set_yticks(range(0, max_escala + 1))
        ax.grid(True, which='major', linestyle=':', color='gray')
        ax.set_xlabel("Internos", fontsize=12, fontweight='bold')
        ax.set_ylabel("Externos", fontsize=12, fontweight='bold')

        # Eliminar bordes
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Añadir zonas
        ax.add_patch(patches.Rectangle((0, 0), baja_lim, baja_lim, fill=False, linestyle=':', edgecolor='green', linewidth=1.5))
        ax.add_patch(patches.Rectangle((0, 0), media_lim, media_lim, fill=False, linestyle=':', edgecolor='red', linewidth=1.5))
        ax.add_patch(patches.Rectangle((0, 0), max_escala, max_escala, fill=False, linestyle=':', edgecolor='blue', linewidth=1.5))

        # Etiquetas de zonas
        ax.text(0.2, baja_lim - 0.15, "BAJA", color='green', fontsize=10, fontweight='bold', va='top')
        ax.text(0.2, media_lim - 0.15, "MEDIA", color='red', fontsize=10, fontweight='bold', va='top')
        ax.text(0.2, max_escala - 0.15, "ALTA", color='blue', fontsize=10, fontweight='bold', va='top')

        # Dibujar puntos
        for topic_id, point in matrix_data["points"].items():
            dimension = matrix_data["dimensions"][topic_id]
            color = matrix_data["dimension_colors"][dimension]
            ax.scatter(point["x"], point["y"], s=300, color=color, alpha=0.7, edgecolor='black', linewidth=0.5, clip_on=False)
            ax.text(point["x"], point["y"], str(topic_id), fontsize=9, ha='center', va='center', fontweight='bold', color='black', clip_on=False)

        plt.tight_layout()

        # Convertir a data URL
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight', transparent=True)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()

        return f"data:image/png;base64,{base64.b64encode(image_png).decode()}"

    except Exception as e:
        logger.error(f"Error al generar imagen de la matriz: {str(e)}")
        raise
    finally:
        # Asegurar que se limpian todos los recursos
        plt.close('all')
