from passlib.context import CryptContext
import jwt
from datetime import timedelta,datetime,timezone
from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from passlib.context  import CryptContext
import secrets
from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY=secrets.token_urlsafe(32)

def create_access_token(username: str):
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=360)

    payload = {
        "sub": username,
        "exp": expires
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"
    )

    return token

# Настройка алгоритма хеширования
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)