from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union


class AssessmentBase(BaseModel):
    material_topic_id: int
    stakeholder_id: int
    score: int

    @validator('score')
    def validate_score(cls, v):
        if v < 1:
            raise ValueError('La puntuación debe ser mayor o igual a 1')
        return v

class AssessmentCreate(AssessmentBase):
    pass

class Assessment(AssessmentBase):
    id: int

    class Config:
        from_attributes = True

class MultipleAssessmentsCreate(BaseModel):
    stakeholder_id: int
    assessments: List[dict] = Field(..., description="Lista de {material_topic_id: int, score: int}")
    report_id: int  
    scale: int

class SurveySearch(BaseModel):
    search_term: Optional[str] = None
    heritage_resource_name: Optional[str] = None
    year: Optional[Union[str, int]] = None

class Survey(BaseModel):
    id: int
    heritage_resource_id: int
    heritage_resource_name: str
    year: Union[str, int]
    survey_state: str
    scale: int

    class Config:
        from_attributes = True
