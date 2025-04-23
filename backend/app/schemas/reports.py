from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime

class SustainabilityReportBase(BaseModel):
    year: int
    state: str = 'Draft'
    observation: str = ''
    cover_photo: Optional[str] = None
    commitment_letter: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[str] = None
    org_chart_text: Optional[str] = None
    org_chart_figure: Optional[str] = None
    diagnosis_description: Optional[str] = None
    scale: int = 0
    action_plan_description: Optional[str] = None
    internal_coherence_description: Optional[str] = None
    main_impact_weight: Optional[Decimal] = None
    secondary_impact_weight: Optional[Decimal] = None
    roadmap_description: Optional[str] = None
    data_tables_text: Optional[str] = None

class SustainabilityReportCreate(SustainabilityReportBase):
    heritage_resource_id: int

class SustainabilityReport(SustainabilityReportBase):
    id: int
    heritage_resource_id: int

    class Config:
        from_attributes = True 