from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer, oauth2
from passlib.context  import CryptContext
from datetime import datetime, timedelta, timezone
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-development")
ALGORITHM = "HS256"

print("SECRET KEY LENGTH:", len(SECRET_KEY) if SECRET_KEY else 0)

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
        algorithm=ALGORITHM
    )
    return token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login",auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)):
    token = request.cookies.get("access_token")
    if not token:
         token = token_from_header
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Необходима авторизация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        username = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Некорректный токен"
            )
        return username
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен"
        )

# Настройка алгоритма хеширования
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

