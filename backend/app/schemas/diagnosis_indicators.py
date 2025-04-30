from pydantic import BaseModel, Field
from typing import Optional, Union, Literal
from decimal import Decimal

class DiagnosticIndicatorBase(BaseModel):
    name: str
    type: Literal['quantitative', 'qualitative']
    material_topic_id: int

class DiagnosticIndicatorQuantitativeCreate(BaseModel):
    numeric_response: Decimal
    unit: str

class DiagnosticIndicatorQualitativeCreate(BaseModel):
    response: str

class DiagnosticIndicatorQuantitative(DiagnosticIndicatorQuantitativeCreate):
    diagnostic_indicator_id: int

    class Config:
        from_attributes = True

class DiagnosticIndicatorQualitative(DiagnosticIndicatorQualitativeCreate):
    diagnostic_indicator_id: int

    class Config:
        from_attributes = True

class DiagnosticIndicator(DiagnosticIndicatorBase):
    id: int
    quantitative_data: Optional[DiagnosticIndicatorQuantitative] = None
    qualitative_data: Optional[DiagnosticIndicatorQualitative] = None

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

class DiagnosticIndicatorCreate(DiagnosticIndicatorBase):
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

class DiagnosticIndicatorUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[Literal['quantitative', 'qualitative']] = None
    numeric_response: Optional[Decimal] = None
    unit: Optional[str] = None
    response: Optional[str] = None
