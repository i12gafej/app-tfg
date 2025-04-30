from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union
from decimal import Decimal

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

class AssessmentSearch(BaseModel):
    material_topic_id: Optional[int] = None
    stakeholder_id: Optional[int] = None
    is_internal: Optional[bool] = None

class AssessmentResponse(BaseModel):
    items: List[Assessment]
    total: int

class MultipleAssessmentsCreate(BaseModel):
    stakeholder_id: int
    assessments: List[dict] = Field(..., description="Lista de {material_topic_id: int, score: int}")
    report_id: int  # Para validar que la encuesta está activa

class PrivateSurveySearch(BaseModel):
    search_term: Optional[str] = None
    heritage_resource_name: Optional[str] = None
    year: Optional[Union[str, int]] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 10

class PrivateSurvey(BaseModel):
    id: int
    heritage_resource_id: int
    heritage_resource_name: str
    year: Union[str, int]
    survey_state: str

    class Config:
        from_attributes = True

class PrivateSurveyResponse(BaseModel):
    items: List[PrivateSurvey]
    total: int
    page: int
    per_page: int
    total_pages: int
