from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
# Используем абсолютные импорты, чтобы PyCharm видел структуру
import schemas
import models
from database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.CoursesResponse])
def get_courses(db: Session = Depends(get_db)):
    """
    Получение всех курсов вместе со списком студентов (Many-to-Many).
    """
    courses = db.query(models.CoursesBase).options(
        joinedload(models.CoursesBase.students)
    ).all()

    if not courses:
        # Необязательно кидать 404, если список пуст, но для CRM это может быть полезно
        raise HTTPException(status_code=404, detail="Курсы не найдены!")
    return courses


@router.get("/titles", response_model=List[str])
def get_course_titles(db: Session = Depends(get_db)):
    """
    Удобный эндпоинт для выпадающих списков на фронтенде — возвращает только названия.
    """
    # Запрос только одного поля 'title' для экономии ресурсов базы
    courses = db.query(models.CoursesBase.title).all()
    return [c.title for c in courses]