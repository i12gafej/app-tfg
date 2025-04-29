from typing import Optional
from pydantic import BaseModel
from enum import Enum

class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class MaterialTopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    main_objective: Optional[str] = None
    goal_ods_id: Optional[int] = None
    goal_number: Optional[str] = None

class MaterialTopicCreate(MaterialTopicBase):
    report_id: int

class MaterialTopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    main_objective: Optional[str] = None
    goal_ods_id: Optional[int] = None
    goal_number: Optional[str] = None

class MaterialTopic(MaterialTopicBase):
    id: int
    report_id: int

    class Config:
        from_attributes = True

class MaterialTopicSearch(BaseModel):
    search_term: Optional[str] = None
    name: Optional[str] = None
    report_id: Optional[int] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 10

    class Config:
        json_schema_extra = {
            "example": {
                "search_term": "asunto",
                "name": "Asunto A",
                "report_id": 1,
                "page": 1,
                "per_page": 10
            }
        }
