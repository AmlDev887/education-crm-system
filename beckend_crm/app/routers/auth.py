from random import sample

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import security
import schemas
import models
from database import get_db


router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.User,response:Response, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    db_user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Такой пользователь уже зарегистрирован,получите токен!"
        )


    # Хешируем пароль перед сохранением
    hashed_pwd = security.hash_password(user_in.password)

    new_user = models.UserBase(
        username=user_in.username,
        hashed_password=hashed_pwd,
        role=user_in.role  # Роль по умолчанию
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = security.create_access_token(user_in.username)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False
    )
    return {"message": "Success",
            "id": new_user.id,
            "access_token":token,
            "token_type":"bearer"
            }


@router.post("/login")
def login(user_in: schemas.User,response: Response, db: Session = Depends(get_db)):
    user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()

    # Сверяем введенный пароль с хешем в базе
    if not user or not security.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = security.create_access_token(user_in.username)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False
    )
    return {
        "message": "Успешный вход",
        "username": user.username,
        "role": user.role,
        "access_token": token,
        "token_type":"bearer"
    }

@router.get("/profile")
def get_profile(current_user: str = Depends(security.get_current_user),db: Session = Depends(get_db)):
    user = db.query(models.UserBase).filter(models.UserBase.username == current_user).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    return {
    "id": user.id,
    "username": user.username,
    "role": user.role
    }
