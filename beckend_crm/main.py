from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import students, auth, courses, payments, attendance
from database import engine
import models
import uvicorn

# Создаем таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduCRM Backend")

origins = [
    "http://localhost:3000",      # Create React App / Next.js
    "http://localhost:5173",      # Vite (стандартный порт)
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Точный список вместо ["*"]
    allow_credentials=True,       # Обязательно для кук
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(auth.router, tags=["Authentication"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])

@app.get("/stats")
def get_stats():
    return {"totalStudents": 0, "activeCourses": 0, "totalRevenue": 0, "attendanceRate": 0}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
