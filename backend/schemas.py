from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# --- Схемы для Tags ---

class TagBase(BaseModel):
    tag_name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    class Config:
        orm_mode = True

# --- Схемы для Topics ---

class TopicBase(BaseModel):
    topic_name: str
    topic_description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int

    class Config:
        orm_mode = True

# --- Схемы для Knowledge Sources ---

class KnowledgeSourceBase(BaseModel):
    title: str
    source_url: Optional[str] = None
    content: str
    topic_id: int

class KnowledgeSourceCreate(KnowledgeSourceBase):
    tags: List[int] = []

class KnowledgeSource(KnowledgeSourceBase):
    id: int
    added_date: datetime
    topic: Topic # <-- Возвращаем полный объект Topic
    tags: List[Tag] = [] # <-- Возвращаем список полных объектов Tag

    class Config:
        from_attributes = True

# --- Схемы для Users ---

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    registration_date: datetime

    class Config:
        orm_mode = True

# --- Схемы для Session QnA (Вопросы-Ответы) ---

class SessionQnABase(BaseModel):
    question_text: str
    user_answer_text: Optional[str] = None
    reference_answer_text: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None

class SessionQnACreate(SessionQnABase):
    pass

class SessionQnA(SessionQnABase):
    id: int
    session_id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# --- Схемы для Interview Sessions ---

class InterviewSessionBase(BaseModel):
    user_id: int
    topic_id: int

class InterviewSessionCreate(InterviewSessionBase):
    pass

class InterviewSessionUpdate(BaseModel):
    session_end_time: datetime
    overall_score: float

class InterviewSession(InterviewSessionBase):
    id: int
    session_start_time: datetime
    session_end_time: Optional[datetime] = None
    overall_score: Optional[float] = None
    questions: List[SessionQnA] = [] 

    class Config:
        orm_mode = True