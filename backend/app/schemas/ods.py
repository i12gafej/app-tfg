from typing import Optional, List
from pydantic import BaseModel

class ODSBase(BaseModel):
    name: str
    description: Optional[str] = None
    dimension_id: int

class ODS(ODSBase):
    id: int

    class Config:
        from_attributes = True

class ODSList(BaseModel):
    items: List[ODS]
    total: int

class SecondaryImpactUpdate(BaseModel):
    material_topic_id: int
    ods_ids: List[int]

class SecondaryImpactResponse(BaseModel):
    material_topic_id: int
    ods_ids: List[int]

class Dimension(BaseModel):
    name: str
    description: str
    ods: List[ODS]

    class Config:
        from_attributes = True

class DimensionResponse(BaseModel):
    dimensions: List[Dimension]
# Nuevos schemas para impactos secundarios de acciones
class ActionSecondaryImpactUpdate(BaseModel):
    action_id: int
    ods_ids: List[int]

class ActionSecondaryImpactResponse(BaseModel):
    action_id: int
    ods_ids: List[int]

# Schema para impactos secundarios de acciones
class ActionSecondaryImpactCount(BaseModel):
    ods_id: int
    ods_name: str
    count: int

class ActionSecondaryImpactCountList(BaseModel):
    items: List[ActionSecondaryImpactCount]
    total: int

