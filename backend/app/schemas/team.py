from typing import List, Optional
from pydantic import BaseModel

class ResourceBase(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    id: int
    year: int
    heritage_resource_id: int

    class Config:
        from_attributes = True

class TeamMemberBase(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    role: str
    organization: str

class TeamMemberSearch(BaseModel):
    report_id: int
    search_term: Optional[str] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    organization: Optional[str] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 10

class TeamMemberCreate(BaseModel):
    user_id: int
    role: str
    organization: str

class TeamMemberUpdate(BaseModel):
    role: str
    organization: str

class ResourceSearch(BaseModel):
    search_term: Optional[str] = None
    name: Optional[str] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 10

class ReportSearch(BaseModel):
    resource_id: int
    search_term: Optional[str] = None
    year: Optional[str] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 10

class PaginatedResponse(BaseModel):
    items: List[BaseModel]
    total: int
    page: int
    per_page: int
    total_pages: int
