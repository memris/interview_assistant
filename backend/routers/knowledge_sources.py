from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/knowledge_sources",
    tags=["Knowledge Sources"],
)

@router.post("/", response_model=schemas.KnowledgeSource, summary="Добавить новый источник знаний")
def create_knowledge_source(source: schemas.KnowledgeSourceCreate, db: Session = Depends(get_db)):
    return crud.create_knowledge_source(db=db, source=source)

@router.get("/", response_model=List[schemas.KnowledgeSource], summary="Получить список источников знаний")
def read_knowledge_sources(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sources = crud.get_knowledge_sources(db, skip=skip, limit=limit)
    return sources

@router.get("/{source_id}", response_model=schemas.KnowledgeSource, summary="Получить источник знаний по ID")
def read_knowledge_source(source_id: int, db: Session = Depends(get_db)):
    db_source = crud.get_knowledge_source(db, source_id=source_id)
    if db_source is None:
        raise HTTPException(status_code=404, detail="Knowledge source not found")
    return db_source