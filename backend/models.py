from sqlalchemy import (
    DateTime, create_engine, Column, Integer, String, Text, 
    TIMESTAMP, Float, ForeignKey, UniqueConstraint, Enum
)
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

# --- Таблицы-справочники ---

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    registration_date = Column(TIMESTAMP(timezone=True), server_default=func.now())

    sessions = relationship("InterviewSession", back_populates="user")

class Topic(Base):
    __tablename__ = 'topics'

    id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String(255), unique=True, nullable=False, index=True)
    topic_description = Column(Text, nullable=True)


    knowledge_sources = relationship("KnowledgeSource", back_populates="topic")
    sessions = relationship("InterviewSession", back_populates="topic")

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, index=True)
    tag_name = Column(String(255), unique=True, nullable=False, index=True)

    knowledge_sources = relationship("KnowledgeSource", secondary="source_tags", back_populates="tags")

# --- Связующая таблица (Многие-ко-многим) ---

class SourceTag(Base):
    __tablename__ = 'source_tags'

    source_id = Column(Integer, ForeignKey('knowledge_sources.id', ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.id', ondelete="CASCADE"), primary_key=True)

class SourceStatus(enum.Enum):
    PENDING = "pending"       # файл загружен, ждет очереди на обработку
    PROCESSING = "processing" # идет разбиение на чанки и создание эмбеддингов
    COMPLETED = "completed"   # успешно проиндексировано, можно использовать
    FAILED = "failed"    
# --- Основные таблицы ---

class KnowledgeSource(Base):
    __tablename__ = 'knowledge_sources'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    source_url = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    status = Column(Enum(SourceStatus), default=SourceStatus.PENDING, nullable=False)
    
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete="RESTRICT"), nullable=False)

    # Отношения:
    # Один источник принадлежит одной теме
    topic = relationship("Topic", back_populates="knowledge_sources")
    # Один источник может иметь много тегов (через связующую таблицу)
    tags = relationship("Tag", secondary="source_tags", back_populates="knowledge_sources")

class InterviewSession(Base):
    __tablename__ = 'interview_sessions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    session_start_time = Column(TIMESTAMP(timezone=True), server_default=func.now())
    session_end_time = Column(TIMESTAMP(timezone=True), nullable=True)
    overall_score = Column(Float, nullable=True)

    topic_id = Column(Integer, ForeignKey('topics.id', ondelete="RESTRICT"), nullable=False)

    # Отношения:
    # Одна сессия принадлежит одному пользователю
    user = relationship("User", back_populates="sessions")
    # Одна сессия принадлежит одной теме
    topic = relationship("Topic", back_populates="sessions")
    # Одна сессия может содержать много вопросов-ответов
    questions = relationship("SessionQnA", back_populates="session", cascade="all, delete-orphan")

class SessionQnA(Base):
    __tablename__ = 'session_qna'

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('interview_sessions.id', ondelete="CASCADE"), nullable=False)
    
    question_text = Column(Text, nullable=False)
    user_answer_text = Column(Text, nullable=True)
    reference_answer_text = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Отношение: один вопрос-ответ принадлежит одной сессии
    session = relationship("InterviewSession", back_populates="questions")