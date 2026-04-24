from datetime import datetime
from pydantic import BaseModel,Field, field_validator


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

class StudentCreate(BaseModel):
    fullname: str
    email: str
    phone: str
    age: int
    status: str
    is_active: bool
    last_payment_date: datetime | None
    date_rage: datetime | None


class StudentCreate(BaseModel):
    pass









