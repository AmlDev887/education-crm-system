from datetime import datetime
from pydantic import BaseModel,Field, field_validator,EmailStr


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
    email: EmailStr
    phone: str
    age: int = Field(ge=3,le=110)
    status: str
    is_active: bool=True
    last_payment_date: datetime | None
    date_rage: datetime | None










