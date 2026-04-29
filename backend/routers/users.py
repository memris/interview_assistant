from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.services.auth_service import auth_service

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/", response_model=schemas.User, summary="Создать нового пользователя")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.get("/", response_model=List[schemas.User], summary="Получить список пользователей")
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas.User, summary="Получить пользователя по ID")
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.post("/register", response_model=schemas.User)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # проверка, нет ли уже такого пользователя
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # создание нового пользователя с хешированным паролем
    hashed_password = auth_service.get_password_hash(user_data.password)
    new_user = models.User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role # передача роли из схемы
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not auth_service.verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # генерация JWT токена
    access_token = auth_service.create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role.value,
        "username": user.username
    }