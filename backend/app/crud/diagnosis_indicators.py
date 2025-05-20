from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from decimal import Decimal

from app.models.models import DiagnosisIndicator as DiagnosisIndicatorModel, DiagnosisIndicatorQuantitative, DiagnosisIndicatorQualitative, MaterialTopic
from app.schemas.diagnosis_indicators import DiagnosisIndicatorCreate, DiagnosisIndicatorUpdate, DiagnosisIndicator



def get_all_by_report(db: Session, report_id: int) -> List[DiagnosisIndicator]:
    try:
        # Obtener todos los indicadores del reporte
        indicators = (
            db.query(DiagnosisIndicatorModel)
            .join(MaterialTopic)
            .filter(MaterialTopic.report_id == report_id)
            .all()
        )
        
        # Para cada indicador, obtener sus datos cuantitativos o cualitativos
        for indicator in indicators:
            if indicator.type == 'quantitative':
                quantitative_data = (
                    db.query(DiagnosisIndicatorQuantitative)
                    .filter(DiagnosisIndicatorQuantitative.diagnosis_indicator_id == indicator.id)
                    .first()
                )
                if quantitative_data:
                    indicator.quantitative_data = quantitative_data
            else:
                qualitative_data = (
                    db.query(DiagnosisIndicatorQualitative)
                    .filter(DiagnosisIndicatorQualitative.diagnosis_indicator_id == indicator.id)
                    .first()
                )
                if qualitative_data:
                    indicator.qualitative_data = qualitative_data
        return [DiagnosisIndicator.from_orm(indicator) for indicator in indicators]
    except Exception as e:
        raise e


def create_indicator(
    db: Session,
    indicator: DiagnosisIndicatorCreate,
    numeric_response: Optional[Decimal] = None,
    unit: Optional[str] = None,
    response: Optional[str] = None
) -> DiagnosisIndicatorModel:

    try:
        db_indicator = DiagnosisIndicatorModel(
            name=indicator.name,
            type=indicator.type,
            material_topic_id=indicator.material_topic_id
        )
        db.add(db_indicator)
        db.flush()

        if indicator.type == 'quantitative' and numeric_response is not None and unit is not None:
            db_quantitative = DiagnosisIndicatorQuantitative(
                diagnosis_indicator_id=db_indicator.id,
                numeric_response=numeric_response,
                unit=unit
            )
            db.add(db_quantitative)
        elif indicator.type == 'qualitative' and response is not None:
            db_qualitative = DiagnosisIndicatorQualitative(
                diagnosis_indicator_id=db_indicator.id,
                response=response
            )
            db.add(db_qualitative)

        db.commit()
        db.refresh(db_indicator)
        return db_indicator
    except Exception as e:
        raise e

def get_report_id_by_indicator(db: Session, indicator_id: int) -> int:
    try:
        material_topic_indicator = db.query(MaterialTopic).join(DiagnosisIndicatorModel, DiagnosisIndicatorModel.material_topic_id == MaterialTopic.id).filter(DiagnosisIndicatorModel.id == indicator_id).first()
        if not material_topic_indicator:
            return None
        return material_topic_indicator.report_id
    except Exception as e:
        raise e

