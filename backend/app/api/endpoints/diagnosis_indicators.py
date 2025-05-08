from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.crud import diagnosis_indicators as crud
from app.schemas.diagnosis_indicators import (
    DiagnosticIndicator,
    DiagnosticIndicatorCreate,
    DiagnosticIndicatorUpdate
)
from app.api.deps import get_db, get_current_user
from app.schemas.auth import TokenData
from app.services.user import check_user_permissions
from app.models.models import MaterialTopic

router = APIRouter()

@router.get("/diagnosis-indicators/get-all/{report_id}", response_model=List[DiagnosticIndicator])
def get_all_by_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)

    indicators = crud.get_all_by_report(db, report_id)
    return indicators

@router.post("/diagnosis-indicators/create", response_model=DiagnosticIndicator)
def create_indicator(
    indicator: DiagnosticIndicatorCreate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # Obtener el report_id a través del material_topic_id
    material_topic = db.query(MaterialTopic).filter(MaterialTopic.id == indicator.material_topic_id).first()
    if not material_topic:
        raise HTTPException(status_code=404, detail="Asunto de materialidad no encontrado")
    
    report_id = material_topic.report_id

    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id,
            require_manager=True
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)
    
    if indicator.type == 'quantitative' and (indicator.numeric_response is None or indicator.unit is None):
        raise HTTPException(
            status_code=400,
            detail="Los indicadores cuantitativos requieren respuesta numérica y unidad"
        )
    if indicator.type == 'qualitative' and indicator.response is None:
        raise HTTPException(
            status_code=400,
            detail="Los indicadores cualitativos requieren una respuesta"
        )
    
    return crud.create_indicator(
        db, 
        indicator,
        indicator.numeric_response,
        indicator.unit,
        indicator.response
    )

@router.put("/diagnosis-indicators/update/{indicator_id}", response_model=DiagnosticIndicator)
def update_indicator(
    indicator_id: int,
    indicator_update: DiagnosticIndicatorUpdate,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    report_id = crud.get_report_id_by_indicator(db, indicator_id)
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id,
            require_manager=True
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)

    indicator = crud.update_indicator(db, indicator_id, indicator_update)
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicador no encontrado")
    return indicator

@router.delete("/diagnosis-indicators/delete/{indicator_id}")
def delete_indicator(
    indicator_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    report_id = crud.get_report_id_by_indicator(db, indicator_id)
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id,
            require_manager=True
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)

    success = crud.delete_indicator(db, indicator_id)
    if not success:
        raise HTTPException(status_code=404, detail="Indicador no encontrado")
    return {"message": "Indicador eliminado exitosamente"}

@router.get("/diagnosis-indicators/get-by-id/{indicator_id}", response_model=DiagnosticIndicator)
def get_indicator(
    indicator_id: int,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    report_id = crud.get_report_id_by_indicator(db, indicator_id)
    if not current_user.admin:
        has_permission, error_message = check_user_permissions(
            db=db,
            user_id=current_user.id,
            report_id=report_id
        )
        if not has_permission:
            raise HTTPException(status_code=403, detail=error_message)

    indicator = crud.get_indicator(db, indicator_id)
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicador no encontrado")
    return indicator


