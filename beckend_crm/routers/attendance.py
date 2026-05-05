from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
# Используем абсолютные импорты для устранения ошибок индексации PyCharm
from app import models, schemas
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)):
    """
    Получение списка всей посещаемости с подгрузкой данных студента и курса.
    """
    return db.query(models.AttendanceBase).options(
        joinedload(models.AttendanceBase.student),
        joinedload(models.AttendanceBase.course)
    ).all()

@router.post("/", response_model=schemas.AttendanceResponse)
def post_attendance(atten_in: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    """
    Создание новой записи о посещаемости.
    """
    new_atten = models.AttendanceBase(
        student_id=atten_in.student_id,
        course_id=atten_in.course_id,
        status=atten_in.status
        # Поле date проставится автоматически из default=date.today в модели
    )

    try:
        db.add(new_atten)
        db.commit()
        db.refresh(new_atten)
        return new_atten
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при создании записи посещаемости")

@router.patch("/", response_model=List[schemas.AttendanceResponse])
def atten_update(update_in: List[schemas.AttendanceUpdate], db: Session = Depends(get_db)):
    """
    Массовое обновление статусов посещаемости.
    Если хотя бы один ID не найден — откатывает все изменения.
    """
    record_update = []

    for item in update_in:
        # Поиск записи по ID
        record = db.query(models.AttendanceBase).filter(models.AttendanceBase.id == item.id).first()

        if record:
            record.status = item.status
            record_update.append(record)
        else:
            # Если хоть одна запись не найдена, отменяем всё накопленное в сессии
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail=f"Запись посещаемости с id {item.id} не найдена"
            )

    try:
        db.commit()
        for r in record_update:
            db.refresh(r)
        return record_update
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при обновлении записей")