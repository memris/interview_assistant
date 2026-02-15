from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.rag_service import rag_service

router = APIRouter(prefix="/interview-sessions", tags=["Interview Sessions"])

@router.post("/", response_model=schemas.InterviewSession)
def create_session(session_data: schemas.InterviewSessionCreate, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == session_data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    
    new_session = models.InterviewSession(
        user_id=session_data.user_id,
        topic_id=session_data.topic_id
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/{session_id}/generate-question", response_model=schemas.SessionQnA)
async def get_next_question(session_id: int, db: Session = Depends(get_db)):
    # проверка сессии
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    # попытка генерации
    try:
        print(f"--- Начинаем генерацию для сессии {session_id} ---")
        ai_response = await rag_service.generate_question(topic_id=session.topic_id)
        print(f"--- Получен ответ от сервиса: {ai_response[:50]}... ---")

        # парсинг
        if "Эталонный ответ:" in ai_response:
            parts = ai_response.split("Эталонный ответ:")
            q_text = parts[0].replace("Вопрос:", "").strip()
            a_text = parts[1].strip()
        else:
            q_text = ai_response.strip()
            a_text = "Используйте документацию для сверки."

        # сохранение
        new_qna = models.SessionQnA(
            session_id=session.id,
            question_text=q_text,
            reference_answer_text=a_text
        )
        db.add(new_qna)
        db.commit()
        db.refresh(new_qna)
        
        return new_qna

    except Exception as e:
        db.rollback()
        print(f"КРИТИЧЕСКАЯ ОШИБКА В РОУТЕРЕ: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Генерация не удалась: {str(e)}")