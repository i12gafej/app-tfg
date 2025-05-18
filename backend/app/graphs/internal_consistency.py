import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, List, Tuple
import io
import base64
import logging

# Configurar el logger
logger = logging.getLogger(__name__)

def calcular_escala_y(max_val: float, divisiones: int = 3) -> Tuple[float, float]:
    logger.debug(f"Calculando escala Y para valor máximo: {max_val}")
    armoniosos = [2,3,4,5,6,8, 10, 15, 20, 25, 30, 40, 50, 60, 80, 90, 100]
    for unidad in armoniosos:
        if unidad * divisiones >= max_val:
            logger.debug(f"Escala Y calculada: {unidad * divisiones}, paso: {unidad}")
            return unidad * divisiones, unidad
    resultado = ((max_val // 5) + 1) * 5, 5
    logger.debug(f"Escala Y calculada (fallback): {resultado[0]}, paso: {resultado[1]}")
    return resultado

def generate_internal_consistency_graph(
    dimension_totals: Dict[str, float]
) -> (str, list):
    logger.info("Iniciando generación de gráfico de coherencia interna")
    logger.debug(f"Datos de entrada: {dimension_totals}")

    try:
        dimensiones = ["PERSONAS", "PLANETA", "PROSPERIDAD", "PAZ", "ALIANZAS"]
        valores = [dimension_totals.get(dim, 0) for dim in dimensiones]
        logger.debug(f"Valores por dimensión: {dict(zip(dimensiones, valores))}")

        colores = ["#c9d6f0", "#bfe0b9", "#fbe3b3", "#c8ebf9", "#dfcce7"]
        bordes = ["#7183bd", "#5d9d57", "#e3aa32", "#73bcd7", "#ae78b9"]

        y_max, paso = calcular_escala_y(max(valores))
        y_ticks = list(range(0, int(y_max) + 1, int(paso)))
        logger.debug(f"Escala Y: máximo={y_max}, paso={paso}, ticks={y_ticks}")

        fig, ax = plt.subplots(figsize=(10, 5), facecolor='none')
        bars = ax.bar(
            dimensiones,
            valores,
            color=colores,
            edgecolor=bordes,
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
        ax.set_xticklabels(dimensiones, fontweight='bold')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_color('#993355')
        ax.spines['left'].set_visible(False)
        ax.tick_params(axis='y', labelsize=9)
        ax.tick_params(axis='x', labelsize=10)

        plt.tight_layout()

        logger.info("Convirtiendo gráfico a base64")
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=300, bbox_inches='tight', transparent=True)
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close(fig)

        graph = base64.b64encode(image_png).decode('utf-8')
        logger.info("Gráfico generado y convertido a base64 correctamente")
        dimension_totals_list = [
            {"dimension": dim, "total": dimension_totals.get(dim, 0)}
            for dim in dimensiones
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
    main_weight: float,
    secondary_weight: float
) -> (dict, list):
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