def update_indicator(
    db: Session,
    indicator_id: int,
    indicator_update: DiagnosisIndicatorUpdate
) -> Optional[DiagnosisIndicatorModel]:
    try:
        # 1. Obtener el indicador actual
        db_indicator = db.query(DiagnosisIndicatorModel).filter(DiagnosisIndicatorModel.id == indicator_id).first()
        if not db_indicator:
            return None

        update_data = indicator_update.dict(exclude_unset=True)
        
        # 2. Si el tipo ha cambiado, eliminar los datos antiguos
        if 'type' in update_data and update_data['type'] != db_indicator.type:
            if db_indicator.type == 'quantitative':
                # Eliminar datos cuantitativos antiguos
                db.query(DiagnosisIndicatorQuantitative).filter(
                    DiagnosisIndicatorQuantitative.diagnosis_indicator_id == indicator_id
                ).delete()
            else:
                # Eliminar datos cualitativos antiguos
                db.query(DiagnosisIndicatorQualitative).filter(
                    DiagnosisIndicatorQualitative.diagnosis_indicator_id == indicator_id
                ).delete()
            
            # 3. Actualizar el tipo del indicador
            db_indicator.type = update_data['type']
            db.commit()

            # 4. Crear los nuevos datos según el tipo
            if db_indicator.type == 'quantitative':
                if 'numeric_response' in update_data or 'unit' in update_data:
                    db_quantitative = DiagnosisIndicatorQuantitative(
                        diagnosis_indicator_id=indicator_id,
                        numeric_response=update_data.get('numeric_response', Decimal('0')),
                        unit=update_data.get('unit', '')
                    )
                    db.add(db_quantitative)
            else:  # qualitative
                if 'response' in update_data:
                    db_qualitative = DiagnosisIndicatorQualitative(
                        diagnosis_indicator_id=indicator_id,
                        response=update_data.get('response', '')
                    )
                    db.add(db_qualitative)
            
            db.commit()
            db.refresh(db_indicator)
            return db_indicator

        # Si no cambió el tipo, actualizar normalmente
        for field, value in update_data.items():
            if field in ['name', 'type']:
                setattr(db_indicator, field, value)

        if db_indicator.type == 'quantitative':
            if 'numeric_response' in update_data or 'unit' in update_data:
                db_quantitative = db.query(DiagnosisIndicatorQuantitative).filter(
                    DiagnosisIndicatorQuantitative.diagnosis_indicator_id == indicator_id
                ).first()
                
                if db_quantitative:
                    if 'numeric_response' in update_data:
                        db_quantitative.numeric_response = update_data['numeric_response']
                    if 'unit' in update_data:
                        db_quantitative.unit = update_data['unit']
                else:
                    db_quantitative = DiagnosisIndicatorQuantitative(
                        diagnosis_indicator_id=indicator_id,
                        numeric_response=update_data.get('numeric_response', Decimal('0')),
                        unit=update_data.get('unit', '')
                    )
                    db.add(db_quantitative)

        elif db_indicator.type == 'qualitative':
            if 'response' in update_data:
                db_qualitative = db.query(DiagnosisIndicatorQualitative).filter(
                    DiagnosisIndicatorQualitative.diagnosis_indicator_id == indicator_id
                ).first()
                
                if db_qualitative:
                    db_qualitative.response = update_data['response']
                else:
                    db_qualitative = DiagnosisIndicatorQualitative(
                        diagnosis_indicator_id=indicator_id,
                        response=update_data['response']
                    )
                    db.add(db_qualitative)

        db.commit()
        db.refresh(db_indicator)
        return db_indicator
    except Exception as e:
        raise e

def delete_indicator(db: Session, indicator_id: int) -> bool:
    try:
        db_indicator = db.query(DiagnosisIndicatorModel).filter(DiagnosisIndicatorModel.id == indicator_id).first()
        if not db_indicator:
            return False

        db.delete(db_indicator)
        db.commit()
        return True
    except Exception as e:
        raise e

def get_indicator(db: Session, indicator_id: int) -> Optional[DiagnosisIndicatorModel]:
    try:
        # Obtener el indicador
        indicator = db.query(DiagnosisIndicatorModel).filter(DiagnosisIndicatorModel.id == indicator_id).first()
        if not indicator:
            return None

        # Obtener los datos específicos según el tipo
        if indicator.type == 'quantitative':
            quantitative_data = (
                db.query(DiagnosisIndicatorQuantitative)
                .filter(DiagnosisIndicatorQuantitative.diagnosis_indicator_id == indicator_id)
                .first()
            )
            if quantitative_data:
                indicator.quantitative_data = quantitative_data
        else:
            qualitative_data = (
                db.query(DiagnosisIndicatorQualitative)
                .filter(DiagnosisIndicatorQualitative.diagnosis_indicator_id == indicator_id)
                .first()
            )
            if qualitative_data:
                indicator.qualitative_data = qualitative_data

        return indicator
    except Exception as e:
        raise e
