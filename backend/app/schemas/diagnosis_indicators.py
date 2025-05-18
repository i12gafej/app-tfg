from pydantic import BaseModel, Field
from typing import Optional, Union, Literal
from decimal import Decimal

class DiagnosisIndicatorBase(BaseModel):
    name: str
    type: Literal['quantitative', 'qualitative']
    material_topic_id: int

class DiagnosisIndicatorQuantitativeCreate(BaseModel):
    numeric_response: Decimal
    unit: str

class DiagnosisIndicatorQualitativeCreate(BaseModel):
    response: str

class DiagnosisIndicatorQuantitative(DiagnosisIndicatorQuantitativeCreate):
    diagnosis_indicator_id: int

    class Config:
        from_attributes = True

class DiagnosisIndicatorQualitative(DiagnosisIndicatorQualitativeCreate):
    diagnosis_indicator_id: int

    class Config:
        from_attributes = True

class DiagnosisIndicator(DiagnosisIndicatorBase):
    id: int
    quantitative_data: Optional[DiagnosisIndicatorQuantitative] = None
    qualitative_data: Optional[DiagnosisIndicatorQualitative] = None

    class Config:
        from_attributes = True

    @property
    def value(self) -> Optional[Union[Decimal, str]]:
        if self.type == 'quantitative' and self.quantitative_data:
            return self.quantitative_data.numeric_response
        elif self.type == 'qualitative' and self.qualitative_data:
            return self.qualitative_data.response
        return None

    @property
    def unit(self) -> Optional[str]:
        if self.type == 'quantitative' and self.quantitative_data:
            return self.quantitative_data.unit
        return None

class DiagnosisIndicatorCreate(DiagnosisIndicatorBase):
    numeric_response: Optional[Decimal] = None
    unit: Optional[str] = None
    response: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Indicador de ejemplo",
                "type": "quantitative",
                "material_topic_id": 1,
                "numeric_response": 100.5,
                "unit": "kg",
                "response": None
            }
        }

class DiagnosisIndicatorUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[Literal['quantitative', 'qualitative']] = None
    numeric_response: Optional[Decimal] = None
    unit: Optional[str] = None
    response: Optional[str] = None
