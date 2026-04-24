import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db

app = FastAPI(title="EduCRM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.User, db: Session = Depends(get_db)):
    db_user = db.query(models.UserBase).filter(models.UserBase.username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Такой пользователь уже зарегистрирован"
        )

    new_user = models.UserBase(
        username=user_in.username,
        hashed_password=user_in.password,
        role="student"
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "Success", "id": new_user.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Ошибка при записи в БД")


@app.post("/login")

def login(user_in: schemas.User,db: Session = Depends(get_db)):
    user=db.query(models.UserBase).filter(models.UserBase.username==user_in.username).first()
    if not user or user.hashed_password != user_in.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильный пароль"
        )
    return {"message": "Успешный вход", "username": user.username, "role": user.role}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


@app.post("/search")
def my_search(answer: schemas.StudentSearch, db: Session = Depends(get_db)):

    my_student = db.query(models.StudentsBase).filter(
        models.StudentsBase.fullname.ilike(f"%{answer.query}%")
    ).all()


    return my_student

@app.get("/students")
def get_all_students(db: Session = Depends(get_db)):
    return db.query(models.StudentsBase).all()

@app.post("/students")
def add_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    new_student = models.StudentsBase(**student_in.dict())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student



@app.get("/courses")
def get_course(db: Session=Depends(get_db)):
    courses = db.query(models.CoursesBase.title).all()
    return [c[0] for c in courses]




