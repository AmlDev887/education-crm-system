from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, computed_field

class User(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=2, max_length=21)
    role: str | None = None

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


# ===================== Short Models =====================

class StudentShortResponse(BaseModel):
    id: int
    fullname: str
    email: str

    model_config = ConfigDict(from_attributes=True)


# ======================= Courses ============================

class CoursesResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float | None = None
    duration: int | None = None
    students: list[StudentShortResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ========================= Student ==============================

class StudentCreate(BaseModel):
    fullname: str
    email: str
    phone: str
    age: int
    course: str
    is_active: bool = True
    registration_date: Optional[datetime] = None 

    model_config = ConfigDict(from_attributes=True)


class StudentUpdate(BaseModel):
    id: Optional[int] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)


class StudentResponse(BaseModel):
    id: int
    fullname: str
    email: str
    phone: str
    age: int
    is_active: bool
    # 1. Делаем даты необязательными на случай NULL в базе данных
    registration_date: Optional[datetime] = None
    last_payment_date: Optional[datetime] = None

    courses: List[CoursesResponse] = []
    payments: List[PaymentsResponse] = []

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def course(self) -> str:
        # Прямое обращение к полю Pydantic
        if self.courses:
            return self.courses[0].title
        return "Пусто в БД"

    @computed_field
    @property
    def status(self) -> str:
        # Прямое обращение к полю Pydantic
        if self.payments:
            return "Оплачено" if any(p.status == "paid" for p in self.payments) else "Не оплачено"
        return "Нет записей"


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


# Принудительно связываем ссылки в конце файла
CoursesResponse.model_rebuild()
StudentResponse.model_rebuild()