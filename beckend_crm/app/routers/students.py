from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import List
from datetime import datetime, timezone

import schemas
import models
from database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    """
    Получение всех студентов с их курсами и историей платежей.
    """
    return db.query(models.StudentsBase).options(
        selectinload(models.StudentsBase.courses),
        selectinload(models.StudentsBase.payments)
    ).all()


@router.post("/", response_model=schemas.StudentResponse)
def add_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового студента, привязка его к курсу и создание первого платежа.
    """
    # 1. Проверяем, существует ли курс
    db_course = db.query(models.CoursesBase).filter(models.CoursesBase.title == student_in.course).first()
    if not db_course:
        raise HTTPException(status_code=404, detail=f"Курс '{student_in.course}' не найден")

    # 2. Создаем объект студента
    now = datetime.now(timezone.utc)
    new_student = models.StudentsBase(
        fullname=student_in.fullname,
        email=student_in.email,
        phone=student_in.phone,
        age=student_in.age,
        is_active=student_in.is_active,
        registration_date=now,
        last_payment_date=now
    )

    # Связываем студент-курс (Many-to-Many)
    new_student.courses.append(db_course)

    try:
        db.add(new_student)
        db.flush()

        # Создаем платеж со статусом, выбранным на фронтенде
        new_payment = models.PaymentsBase(
            student_id=new_student.id,
            course_id=db_course.id,
            amount=int(db_course.price),
            payment_date=now,
            method="cash",
            status=student_in.status
        )
        db.add(new_payment)

        db.commit()

        # Возвращаем созданного студента с подгруженными связями (courses, payments)
        return db.query(models.StudentsBase).options(
            selectinload(models.StudentsBase.courses),
            selectinload(models.StudentsBase.payments)
        ).filter(models.StudentsBase.id == new_student.id).first()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка при добавлении студента: {str(e)}")


@router.patch("/{st_id}", response_model=schemas.StudentResponse)
def student_status(st_id: int, status_update: schemas.StudentUpdate, db: Session = Depends(get_db)):
    """
    Обновление данных студента и его статуса оплаты.
    """
    db_student = db.query(models.StudentsBase).options(
        selectinload(models.StudentsBase.courses),
        selectinload(models.StudentsBase.payments)
    ).filter(models.StudentsBase.id == st_id).first()

    if not db_student:
        raise HTTPException(status_code=404, detail="Студент не найден")

    update_data = status_update.model_dump(exclude_unset=True)

    # Проверяем, передал ли фронтенд статус оплаты
    new_status = update_data.pop("status", None) or update_data.pop("payment_status", None)
    if new_status:
        if db_student.payments:
            # Обновляем статус у последнего платежа
            latest_payment = max(db_student.payments, key=lambda p: p.payment_date or datetime.min)
            latest_payment.status = new_status
        elif db_student.courses:
            # Если платежей еще нет — создаем первый с выбранным статусом
            course = db_student.courses[0]
            new_payment = models.PaymentsBase(
                student_id=db_student.id,
                course_id=course.id,
                amount=int(course.price),
                payment_date=datetime.now(timezone.utc),
                method="cash",
                status=new_status
            )
            db.add(new_payment)

    # Обновляем остальные поля самого студента (fullname, email, phone и т.д.)
    for field, value in update_data.items():
        if hasattr(db_student, field):
            setattr(db_student, field, value)

    db.commit()

    return db.query(models.StudentsBase).options(
        selectinload(models.StudentsBase.courses),
        selectinload(models.StudentsBase.payments)
    ).filter(models.StudentsBase.id == st_id).first()


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """
    Удаление студента. Благодаря CASCADE в моделях, связи в student_course тоже удалятся.
    """
    db_student = db.query(models.StudentsBase).filter(models.StudentsBase.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Студент не найден")

    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted"}