from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.action_plan import (
    SpecificObjective, SpecificObjectiveCreate, SpecificObjectiveUpdate,
    Action, ActionCreate, ActionUpdate,
    PerformanceIndicator, PerformanceIndicatorCreate, PerformanceIndicatorUpdate,
    ActionPrimaryImpactsList, ActionPrimaryImpactResponse,
    InternalConsistencyGraphResponse, DimensionTotal
)
from app.schemas.auth import TokenData
from app.crud import action_plan as crud_action_plan
from app.crud import reports as crud_reports
from app.crud import ods as crud_ods
from app.graphs.internal_consistency import generate_internal_consistency_graph
import logging

# Configurar el logger
logger = logging.getLogger(__name__)

router = APIRouter()

# Endpoints para Objetivos Específicos
@router.get("/specific-objectives/{material_topic_id}", response_model=List[SpecificObjective])
def get_specific_objectives(
    material_topic_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los objetivos específicos de un asunto relevante.
    """
    try:
        objectives = crud_action_plan.get_all_specific_objectives(db, material_topic_id)
        return objectives
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener objetivos específicos: {str(e)}"
        )

@router.post("/specific-objectives", response_model=SpecificObjective)
def create_specific_objective(
    objective: SpecificObjectiveCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo objetivo específico.
    """
    try:
        return crud_action_plan.create_specific_objective(db, objective)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear objetivo específico: {str(e)}"
        )

