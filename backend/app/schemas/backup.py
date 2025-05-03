from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BackupResponse(BaseModel):
    message: str
    filename: Optional[str] = None
    created_at: datetime

class RestoreRequest(BaseModel):
    filename: str

class RestoreResponse(BaseModel):
    message: str
    restored_at: datetime
