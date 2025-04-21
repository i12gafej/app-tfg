from pydantic import BaseModel, EmailStr, constr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    id: int
    email: str
    admin: bool
    name: str | None = None
    surname: str | None = None
    phone_number: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo

class TokenData(BaseModel):
    email: str | None = None
    admin: bool = False 