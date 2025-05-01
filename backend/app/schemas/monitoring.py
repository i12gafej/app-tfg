from pydantic import BaseModel
from typing import List, Optional

class MonitoringIndicator(BaseModel):
    name: str
    type: str
    human_resources: Optional[str] = None
    material_resources: Optional[str] = None

class MonitoringAction(BaseModel):
    id: int
    description: str
    difficulty: str
    indicators: List[MonitoringIndicator]

class MonitoringObjective(BaseModel):
    id: int
    description: str
    responsible: Optional[str] = None
    execution_time: Optional[str] = None
    actions: List[MonitoringAction]

class MonitoringMaterialTopic(BaseModel):
    id: int
    name: str
    priority: Optional[str] = None
    main_objective: Optional[str] = "No definido"
    objectives: List[MonitoringObjective]

class MonitoringTemplateResponse(BaseModel):
    html_content: str
