from pydantic import BaseModel, EmailStr
from typing import Optional

class ContactFormData(BaseModel):
    name: str
    email: EmailStr
    entity: Optional[str] = None
    position: Optional[str] = None
    subject: str
    message: str

class PasswordResetRequest(BaseModel):
    email: EmailStr