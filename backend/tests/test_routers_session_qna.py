from fastapi.testclient import TestClient
from backend.main import app
from unittest.mock import AsyncMock, patch

client = TestClient(app)


def test_create_interview_session_question_generation():
    user_resp = client.post("/api/auth/", json={"username": "sessionuser", "email": "session@example.com", "password": "pass", "role": "candidate"})
    topic_resp = client.post("/api/topics/", json={"topic_name": "Interview Topic"})
    session_resp = client.post("/api/interview-sessions/", json={"user_id": user_resp.json()["id"], "topic_id": topic_resp.json()["id"]})
    session_id = session_resp.json()["id"]

    async_mock = AsyncMock(return_value="Вопрос: Тестовый вопрос. Эталонный ответ: Тестовый ответ.")
    with patch('backend.routers.interview_sessions.rag_service.generate_question', new=async_mock):
        response = client.post(f"/api/interview-sessions/{session_id}/generate-question")
        assert response.status_code == 200
        assert "question_text" in response.json()


def test_create_interview_session_invalid_topic():
    user_resp = client.post("/api/auth/", json={"username": "invalidsessionuser", "email": "invalidsession@example.com", "password": "pass", "role": "candidate"})
    user_id = user_resp.json()["id"]
    response = client.post("/api/interview-sessions/", json={"user_id": user_id, "topic_id": 999})
    assert response.status_code == 404
