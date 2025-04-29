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

class SecondaryImpactUpdate(BaseModel):
    material_topic_id: int
    ods_ids: List[int]

class SecondaryImpactResponse(BaseModel):
    material_topic_id: int
    ods_ids: List[int]

class ODSList(BaseModel):
    items: List[ODS]
    total: int
