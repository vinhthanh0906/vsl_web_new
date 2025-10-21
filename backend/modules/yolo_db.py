# modules/yolo_db.py
from sqlalchemy import Column, Integer, String
from modules.database import Base

class ModelInfo(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    version = Column(String)
    description = Column(String)
    file_path = Column(String)


