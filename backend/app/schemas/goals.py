from typing import Optional, List
from pydantic import BaseModel

class GoalBase(BaseModel):
    ods_id: int
    goal_number: str
    description: str

class Goal(GoalBase):
    class Config:
        from_attributes = True

class MainImpactUpdate(BaseModel):
    material_topic_id: int
    goal_ods_id: int
    goal_number: str

class GoalList(BaseModel):
    items: List[Goal]
    total: int
