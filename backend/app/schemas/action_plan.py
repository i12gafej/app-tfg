from pydantic import BaseModel
from typing import Optional, List, Literal
from decimal import Decimal

# Schemas para Objetivos Específicos
class SpecificObjectiveBase(BaseModel):
    description: str
    execution_time: Optional[str] = None
    responsible: Optional[str] = None
    material_topic_id: int

class SpecificObjectiveCreate(SpecificObjectiveBase):
    pass

class SpecificObjectiveUpdate(BaseModel):
    description: Optional[str] = None
    execution_time: Optional[str] = None
    responsible: Optional[str] = None

class SpecificObjective(SpecificObjectiveBase):
    id: int

    class Config:
        from_attributes = True

# Schemas para Acciones
class ActionBase(BaseModel):
    description: str
    difficulty: Optional[Literal['low', 'medium', 'high']] = None
    ods_id: Optional[int] = None
    specific_objective_id: int

class ActionCreate(ActionBase):
    pass

class ActionUpdate(BaseModel):
    description: Optional[str] = None
    difficulty: Optional[Literal['low', 'medium', 'high']] = None
    ods_id: Optional[int] = None

class Action(ActionBase):
    id: int

    class Config:
        from_attributes = True

# Schemas para Indicadores de Rendimiento
class PerformanceIndicatorBase(BaseModel):
    name: str
    human_resources: Optional[str] = None
    material_resources: Optional[str] = None
    type: Literal['quantitative', 'qualitative']
    action_id: int

class PerformanceIndicatorQuantitativeData(BaseModel):
    numeric_response: Decimal
    unit: str

class PerformanceIndicatorQualitativeData(BaseModel):
    response: str

class PerformanceIndicatorCreate(PerformanceIndicatorBase):
    numeric_response: Optional[Decimal] = None
    unit: Optional[str] = None
    response: Optional[str] = None

class PerformanceIndicatorUpdate(BaseModel):
    name: Optional[str] = None
    human_resources: Optional[str] = None
    material_resources: Optional[str] = None
    type: Optional[Literal['quantitative', 'qualitative']] = None
    numeric_response: Optional[Decimal] = None
    unit: Optional[str] = None
    response: Optional[str] = None

class PerformanceIndicator(PerformanceIndicatorBase):
    id: int
    quantitative_data: Optional[PerformanceIndicatorQuantitativeData] = None
    qualitative_data: Optional[PerformanceIndicatorQualitativeData] = None

    class Config:
        from_attributes = True

# Schema para impactos principales de acciones
class ActionPrimaryImpactResponse(BaseModel):
    ods_id: Optional[int] = None
    ods_name: Optional[str] = None
    count: int

class ActionPrimaryImpactsList(BaseModel):
    items: List[ActionPrimaryImpactResponse]
    total: int
