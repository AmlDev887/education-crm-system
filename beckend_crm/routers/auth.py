from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# Переходим на абсолютные импорты, чтобы PyCharm перестал "гореть"
from app import models, schemas, security
from app.database import get_db

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.User, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    db_user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Такой пользователь уже зарегистрирован"
        )

    # Хешируем пароль перед сохранением
    hashed_pwd = security.hash_password(user_in.password)

    new_user = models.UserBase(
        username=user_in.username,
        hashed_password=hashed_pwd,
        role="student"  # Роль по умолчанию
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Success", "id": new_user.id}


@router.post("/login")
def login(user_in: schemas.User, db: Session = Depends(get_db)):
    user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()

    # Сверяем введенный пароль с хешем в базе
    if not user or not security.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильный логин или пароль"
        )

    return {
        "message": "Успешный вход",
        "username": user.username,
        "role": user.role
    }