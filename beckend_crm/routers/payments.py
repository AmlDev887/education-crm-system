from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
# Переходим на абсолютные импорты
from app import models, schemas
from app.database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.PaymentsResponse])
def get_payments(db: Session = Depends(get_db)):
    """
    Получение всех платежей с подгрузкой данных о студенте и курсе.
    """
    return db.query(models.PaymentsBase).options(
        joinedload(models.PaymentsBase.student),
        joinedload(models.PaymentsBase.course)
    ).all()


@router.patch("/{payment_id}/status", response_model=schemas.PaymentsResponse)
def patch_payment_status(
        payment_id: int,
        new_status: str,  # Например: "paid", "pending", "refunded"
        db: Session = Depends(get_db)
):
    """
    Обновление статуса платежа.
    """
    payment = db.query(models.PaymentsBase).filter(models.PaymentsBase.id == payment_id).first()

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Платеж не найден"
        )

    payment.status = new_status

    try:
        db.commit()
        db.refresh(payment)
        return payment
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обновлении статуса"
        )