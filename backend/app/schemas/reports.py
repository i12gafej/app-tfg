from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class ReportNormBase(BaseModel):
    norm: str
    report_id: int

class ReportNormCreate(ReportNormBase):
    pass

class ReportNormUpdate(BaseModel):
    norm: str
    report_id: int

class ReportNorm(ReportNormBase):
    id: int

    class Config:
        from_attributes = True

class SustainabilityReportBase(BaseModel):
    year: int
    state: str = 'Draft'
    survey_state: str = 'inactive'
    observation: str = ''
    cover_photo: Optional[str] = None
    commitment_letter: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None
    org_chart_text: Optional[str] = None
    org_chart_figure: Optional[str] = None
    diagnosis_description: Optional[str] = None
    scale: int = 5
    action_plan_description: Optional[str] = None
    internal_coherence_description: Optional[str] = None
    main_impact_weight: Optional[Decimal] = None
    secondary_impact_weight: Optional[Decimal] = None
    roadmap_description: Optional[str] = None
    data_tables_text: Optional[str] = None

class SustainabilityReportCreate(SustainabilityReportBase):
    heritage_resource_id: int

class SustainabilityReportUpdate(BaseModel):
    year: Optional[int] = None
    state: Optional[str] = None
    survey_state: Optional[str] = None
    observation: Optional[str] = None
    cover_photo: Optional[str] = None
    commitment_letter: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None
    org_chart_text: Optional[str] = None
    org_chart_figure: Optional[str] = None
    diagnosis_description: Optional[str] = None
    scale: Optional[int] = None
    action_plan_description: Optional[str] = None
    internal_coherence_description: Optional[str] = None
    main_impact_weight: Optional[Decimal] = None
    secondary_impact_weight: Optional[Decimal] = None
    roadmap_description: Optional[str] = None
    data_tables_text: Optional[str] = None
    heritage_resource_id: Optional[int] = None

class ReportUpdateRequest(BaseModel):
    report_id: int
    report_data: SustainabilityReportUpdate

class SustainabilityReport(SustainabilityReportBase):
    id: int
    heritage_resource_id: int
    heritage_resource_name: Optional[str] = None
    norms: List[ReportNorm] = []

    class Config:
        from_attributes = True 