from sqlalchemy import String, DateTime, Integer, ForeignKey, Float, Boolean, Table, Column, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from database import Base
from datetime import datetime, date, timedelta, timezone

class UserBase(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user")

# Промежуточная таблица Many-to-Many
student_course = Table(
    'student_course', Base.metadata,
    Column('student_id', ForeignKey('students.id', ondelete="CASCADE"), primary_key=True),
    Column('course_id', ForeignKey('courses.id', ondelete="CASCADE"), primary_key=True)
)

class StudentsBase(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    fullname: Mapped[str] = mapped_column(String(60), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)

    # Используем server_default=func.now() вместо устаревшего datetime.utcnow
    registration_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_payment_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


    courses = relationship("CoursesBase", secondary=student_course, back_populates="students")
    payments = relationship("PaymentsBase", back_populates='student', cascade="all, delete-orphan")
    attendances = relationship("AttendanceBase", back_populates='student', cascade="all, delete-orphan")

class CoursesBase(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(35), nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    duration: Mapped[int] = mapped_column(Integer)

    students = relationship("StudentsBase", secondary=student_course, back_populates="courses")
    payments = relationship("PaymentsBase", back_populates="course")
    attendances = relationship("AttendanceBase", back_populates="course")

class AttendanceBase(Base):
    __tablename__ = "attendance"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="present", nullable=False)

    student = relationship("StudentsBase", back_populates="attendances")
    course = relationship("CoursesBase", back_populates="attendances")

    @property
    def student_name(self):
        return self.student.fullname if self.student else "Удален"

    @property
    def course_title(self):
        return self.course.title if self.course else "Нет курса"

class PaymentsBase(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    method: Mapped[str] = mapped_column(String(60), nullable=False, default="card")
    status: Mapped[str] = mapped_column(String(60), nullable=False, default="paid")
    next_payment_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    @validates("payment_date")
    def validate_payment_date(self, key, value):
        if value:
            self.next_payment_date = value + timedelta(days=30)
        return value

    student: Mapped["StudentsBase"] = relationship("StudentsBase", back_populates="payments")
    course: Mapped["CoursesBase"] = relationship("CoursesBase", back_populates="payments")