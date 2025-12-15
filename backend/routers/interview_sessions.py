from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter(
    prefix="/sessions",
    tags=["Interview Sessions"],
)

@router.post("/", response_model=schemas.InterviewSession, summary="Начать новую сессию собеседования")
def create_interview_session(session: schemas.InterviewSessionCreate, db: Session = Depends(get_db)):
    return crud.create_interview_session(db=db, session=session)

@router.get("/user/{user_id}", response_model=List[schemas.InterviewSession], summary="Получить все сессии пользователя")
def read_user_sessions(user_id: int, db: Session = Depends(get_db)):
    sessions = crud.get_interview_sessions_by_user(db, user_id=user_id)
    return sessions

@router.post("/{session_id}/qna", response_model=schemas.SessionQnA, summary="Добавить вопрос-ответ в сессию")
def create_qna_for_session(session_id: int, qna: schemas.SessionQnACreate, db: Session = Depends(get_db)):
    db_session = crud.get_interview_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return crud.create_session_qna(db=db, qna=qna, session_id=session_id)