from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.goals import Goal, GoalList, MainImpactUpdate
from app.schemas.auth import TokenData
from app.crud import goals as crud_goals
from app.services.user import check_user_permissions

router = APIRouter()

@router.get("/goals/get/{ods_id}", response_model=GoalList)
def get_goals_by_ods(
    ods_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las metas de un ODS.
    """

    try:
        goals = crud_goals.get_goals_by_ods(db, ods_id)
        return {
            "items": goals,
            "total": len(goals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener metas: {str(e)}"
        )

@router.put("/goals/update/main-impact")
def update_main_impact(
    update_data: MainImpactUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Actualizar el impacto principal de un asunto de materialidad.
    """
    if not current_user.admin:
            has_permission, error_message = check_user_permissions(
                db=db,
                user_id=current_user.id,
                report_id=update_data.report_id,
                require_manager=True
            )
            if not has_permission:
                raise HTTPException(status_code=403, detail=error_message)

    try:
        crud_goals.update_main_impact(
            db,
            update_data.material_topic_id,
            update_data.goal_ods_id,
            update_data.goal_number
        )
        return {"message": "Impacto principal actualizado correctamente"}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar impacto principal: {str(e)}"
        )

@router.get("/goals/get-all", response_model=GoalList)
def get_all_goals(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Obtener todas las metas.
    """

    try:
        goals = crud_goals.get_all_goals(db)
        return {
            "items": goals,
            "total": len(goals)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener metas: {str(e)}"
        )
