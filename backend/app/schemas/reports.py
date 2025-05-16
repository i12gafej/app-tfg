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

class ReportAgreementBase(BaseModel):
    agreement: str
    report_id: int

class ReportAgreementCreate(ReportAgreementBase):
    pass

class ReportAgreementUpdate(BaseModel):
    agreement: str
    report_id: int

class ReportAgreement(ReportAgreementBase):
    id: int

    class Config:
        from_attributes = True

class ReportLogo(BaseModel):
    id: int
    logo: str
    report_id: int

    class Config:
        from_attributes = True

class ReportLogoResponse(ReportLogo):
    pass

class ReportBibliographyBase(BaseModel):
    reference: str
    report_id: int

class ReportBibliographyCreate(ReportBibliographyBase):
    pass

class ReportBibliographyUpdate(BaseModel):
    reference: str
    report_id: int

class ReportBibliography(ReportBibliographyBase):
    id: int

    class Config:
        from_attributes = True

class ReportPhoto(BaseModel):
    id: int
    photo: str
    description: Optional[str] = None
    report_id: int

    class Config:
        from_attributes = True

class ReportPhotoResponse(ReportPhoto):
    pass

class ReportPhotoUpdate(BaseModel):
    description: Optional[str] = None
    report_id: int

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
    permissions: int = 0
    stakeholders_text: Optional[str] = None
    materiality_text: Optional[str] = None
    main_secondary_impacts_text: Optional[str] = None
    materiality_matrix_text: Optional[str] = None
    action_plan_text: Optional[str] = None
    internal_coherence_text: Optional[str] = None
    diffusion_text: Optional[str] = None
    template: bool = False

class SustainabilityReportCreate(SustainabilityReportBase):
    heritage_resource_id: int
    template_report_id: Optional[int] = None

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
    permissions: Optional[int] = None
    stakeholders_text: Optional[str] = None
    materiality_text: Optional[str] = None
    main_secondary_impacts_text: Optional[str] = None
    materiality_matrix_text: Optional[str] = None
    action_plan_text: Optional[str] = None
    internal_coherence_text: Optional[str] = None
    diffusion_text: Optional[str] = None
    template: Optional[bool] = None

class SustainabilityReport(SustainabilityReportBase):
    id: int
    heritage_resource_id: int
    heritage_resource_name: Optional[str] = None
    norms: List[ReportNorm] = []
    logos: List[ReportLogo] = []
    agreements: List[ReportAgreement] = []
    bibliographies: List[ReportBibliography] = []
    photos: List[ReportPhoto] = []
    permissions: int

    class Config:
        from_attributes = True



class UserReportRole(BaseModel):
    report_id: int
    role: str  # 'manager', 'consultant', 'external_advisor'
    organization: str

    class Config:
        from_attributes = True

class SustainabilityReportWithRole(SustainabilityReport):
    user_role: Optional[UserReportRole] = None
    permissions: int

class UserRoleResponse(BaseModel):
    role: str 

class ReportSearch(BaseModel):
    search_term: Optional[str] = None
    heritage_resource_name: Optional[str] = None
    year: Optional[int] = None
    state: Optional[str] = None

