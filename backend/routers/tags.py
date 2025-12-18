# routers/tags.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
)

@router.post("/", response_model=schemas.Tag, summary="Создать новый тег")
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db=db, tag=tag)

@router.get("/", response_model=List[schemas.Tag], summary="Получить список всех тегов")
def read_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tags = crud.get_tags(db, skip=skip, limit=limit)
    return tags

@router.put("/{tag_id}", response_model=schemas.Tag, summary="Обновить тег по ID")
def update_tag_endpoint(tag_id: int, tag: schemas.TagCreate, db: Session = Depends(get_db)):
    updated_tag = crud.update_tag(db, tag_id=tag_id, tag=tag)
    if updated_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return updated_tag


@router.delete("/{tag_id}", status_code=204, summary="Удалить тег по ID")
def delete_tag_endpoint(tag_id: int, db: Session = Depends(get_db)):
    db_tag = crud.delete_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    # При успехе (status_code=204) тело ответа будет пустым
    return