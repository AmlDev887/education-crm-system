from datetime import datetime
from pydantic import BaseModel,Field, field_validator,EmailStr
from typing import Optional

class User(BaseModel):
    username: str= Field(...,min_length=2,max_length=100)
    password: str= Field(...,min_length=2,max_length=21)

class StudentSearch(BaseModel):
    query: str = ""

    @field_validator("query")
    @classmethod
    def clean_query(cls,v):
        if isinstance(v,str):
            return  v.strip()
        return v

# schemas.py

class StudentCreate(BaseModel):
    fullname: str
    email: str
    phone: str
    age: int
    course: str
    status: str
    is_active: bool
    date_rage: datetime

    class Config:
        from_attributes = True

class StudentResponse(BaseModel):
    id: int
    fullname: str
    email: str
    phone: str
    age: int
    status: str
    is_active: bool
    date_rage: datetime
    last_payment_date: datetime
    course: Optional[str] = None  # <--- Сделай его необязательным по умолчанию

    class Config:
        from_attributes = True












