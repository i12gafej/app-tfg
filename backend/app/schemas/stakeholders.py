from typing import Optional
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
    page: Optional[int] = 1
    per_page: Optional[int] = 10

    class Config:
        json_schema_extra = {
            "example": {
                "search_term": "grupo",
                "name": "Grupo A",
                "type": "internal",
                "report_id": 1,
                "page": 1,
                "per_page": 10
            }
        }
