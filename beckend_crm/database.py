from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# database.py
DATABASE_URL = "postgresql+psycopg2://postgres:postgrespassword@db:5432/crm_db"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()