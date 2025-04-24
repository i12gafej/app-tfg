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
    type: str
    organization: str
    report_id: int
    user_id: int

    class Config:
        from_attributes = True

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

# Esquema para recibir los datos del frontend
class TeamMemberCreateParams(BaseModel):
    # Datos del usuario
    name: str
    surname: str
    email: str
    password: str
    phone_number: Optional[str] = None
    
    # Datos del miembro del equipo
    role: str
    organization: str
    report_id: int

# Esquema para crear el miembro del equipo en la base de datos
class TeamMemberCreate(BaseModel):
    report_id: int
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

class TeamMemberList(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    phone_number: Optional[str] = None
    role: str
    organization: str
    report_id: int
    user_id: int

    class Config:
        from_attributes = True

class TeamMemberDelete(BaseModel):
    id: int
