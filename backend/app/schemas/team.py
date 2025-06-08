from typing import List, Optional
from pydantic import BaseModel

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


class TeamMemberCreateParams(BaseModel):
    name: str
    surname: str
    email: str
    password: str
    phone_number: Optional[str] = None
    role: str
    organization: Optional[str] = None
    report_id: int


class TeamMemberCreate(BaseModel):
    report_id: int
    user_id: int
    role: str
    organization: Optional[str] = None

class TeamMemberUpdate(BaseModel):
    role: Optional[str] = None
    organization: Optional[str] = None

class TeamMemberList(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    phone_number: Optional[str] = None
    role: str
    organization: Optional[str] = None
    report_id: int
    user_id: int

    class Config:
        from_attributes = True

class TeamMemberDelete(BaseModel):
    id: int
