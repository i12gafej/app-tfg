from typing import Optional
from pydantic import BaseModel, EmailStr, constr

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    admin: bool = False
    name: Optional[str] = None
    surname: Optional[str] = None
    phone_number: Optional[str] = None


class UserUpdate(UserBase):
    password: Optional[constr(min_length=8)] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    password: str 

class UserSearch(BaseModel):
    search_term: Optional[str] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    is_admin: Optional[bool] = None

    class Config:
        json_schema_extra = {
            "example": {
                "search_term": "juan",
                "name": "Juan",
                "surname": "Pérez",
                "email": "juan@example.com",
                "is_admin": True
            }
        } 

class UserCreate(BaseModel):
    name: str
    surname: str
    email: str
    password: str
    admin: bool = False
    phone_number: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    user_id: int
    old_password: str
    new_password: str