from sqlalchemy.orm import Session
from . import models, schemas

# --- CRUD для Users ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(
        email=user.email, 
        username=user.username, 
        password_hash=fake_hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CRUD для Topics ---

def get_topic(db: Session, topic_id: int):
    return db.query(models.Topic).filter(models.Topic.id == topic_id).first()

def get_topic_by_name(db: Session, topic_name: str):
    return db.query(models.Topic).filter(models.Topic.topic_name == topic_name).first()

def get_topics(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Topic).offset(skip).limit(limit).all()

def create_topic(db: Session, topic: schemas.TopicCreate):
    db_topic = models.Topic(**topic.model_dump())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

# --- CRUD для Tags ---

def get_tag(db: Session, tag_id: int):
    return db.query(models.Tag).filter(models.Tag.id == tag_id).first()

def get_tags(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Tag).offset(skip).limit(limit).all()

def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(**tag.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def delete_tag(db: Session, tag_id: int):
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if db_tag:
        db.delete(db_tag)
        db.commit()
    return db_tag 

def update_tag(db: Session, tag_id: int, tag: schemas.TagCreate):
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if db_tag:
        db_tag.tag_name = tag.tag_name
        db.commit()
        db.refresh(db_tag)
    return db_tag

# --- CRUD для Knowledge Sources ---

def get_knowledge_source(db: Session, source_id: int):
    return db.query(models.KnowledgeSource).filter(models.KnowledgeSource.id == source_id).first()

def get_knowledge_sources(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.KnowledgeSource).offset(skip).limit(limit).all()

def create_knowledge_source(db: Session, source: schemas.KnowledgeSourceCreate):
    db_source = models.KnowledgeSource(
        title=source.title,
        source_url=source.source_url,
        content=source.content,
        topic_id=source.topic_id
    )
    
    tags = db.query(models.Tag).filter(models.Tag.id.in_(source.tags)).all()
    db_source.tags = tags
    
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

def delete_knowledge_source(db: Session, source_id: int):
    db_source = db.query(models.KnowledgeSource).filter(models.KnowledgeSource.id == source_id).first()
    if db_source:
        db.delete(db_source)
        db.commit()
    return db_source

def update_knowledge_source(db: Session, source_id: int, source_update: schemas.KnowledgeSourceCreate):
    db_source = db.query(models.KnowledgeSource).filter(models.KnowledgeSource.id == source_id).first()
    if not db_source:
        return None

    # Обновляем простые поля
    db_source.title = source_update.title
    db_source.source_url = source_update.source_url
    db_source.content = source_update.content
    db_source.topic_id = source_update.topic_id
    
    # Обновляем теги
    if source_update.tags is not None:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(source_update.tags)).all()
        db_source.tags = tags

    db.commit()
    db.refresh(db_source)
    return db_source

# --- CRUD для Interview Sessions ---

def create_interview_session(db: Session, session: schemas.InterviewSessionCreate):
    db_session = models.InterviewSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_interview_sessions_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.InterviewSession).filter(models.InterviewSession.user_id == user_id).offset(skip).limit(limit).all()

# --- CRUD для Session QnA ---

def create_session_qna(db: Session, qna: schemas.SessionQnACreate, session_id: int):
    db_qna = models.SessionQnA(**qna.model_dump(), session_id=session_id)
    db.add(db_qna)
    db.commit()
    db.refresh(db_qna)
    return db_qna


def get_interview_session(db: Session, session_id: int):
    return db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()