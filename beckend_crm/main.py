import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session,joinedload
from datetime import datetime,timezone,date
from typing import List

import models
import schemas
from EduCRM.beckend_crm.schemas import AttendanceUpdate, PaymentsResponse, PaymentsUpdate
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="EduCRM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ================================== AUTHENTICATION ======================================
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

# =============================== STUDENTS =======================================

@app.get("/students", response_model=List[schemas.StudentResponse])
def get_all_students(db: Session = Depends(get_db)):

    students = db.query(models.StudentsBase).options(joinedload(models.StudentsBase.courses)).all()
    result = []

    for s in students:
        student_dict = schemas.StudentResponse.model_validate(s)
        student_dict.course = s.courses[0].title if s.courses else "Нет курса"

        result.append(student_dict)

    return result

@app.post("/students", response_model=schemas.StudentResponse)
def add_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    # 1. Создаем объект студента из данных формы
    new_student = models.StudentsBase(
        fullname=student_in.fullname,
        email=student_in.email,
        phone=student_in.phone,
        age=student_in.age,
        status=student_in.status,
        is_active=student_in.is_active,
        date_rage=student_in.date_rage,
        last_payment_date=datetime.now(timezone.utc)
    )

    # 2. Ищем курс в базе по названию, пришедшему с фронта
    db_course = db.query(models.CoursesBase).filter(models.CoursesBase.title == student_in.course).first()
    if not db_course:
        raise HTTPException(status_code=404, detail=f"Курс '{student_in.course}' не найден")

    new_student.courses.append(db_course)

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    response = schemas.StudentResponse.from_orm(new_student)
    response.course = db_course.title
    return response


@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(models.StudentsBase).filter(models.StudentsBase.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Студент не найден")

    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted"}


# ======================= COURSES ========================================

@app.get("/courses",response_model=List[schemas.CoursesResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.CoursesBase).options(joinedload(models.CoursesBase.students)).all()
    # Возвращаем полные объекты курсов для страницы "Курсы" и селектов
    if not courses:
        raise HTTPException(status_code=404,detail="Курсы не найдены!")

    return courses


@app.get("/courses/title")
def get_course_titles(db: Session = Depends(get_db)):
    courses = db.query(models.CoursesBase.title).all()
    return [c[0] for c in courses]

#=========================Stats==================================================
@app.get("/stats")
def get_stats():
    # Заглушка, чтобы Dashboard не падал
    return {
        "totalStudents": 0,
        "activeCourses": 0,
        "totalRevenue": 0,
        "attendanceRate": 0
    }
#=======================Payments=================================================

@app.get("/payments", response_model=List[PaymentsResponse])
def get_payments(db:Session = Depends(get_db)):
    my_payments = db.query(models.PaymentsBase).options(
        joinedload(models.PaymentsBase.student),
        joinedload(models.PaymentsBase.course)).all()
    for p in my_payments:
        p.student_name = p.student.fullname if p.student else "Удален"
        p.course_title = p.course.title if p.course else "Нет курса"

    return my_payments

@app.patch("/payments",response_model=List[PaymentsResponse])
def payments_status(status_in: List[PaymentsUpdate],db: Session = Depends(get_db)):
    my_status = []

    for st in my_status:
        biker = db.query(models.PaymentsBase).filter(models.PaymentsBase.id == st.id).first()
        if biker:
            biker.status = st.status
            my_status.append(biker)

    return my_status
    
#=====================ATTENDANCE=================================================

@app.get("/attendance", response_model=List[schemas.AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.AttendanceBase).options(
        joinedload(models.AttendanceBase.student),
        joinedload(models.AttendanceBase.course)
    ).all()

@app.post("/attendance",response_model = schemas.AttendanceResponse)
def post_attendance(atten_in: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    new_atten = models.AttendanceBase(
        student_id = atten_in.student_id,
        course_id = atten_in.course_id,
        # date = atten_in.date,  <-- база сама поставит текущую дату по умолчанию
        status = atten_in.status
    )
    db.add(new_atten)
    db.commit()
    db.refresh(new_atten)

    return new_atten

@app.patch("/attendance",response_model = schemas.AttendanceResponse)
def atten_update(update_in: List[AttendanceUpdate],db: Session= Depends(get_db)):
    record_update = []

    for item in update_in:
        record = db.query(models.AttendanceBase).filter(models.AttendanceBase.id == item.id).first()

        if record:
            record.status = item.status
            record_update.append(record)

        else:
            raise HTTPException (
                status_code=404,
                detail="Студент не найден"
            )
    db.commit()
    for r in record_update:
        db.refresh(r)

    return record_update


if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=8000)