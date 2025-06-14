import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, List, Tuple
import io
import base64
import logging

# Configurar el logger
logger = logging.getLogger(__name__)



def generate_internal_consistency_graph(
    dimension_totals: Dict[str, float]
) -> Tuple[str, list]:
    def calculate_y_scale(max_val: float, divisions: int = 3) -> Tuple[float, float]:
        armonic_proportions = [2,3,4,5,6,8, 10, 15, 20, 25, 30, 40, 50, 60, 80, 90, 100]
        for unit in armonic_proportions:
            if unit * divisions >= max_val:
                logger.debug(f"Escala Y calculada: {unit * divisions}, step: {unit}")
                return unit * divisions, unit
        result = ((max_val // 5) + 1) * 5, 5
        return result
    try:
        dimensions = ["PERSONAS", "PLANETA", "PROSPERIDAD", "PAZ", "ALIANZAS"]
        values = [dimension_totals.get(dim, 0) for dim in dimensions]
        logger.debug(f"Valores por dimensión: {dict(zip(dimensions, values))}")

        colors = ["#c9d6f0", "#bfe0b9", "#fbe3b3", "#c8ebf9", "#dfcce7"]
        borders = ["#7183bd", "#5d9d57", "#e3aa32", "#73bcd7", "#ae78b9"]

        y_max, step = calculate_y_scale(max(values))
        y_ticks = list(range(0, int(y_max) + 1, int(step)))
        logger.debug(f"Escala Y: máximo={y_max}, step={step}, ticks={y_ticks}")

        fig, ax = plt.subplots(figsize=(10, 5), facecolor='none')
        bars = ax.bar(
            dimensions,
            values,
            color=colors,
            edgecolor=borders,
            linewidth=1.5,
            zorder=3
        )

        for y in y_ticks:
            ax.axhline(y=y, color="#aa3355", linestyle=":", linewidth=1, zorder=1)

        ax.set_facecolor('none')
        ax.set_yticks(y_ticks)
        ax.set_yticklabels([str(int(y)) for y in y_ticks])
        ax.set_ylim(0, y_max)
        ax.set_ylabel("Impacto total ponderado ODS principal y secundario", fontsize=10, labelpad=20)
        
        # Configuración corregida de los ticks y etiquetas del eje X
        ax.set_xticks(range(len(dimensions)))
        ax.set_xticklabels(dimensions, fontweight='bold')
        
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_color('#993355')
        ax.spines['left'].set_visible(False)
        ax.tick_params(axis='y', labelsize=9)
        ax.tick_params(axis='x', labelsize=10)

        plt.tight_layout()

        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=300, bbox_inches='tight', transparent=True)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close(fig)

        graph = base64.b64encode(image_png).decode('utf-8')
        dimension_totals_list = [
            {"dimension": dim, "total": dimension_totals.get(dim, 0)}
            for dim in dimensions
        ]
        return f"data:image/png;base64,{graph}", dimension_totals_list
    except Exception as e:
        logger.error(f"Error al generar gráfico de coherencia interna: {str(e)}")
        raise
    finally:
        plt.close('all')

def get_dimension_totals(
    primary_impacts: list,
    secondary_impacts: list,
    main_weight,
    secondary_weight
) -> Tuple[dict, list]:
    ods_dimensions = {
        1: "PERSONAS", 2: "PERSONAS", 3: "PERSONAS", 4: "PERSONAS", 5: "PERSONAS",
        6: "PLANETA", 12: "PLANETA", 13: "PLANETA", 14: "PLANETA", 15: "PLANETA",
        7: "PROSPERIDAD", 8: "PROSPERIDAD", 9: "PROSPERIDAD", 10: "PROSPERIDAD", 11: "PROSPERIDAD",
        16: "PAZ",
        17: "ALIANZAS"
    }
    dimension_totals = {dim: 0.0 for dim in ["PERSONAS", "PLANETA", "PROSPERIDAD", "PAZ", "ALIANZAS"]}
     
    for impact in primary_impacts:
        if impact.get('ods_id') and impact['ods_id'] in ods_dimensions:
            dimension = ods_dimensions[impact['ods_id']]
            count = float(impact.get('count', 0))
            weighted_count = count * main_weight
            dimension_totals[dimension] += weighted_count

    for impact in secondary_impacts:
        if impact.get('ods_id') and impact['ods_id'] in ods_dimensions:
            dimension = ods_dimensions[impact['ods_id']]
            count = float(impact.get('count', 0))
            weighted_count = count * secondary_weight
            dimension_totals[dimension] += weighted_count

    dimension_totals_list = [
        {"dimension": dim, "total": dimension_totals[dim]}
        for dim in ["PERSONAS", "PLANETA", "PROSPERIDAD", "PAZ", "ALIANZAS"]
    ]
    return dimension_totals, dimension_totals_list


