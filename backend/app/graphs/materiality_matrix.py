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

def create_materiality_matrix_data(db: Session, report_id: int, normalize: bool = False, scale: int = None) -> Dict:
    """Genera los datos para la matriz de materialidad."""
    try:
        # Obtener todos los datos necesarios
        material_topics = db.query(MaterialTopic).filter(MaterialTopic.report_id == report_id).all()
        stakeholders = {s.id: s for s in db.query(Stakeholder).filter(Stakeholder.report_id == report_id).all()}
        assessments = db.query(Assessment)\
            .join(MaterialTopic, Assessment.material_topic_id == MaterialTopic.id)\
            .filter(MaterialTopic.report_id == report_id)\
            .all()

        # Usar el scale recibido o buscarlo en la base de datos
        if scale is None:
            print("scale is None")
            report = db.execute(
                f"SELECT scale FROM sustainability_reports WHERE id = {report_id}"
            ).fetchone()
            scale = report[0] if report else 10  # Por defecto 10 si no se encuentra

        # Calcular medias
        averages = calculate_averages(assessments, stakeholders)

        # Si normalize es True, normalizar los datos en [1, scale]
        if normalize and averages:
            all_x = [avg[0] for avg in averages.values()]
            all_y = [avg[1] for avg in averages.values()]
            min_x, max_x = min(all_x), max(all_x)
            min_y, max_y = min(all_y), max(all_y)
            def norm(val, min_val, max_val):
                if max_val - min_val == 0:
                    return (scale + 1) / 2  # Centro del rango
                return ((val - min_val) / (max_val - min_val)) * (scale - 1) + 1
            for topic_id in averages:
                x, y = averages[topic_id]
                averages[topic_id] = (
                    norm(x, min_x, max_x),
                    norm(y, min_y, max_y)
                )

        # Organizar asuntos por dimensión y ordenar por id
        dimension_topics = {}
        for topic in material_topics:
            dimension = get_dimension_by_ods(topic.goal_ods_id) if topic.goal_ods_id else "OTROS"
            if dimension not in dimension_topics:
                dimension_topics[dimension] = []
            dimension_topics[dimension].append(topic)
        for dim in dimension_topics:
            dimension_topics[dim].sort(key=lambda t: t.id)

        # Orden global de dimensiones
        ordered_dims = ["PERSONAS", "PLANETA", "PROSPERIDAD", "PAZ", "ALIANZAS"]
        # Añadir cualquier otra dimensión al final
        other_dims = [d for d in dimension_topics.keys() if d not in ordered_dims]
        final_dim_order = ordered_dims + sorted(other_dims)

        # Asignar número de leyenda consecutivo siguiendo el orden global de dimensiones
        legend_numbers = {}
        leyenda_counter = 1
        leyenda_order = []
        for dim in final_dim_order:
            if dim in dimension_topics:
                for topic in dimension_topics[dim]:
                    legend_numbers[topic.id] = leyenda_counter
                    leyenda_order.append(topic.id)
                    leyenda_counter += 1

        # Organizar datos por dimensión y crear respuesta
        matrix_data = {
            "points": {},
            "dimensions": {},
            "topic_names": {},
            "dimension_colors": DIMENSION_COLORS,
            "legend_numbers": legend_numbers,
            "leyenda_order": leyenda_order,
            "scale": scale
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

def generate_matrix_image(matrix_data: Dict, scale: int = None) -> str:
    """Genera la imagen de la matriz de materialidad."""
    try:
        # Verificar si hay datos de valoraciones
        if not matrix_data["points"]:
            raise ValueError("No hay datos de valoraciones disponibles para generar la matriz de materialidad. Por favor, asegúrese de que existen valoraciones para los asuntos materiales.")

        # Limpiar cualquier figura existente
        plt.close('all')
        
        # Configurar el gráfico
        fig, ax = plt.subplots(figsize=(10, 10), dpi=100)

        # Usar el scale recibido o el del matrix_data
        max_escala = scale if scale is not None else matrix_data.get("scale", 10)

        # Calcular proporciones exactas
        baja_lim = max_escala * 0.6
        media_lim = max_escala * 0.8

        # Modificar los límites para que empiecen en 1,1
        ax.set_xlim(0.9, max_escala + 0.1)
        ax.set_ylim(0.9, max_escala + 0.1)
        ax.set_xticks([round(x, 1) for x in list(frange(1, max_escala + 0.1, 1))])
        ax.set_yticks([round(y, 1) for y in list(frange(1, max_escala + 0.1, 1))])
        ax.grid(True, which='major', linestyle=':', color='gray')
        ax.set_xlabel("Internos", fontsize=12, fontweight='bold')
        ax.set_ylabel("Externos", fontsize=12, fontweight='bold')
        ax.tick_params(axis='x', length=0)
        ax.tick_params(axis='y', length=0)

        # Eliminar bordes
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Añadir zonas con proporciones decimales
        ax.add_patch(patches.Rectangle((1, 1), baja_lim - 1, baja_lim - 1, fill=False, linestyle=':', edgecolor='green', linewidth=1.5))
        ax.add_patch(patches.Rectangle((1, 1), media_lim - 1, media_lim - 1, fill=False, linestyle=':', edgecolor='red', linewidth=1.5))
        ax.add_patch(patches.Rectangle((1, 1), max_escala - 1, max_escala - 1, fill=False, linestyle=':', edgecolor='blue', linewidth=1.5))

        # Etiquetas de zonas
        ax.text(1.2, baja_lim - 0.15, "BAJA", color='green', fontsize=10, fontweight='bold', va='top')
        ax.text(1.2, media_lim - 0.15, "MEDIA", color='red', fontsize=10, fontweight='bold', va='top')
        ax.text(1.2, max_escala - 0.15, "ALTA", color='blue', fontsize=10, fontweight='bold', va='top')

        # Agrupar puntos coincidentes
        point_groups = {}
        for topic_id, point in matrix_data["points"].items():
            # Redondear coordenadas para agrupar
            x_rounded = round(point["x"], 1)
            y_rounded = round(point["y"], 1)
            key = (x_rounded, y_rounded)
            if key not in point_groups:
                point_groups[key] = []
            point_groups[key].append(topic_id)

        # Dibujar puntos y números agrupados
        for (x, y), topic_ids in point_groups.items():
            # Dibujar el círculo (usando el primer topic_id para el color)
            first_topic_id = topic_ids[0]
            dimension = matrix_data["dimensions"][first_topic_id]
            color = matrix_data["dimension_colors"][dimension]
            ax.scatter(x, y, s=300, color=color, alpha=0.7, edgecolor='black', linewidth=0.5, clip_on=False)
            
            # Preparar el texto con los números de leyenda separados por comas
            legend_numbers = [str(matrix_data["legend_numbers"][tid]) for tid in topic_ids]
            legend_text = ",".join(legend_numbers)
            
            # Dibujar el texto encima del punto
            ax.text(x, y + 0.15, legend_text, fontsize=9, ha='center', va='bottom', fontweight='bold', color='black', clip_on=False)

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

def frange(start, stop, step):
    while start < stop:
        yield start
        start += step