@router.put("/specific-objectives/{objective_id}", response_model=SpecificObjective)
def update_specific_objective(
    objective_id: int,
    objective_update: SpecificObjectiveUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un objetivo específico existente.
    """
    try:
        updated_objective = crud_action_plan.update_specific_objective(
            db, objective_id, objective_update
        )
        if not updated_objective:
            raise HTTPException(
                status_code=404,
                detail="Objetivo específico no encontrado"
            )
        return updated_objective
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar objetivo específico: {str(e)}"
        )

@router.delete("/specific-objectives/{objective_id}")
def delete_specific_objective(
    objective_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un objetivo específico.
    """
    try:
        success = crud_action_plan.delete_specific_objective(db, objective_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Objetivo específico no encontrado"
            )
        return {"message": "Objetivo específico eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar objetivo específico: {str(e)}"
        )

# Endpoints para Acciones
@router.get("/actions/{specific_objective_id}", response_model=List[Action])
def get_actions(
    specific_objective_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las acciones de un objetivo específico.
    """
    try:
        actions = crud_action_plan.get_all_actions(db, specific_objective_id)
        return actions
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener acciones: {str(e)}"
        )

@router.post("/actions", response_model=Action)
def create_action(
    action: ActionCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear una nueva acción.
    """
    try:
        return crud_action_plan.create_action(db, action)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear acción: {str(e)}"
        )

@router.put("/actions/{action_id}", response_model=Action)
def update_action(
    action_id: int,
    action_update: ActionUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar una acción existente.
    """
    try:
        updated_action = crud_action_plan.update_action(db, action_id, action_update)
        if not updated_action:
            raise HTTPException(
                status_code=404,
                detail="Acción no encontrada"
            )
        return updated_action
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar acción: {str(e)}"
        )

@router.delete("/actions/{action_id}")
def delete_action(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar una acción.
    """
    try:
        success = crud_action_plan.delete_action(db, action_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Acción no encontrada"
            )
        return {"message": "Acción eliminada correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar acción: {str(e)}"
        )

# Endpoints para Indicadores de Rendimiento
@router.get("/performance-indicators/{action_id}", response_model=List[PerformanceIndicator])
def get_performance_indicators(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los indicadores de rendimiento de una acción.
    """
    try:
        indicators = crud_action_plan.get_all_performance_indicators(db, action_id)
        return indicators
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener indicadores de rendimiento: {str(e)}"
        )

@router.post("/performance-indicators", response_model=PerformanceIndicator)
def create_performance_indicator(
    indicator: PerformanceIndicatorCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Crear un nuevo indicador de rendimiento.
    """
    try:
        return crud_action_plan.create_performance_indicator(db, indicator)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear indicador de rendimiento: {str(e)}"
        )

@router.put("/performance-indicators/{indicator_id}", response_model=PerformanceIndicator)
def update_performance_indicator(
    indicator_id: int,
    indicator_update: PerformanceIndicatorUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar un indicador de rendimiento existente.
    """
    try:
        updated_indicator = crud_action_plan.update_performance_indicator(
            db, indicator_id, indicator_update
        )
        if not updated_indicator:
            raise HTTPException(
                status_code=404,
                detail="Indicador de rendimiento no encontrado"
            )
        return updated_indicator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar indicador de rendimiento: {str(e)}"
        )

@router.delete("/performance-indicators/{indicator_id}")
def delete_performance_indicator(
    indicator_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Eliminar un indicador de rendimiento.
    """
    try:
        success = crud_action_plan.delete_performance_indicator(db, indicator_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Indicador de rendimiento no encontrado"
            )
        return {"message": "Indicador de rendimiento eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar indicador de rendimiento: {str(e)}"
        )

@router.get("/actions/get/all-primary-impacts/{report_id}", response_model=ActionPrimaryImpactsList)
def get_all_action_primary_impacts(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener el recuento de impactos principales de todas las acciones de un reporte.
    """
    try:
        impacts = crud_action_plan.get_all_action_main_impacts(db, report_id)
        return {
            "items": [ActionPrimaryImpactResponse(**impact) for impact in impacts],
            "total": len(impacts)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener impactos principales de acciones: {str(e)}"
        )

@router.get("/action-plan/get/internal-consistency-graph/{report_id}", response_model=InternalConsistencyGraphResponse)
def get_internal_consistency_graph(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener el gráfico de coherencia interna y los totales por dimensión.
    """
    try:
        logger.info(f"Iniciando generación de gráfico para report_id: {report_id}")

        # 1. Obtener el reporte para las ponderaciones
        report = crud_reports.get_report(db, report_id)
        if not report:
            logger.error(f"Reporte no encontrado: {report_id}")
            raise HTTPException(
                status_code=404,
                detail="Reporte no encontrado"
            )

        # Asegurarnos de que las ponderaciones son números válidos
        main_weight = float(report.main_impact_weight if report.main_impact_weight is not None else 0)
        secondary_weight = float(report.secondary_impact_weight if report.secondary_impact_weight is not None else 0)
        logger.info(f"Ponderaciones: main={main_weight}, secondary={secondary_weight}")

        # 2. Obtener impactos principales y secundarios
        primary_impacts = crud_action_plan.get_all_action_main_impacts(db, report_id)
        secondary_impacts = crud_ods.get_all_action_secondary_impacts(db, report_id)
        logger.info(f"Impactos obtenidos: {len(primary_impacts)} principales, {len(secondary_impacts)} secundarios")
        logger.debug(f"Impactos principales: {primary_impacts}")
        logger.debug(f"Impactos secundarios: {secondary_impacts}")

        # 3. Inicializar totales por dimensión
        dimension_totals = {
            "PERSONAS": 0.0,
            "PLANETA": 0.0,
            "PROSPERIDAD": 0.0,
            "PAZ": 0.0,
            "ALIANZAS": 0.0
        }

        # Mapeo de ODS a dimensiones
        ods_dimensions = {
            1: "PERSONAS", 2: "PERSONAS", 3: "PERSONAS", 4: "PERSONAS", 5: "PERSONAS",
            6: "PLANETA", 12: "PLANETA", 13: "PLANETA", 14: "PLANETA", 15: "PLANETA",
            7: "PROSPERIDAD", 8: "PROSPERIDAD", 9: "PROSPERIDAD", 10: "PROSPERIDAD", 11: "PROSPERIDAD",
            16: "PAZ",
            17: "ALIANZAS"
        }

        # 4. Procesar y ponderar impactos principales
        logger.info("Procesando impactos principales...")
        for impact in primary_impacts:
            if impact.get('ods_id') and impact['ods_id'] in ods_dimensions:
                dimension = ods_dimensions[impact['ods_id']]
                count = float(impact.get('count', 0))
                weighted_count = count * main_weight
                dimension_totals[dimension] += weighted_count
                logger.debug(f"Impacto principal: ODS={impact['ods_id']}, dimensión={dimension}, count={count}, ponderado={weighted_count}")

        # 5. Procesar y ponderar impactos secundarios
        logger.info("Procesando impactos secundarios...")
        for impact in secondary_impacts:
            if impact.get('ods_id') and impact['ods_id'] in ods_dimensions:
                dimension = ods_dimensions[impact['ods_id']]
                count = float(impact.get('count', 0))
                weighted_count = count * secondary_weight
                dimension_totals[dimension] += weighted_count
                logger.debug(f"Impacto secundario: ODS={impact['ods_id']}, dimensión={dimension}, count={count}, ponderado={weighted_count}")

        logger.info(f"Totales por dimensión calculados: {dimension_totals}")

        # 6. Generar el gráfico
        logger.info("Generando gráfico...")
        graph_data_url = generate_internal_consistency_graph(dimension_totals)
        logger.info("Gráfico generado correctamente")

        # 7. Preparar la respuesta
        dimension_totals_list = [
            DimensionTotal(dimension=dim, total=total)
            for dim, total in dimension_totals.items()
        ]

        return InternalConsistencyGraphResponse(
            graph_data_url=graph_data_url,
            dimension_totals=dimension_totals_list
        )

    except Exception as e:
        logger.error(f"Error en get_internal_consistency_graph: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar el gráfico de coherencia interna: {str(e)}"
        )


