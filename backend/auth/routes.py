import sys
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session


sys.path.append(r"D:\WORK\Python\web\web_app_vsl\backend\modules")
from modules.database import SessionLocal
from modules.create_table import User
from utils import hash_password, verify_password, create_access_token
from modules.schemas import UserCreate, UserLogin, UserResponse



router = APIRouter(prefix="", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}


