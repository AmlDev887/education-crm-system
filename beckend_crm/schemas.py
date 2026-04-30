from datetime import datetime,date
from pydantic import BaseModel,Field, field_validator,EmailStr,ConfigDict
from typing import Optional

class User(BaseModel):
    username: str= Field(...,min_length=2,max_length=100)
    password: str= Field(...,min_length=2,max_length=21)
#=========================Student==============================
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
    course: Optional[str] = None

    class Config:
        from_attributes = True
#=======================Courses============================

class CoursesResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    duration: int

    students: list[StudentResponse] = []
    courses: list[StudentResponse] = []

    class Config:
        from_attributes = True

#=====================Attendance===========================
class AttendanceResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    date: date
    status: str
    student_name: str
    course_title: str

    model_config = ConfigDict(from_attributes=True)

class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    status: str
    date: date  # Или str, если не используешь тип date

model_config = ConfigDict(from_attributes=True)

class AttendanceUpdate(BaseModel):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)













