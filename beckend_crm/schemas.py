from datetime import datetime, date
from pydantic import BaseModel, Field, field_validator, ConfigDict, computed_field
from typing import Optional

class User(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=2, max_length=21)


# ========================= Student ==============================

class StudentCreate(BaseModel):
    fullname: str
    email: str
    phone: str
    age: int
    course: str
    is_active: bool
    date_rage: datetime

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    id:Optional[int] = None
    age:Optional[int] = None
    phone:Optional[str] = None
    course: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        from_attributes = True

class StudentResponse(BaseModel):
    id: int
    fullname: str
    email: str
    phone: str
    age: int
    is_active: bool
    date_rage: datetime
    last_payment_date: datetime

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def course(self) -> str:
        # Добавим принудительную отладку
        courses = getattr(self, 'courses', [])
        print(f"DEBUG: Студент {self.fullname}, курсов найдено: {len(courses)}")
        if courses:
            return courses[0].title
        return "Пусто в БД"

    @computed_field
    @property
    def status(self) -> str:
        payments = getattr(self, 'payments', [])
        print(f"DEBUG: Платежей найдено: {len(payments)}")
        if payments:
            return "Оплачено" if any(p.status == "paid" for p in payments) else "Не оплачено"
        return "Нет записей"


# ======================= Courses ============================

class CoursesResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float | None
    duration: int | None
    students: list[StudentResponse] = []

    class Config:
        from_attributes = True


# ===================== Attendance ===========================

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
    date: date

    model_config = ConfigDict(from_attributes=True)


class AttendanceUpdate(BaseModel):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)


# ===================== Payments =====================

class PaymentsResponse(BaseModel):

    id: int

    student_name: str | None = None
    course_title: str | None = None
    amount: int
    payment_date: datetime
    method: str
    status: str
    next_payment_date: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class PaymentsUpdate(BaseModel):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)