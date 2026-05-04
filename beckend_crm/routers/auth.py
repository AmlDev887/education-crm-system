from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, security
from ..database import get_db

router = APIRouter()


@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.User, db: Session = Depends(get_db)):
    db_user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Такой пользователь уже зарегистрирован")

    # ИСПОЛЬЗУЕМ ХЕШИРОВАНИЕ ИЗ SECURITY.PY
    hashed_pwd = security.hash_password(user_in.password)

    new_user = models.UserBase(
        username=user_in.username,
        hashed_password=hashed_pwd,
        role="student"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Success", "id": new_user.id}


@app.post("/login")
def login(user_in: schemas.User, db: Session = Depends(get_db)):
    user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()
    # ПРОВЕРЯЕМ ХЕШ
    if not user or not security.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неправильный логин или пароль")
    return {"message": "Успешный вход", "username": user.username, "role": user.role}