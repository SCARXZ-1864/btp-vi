from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    department_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    department_id: Optional[int] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str
    department_id: Optional[int] = None
