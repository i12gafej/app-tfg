from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class HeritageResourceBase(BaseModel):
    name: str
    typology: List[str]
    ownership: Optional[str] = None
    management_model: Optional[str] = None
    postal_address: Optional[str] = None
    web_address: Optional[str] = None
    phone_number: Optional[str] = None
    social_networks: Optional[List[str]] = None

class HeritageResourceCreate(HeritageResourceBase):
    pass

class HeritageResource(HeritageResourceBase):
    id: int

    class Config:
        from_attributes = True

class ResourceSearch(BaseModel):
    search_term: Optional[str] = None
    name: Optional[str] = None
    ownership: Optional[str] = None
    management_model: Optional[str] = None
    postal_address: Optional[str] = None
    page: Optional[int] = 1
    per_page: Optional[int] = 10 