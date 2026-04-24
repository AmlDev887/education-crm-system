from sqlalchemy import String, DateTime, Integer, ForeignKey, Boolean,Table,Column
from sqlalchemy.orm import Mapped, mapped_column, relationship # Добавили relationship
from database import Base
from datetime import datetime

class UserBase(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20))

student_course = Table(
    'student_course',Base.metadata,
    Column('student_id',ForeignKey ('students.id'),primary_key=True),
    Column('course_id',ForeignKey('courses.id'),primary_key=True)
)

class StudentsBase(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    fullname: Mapped[str] = mapped_column(String(60), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    date_rage: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow) # Исправил опечатку date_rage
    last_payment_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True) # Используем bool
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)

    courses = relationship("CoursesBase",secondary=student_course,back_populates="students")
    payments = relationship("PaymentsBase",back_populates='student')

class CoursesBase(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(35), nullable=False)
    description: Mapped[str] = mapped_column(String(200))
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[int] = mapped_column(Integer)

    students = relationship("StudentsBase",secondary=student_course,back_populates="courses")
    payments = relationship("PaymentsBase",back_populates="course")


class PaymentsBase(Base):
    __tablename__ = "payments" # Маленькими буквами для порядка
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    student = relationship("StudentsBase",back_populates="payments")
    course = relationship("CoursesBase",back_populates="payments")

