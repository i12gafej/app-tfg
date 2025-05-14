from typing import Optional, List
from pydantic import BaseModel
from enum import Enum

class StakeholderType(str, Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"

class StakeholderBase(BaseModel):
    name: str
    description: str
    type: StakeholderType

class StakeholderCreate(StakeholderBase):
    report_id: int

class StakeholderUpdate(BaseModel):
    id: Optional[int] = None
    report_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[StakeholderType] = None

class Stakeholder(StakeholderBase):
    id: int
    report_id: int

    class Config:
        from_attributes = True

class StakeholderSearch(BaseModel):
    search_term: Optional[str] = None
    name: Optional[str] = None
    type: Optional[StakeholderType] = None
    report_id: Optional[int] = None

    class Config:
        json_schema_extra = {
            "example": {
                "search_term": "grupo",
                "name": "Grupo A",
                "type": "internal",
                "report_id": 1
            }
        }
