from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.action_plan import (
    SpecificObjective, SpecificObjectiveCreate, SpecificObjectiveUpdate,
    Action, ActionCreate, ActionUpdate,
    PerformanceIndicator, PerformanceIndicatorCreate, PerformanceIndicatorUpdate,
    ActionPrimaryImpactsList, ActionPrimaryImpactResponse
)
from app.schemas.auth import TokenData
from app.crud import action_plan as crud_action_plan

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
