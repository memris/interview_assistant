from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import List, Optional

from backend.models import SourceStatus
from . import models

class TagBase(BaseModel):
    tag_name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TopicBase(BaseModel):
    topic_name: str
    topic_description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class KnowledgeSourceBase(BaseModel):
    title: str
    topic_id: int
    source_url: Optional[str] = None
    content: str

class KnowledgeSourceCreate(KnowledgeSourceBase):
    tags: List[int] = []

class KnowledgeSource(KnowledgeSourceBase):
    id: int
    content: str
    status: SourceStatus 
    created_at: datetime
    topic: Topic 
    tags: List[Tag] = [] 

    model_config = ConfigDict(from_attributes=True) 


class UserBase(BaseModel):
    username: str
    email: str
    role: str

class UserCreate(UserBase):
    password: str
    role: str

class User(UserBase):
    id: int
    registration_date: datetime

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: models.UserRole = models.UserRole.CANDIDATE

class UserLogin(BaseModel):
    email: EmailStr
    password: str


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

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)