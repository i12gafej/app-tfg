from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class SocialNetworkBase(BaseModel):
    network: str
    url: str

class HeritageResourceBase(BaseModel):
    name: str
    typology: List[str]
    ownership: Optional[str] = None
    management_model: Optional[str] = None
    postal_address: Optional[str] = None
    web_address: Optional[str] = None
    phone_number: Optional[str] = None
    social_networks: Optional[List[SocialNetworkBase]] = None

class HeritageResourceCreate(HeritageResourceBase):
    pass

class HeritageResourceUpdate(HeritageResourceBase):
    id: Optional[int] = None
    name: Optional[str] = None
    typology: Optional[List[str]] = None
    ownership: Optional[str] = None
    management_model: Optional[str] = None
    postal_address: Optional[str] = None
    web_address: Optional[str] = None
    phone_number: Optional[str] = None

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



