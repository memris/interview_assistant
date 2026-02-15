import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import crud, schemas, models
from ..database import get_db
from ..services.indexing_service import indexing_service

router = APIRouter(
    prefix="/knowledge_sources",
    tags=["Knowledge Sources"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.KnowledgeSource)
async def create_knowledge_source(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    topic_id: int = Form(...),
    file: UploadFile = File(...),
    tags: Optional[List[int]] = Form(None),
    db: Session = Depends(get_db)
):
    # сохранение файла на диск
    file_path = os.path.join(UPLOAD_DIR, f"{topic_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_source = models.KnowledgeSource(
        title=title,
        topic_id=topic_id,
        content="",
        status=models.SourceStatus.PENDING
    )

    if tags:
        unique_tag_ids = list(set(tags))
        db_tags = db.query(models.Tag).filter(models.Tag.id.in_(unique_tag_ids)).all()
        db_source.tags = db_tags

    db.add(db_source)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка БД: {str(e)}")
    db.refresh(db_source)

    # заупск тяжелой задачи индексации в фоне
    background_tasks.add_task(
        indexing_service.process_source, 
        db=db, 
        source_id=db_source.id, 
        file_path=file_path
    )

    return db_source

@router.get("/", response_model=List[schemas.KnowledgeSource])
def read_knowledge_sources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.KnowledgeSource).offset(skip).limit(limit).all()

@router.get("/{source_id}", response_model=schemas.KnowledgeSource)
def read_knowledge_source(source_id: int, db: Session = Depends(get_db)):
    db_source = db.query(models.KnowledgeSource).filter(models.KnowledgeSource.id == source_id).first()
    if db_source is None:
        raise HTTPException(status_code=404, detail="Source not found")
    return db_source