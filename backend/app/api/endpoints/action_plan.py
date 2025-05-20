from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
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
from app.graphs.internal_consistency import get_dimension_totals, generate_internal_consistency_graph

router = APIRouter()

# Endpoints para Objetivos Específicos
@router.get("/specific-objectives/get-all/{material_topic_id}", response_model=List[SpecificObjective])
def get_all_specific_objectives(
    material_topic_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los objetivos específicos de un asunto de materialidad.
    """
    try:
        objectives = crud_action_plan.get_all_specific_objectives(db, material_topic_id)
        return objectives
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener objetivos específicos: {str(e)}"
        )


@router.get("/specific-objectives/get-all/responsibles/{report_id}", response_model=List[str])
def get_all_responsibles(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todos los responsables únicos de los objetivos específicos de un reporte.
    """
    try:
        responsibles = crud_action_plan.get_all_responsibles(db, report_id)
        return responsibles
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener responsables: {str(e)}"
        )

@router.post("/specific-objectives/create", response_model=SpecificObjective)
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

@router.put("/specific-objectives/update/{objective_id}", response_model=SpecificObjective)
def update_specific_objective(
    objective_id: int,
    objective_update: SpecificObjectiveUpdate = Body(...),
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

@router.delete("/specific-objectives/delete/{objective_id}")
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
@router.get("/actions/get-all/{specific_objective_id}", response_model=List[Action])
def get_all_actions(
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

@router.post("/actions/create", response_model=Action)
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

@router.put("/actions/update/{action_id}", response_model=Action)
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

@router.delete("/actions/delete/{action_id}")
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
@router.get("/performance-indicators/get-all/{action_id}", response_model=List[PerformanceIndicator])
def get_all_performance_indicators(
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

@router.post("/performance-indicators/create", response_model=PerformanceIndicator)
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

@router.put("/performance-indicators/update/{indicator_id}", response_model=PerformanceIndicator)
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

@router.delete("/performance-indicators/delete/{indicator_id}")
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

@router.get("/actions/get-all/primary-impacts/{report_id}", response_model=ActionPrimaryImpactsList)
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
        # 1. Obtener el reporte para las ponderaciones
        report = crud_reports.get_report(db, report_id)
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Reporte no encontrado"
            )

        # Asegurarnos de que las ponderaciones son números válidos
        main_weight = float(report.main_impact_weight if report.main_impact_weight is not None else 0)
        secondary_weight = float(report.secondary_impact_weight if report.secondary_impact_weight is not None else 0)

        # 2. Obtener impactos principales y secundarios
        primary_impacts = crud_action_plan.get_all_action_main_impacts(db, report_id)
        secondary_impacts = crud_ods.get_all_action_secondary_impacts_counts(db, report_id)

        # 3. Calcular totales por dimensión y lista ordenada
        dimension_totals, dimension_totals_list = get_dimension_totals(primary_impacts, secondary_impacts, main_weight, secondary_weight)

        # 4. Generar el gráfico
        graph_data_url, _ = generate_internal_consistency_graph(dimension_totals)

        # 5. Preparar la respuesta
        dimension_totals_list = [
            DimensionTotal(dimension=dim["dimension"], total=dim["total"])
            for dim in dimension_totals_list
        ]

        return InternalConsistencyGraphResponse(
            graph_data_url=graph_data_url,
            dimension_totals=dimension_totals_list
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar el gráfico de coherencia interna: {str(e)}"
        )


