from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timezone
from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    return db.query(models.StudentsBase).options(
        joinedload(models.StudentsBase.courses),
        joinedload(models.StudentsBase.payments)
    ).all()


@router.post("/", response_model=schemas.StudentResponse)
def add_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    new_student = models.StudentsBase(
        fullname=student_in.fullname,
        email=student_in.email,
        phone=student_in.phone,
        age=student_in.age,
        is_active=student_in.is_active,
        date_rage=student_in.date_rage,
        last_payment_date=datetime.now(timezone.utc)
    )
    db_course = db.query(models.CoursesBase).filter(models.CoursesBase.title == student_in.course).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    new_student.courses.append(db_course)
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

# Остальные методы (PATCH, DELETE) переноси сюда по аналогии...