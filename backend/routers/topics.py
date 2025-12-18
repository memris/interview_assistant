from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, models, schemas
from ..database import engine, get_db

models.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/topics",
    tags=["Topics"],
)


@router.post("/", response_model=schemas.Topic, summary="Создать новую тему")
def create_topic(topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    db_topic = crud.get_topic_by_name(db, topic_name=topic.topic_name)
    if db_topic:
        raise HTTPException(status_code=400, detail="Topic with this name already exists")
    return crud.create_topic(db=db, topic=topic)


@router.get("/", response_model=List[schemas.Topic], summary="Получить список всех тем")
def read_topics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    topics = crud.get_topics(db, skip=skip, limit=limit)
    return topics


@router.get("/{topic_id}", response_model=schemas.Topic, summary="Получить тему по ID")
def read_topic(topic_id: int, db: Session = Depends(get_db)):
    db_topic = crud.get_topic(db, topic_id=topic_id)
    if db_topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return db_topic


@router.put("/{topic_id}", response_model=schemas.Topic, summary="Обновить тему по ID")
def update_topic(topic_id: int, topic_update: schemas.TopicCreate, db: Session = Depends(get_db)):
    db_topic = crud.get_topic(db, topic_id=topic_id)
    if db_topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    update_data = topic_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_topic, key, value)
        
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic


@router.delete("/{topic_id}", status_code=204, summary="Удалить тему по ID")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    db_topic = crud.get_topic(db, topic_id=topic_id)
    if db_topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    db.delete(db_topic)
    db.commit()
    return