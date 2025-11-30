import os
import sys
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from modules.database import SessionLocal
from modules.yolo_db import ModelInfo
from ultralytics import YOLO

sys.path.append(r"D:\WORK\Python\web\github_zone\vsl_web_new\backend\modules")
sys.path.append(r"D:\WORK\Python\web\github_zone\vsl_web_new\backend\yolo\model")


router = APIRouter(prefix="/models", tags=["models"])
UPLOAD_DIR = "models"

os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔹 Upload model
@router.post("/upload")
async def upload_model(
    name: str = Form(...),
    description: str = Form(""),
    version: str = Form("1.0"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    model_entry = ModelInfo(
        name=name,
        version=version,
        description=description,
        file_path=file_path
    )
    db.add(model_entry)
    db.commit()
    db.refresh(model_entry)

    return {"message": "Model uploaded successfully", "model": model_entry}

# 🔹 List models
@router.get("/")
def list_models(db: Session = Depends(get_db)):
    return db.query(ModelInfo).all()

# 🔹 Load and test a model
@router.get("/load/{name}")
def load_model(name: str, db: Session = Depends(get_db)):
    model_entry = db.query(ModelInfo).filter(ModelInfo.name == name).first()
    if not model_entry:
        raise HTTPException(status_code=404, detail="Model not found")

    model = YOLO(model_entry.file_path)
    return {"message": f"Model '{name}' loaded successfully", "path": model_entry.file_path}
