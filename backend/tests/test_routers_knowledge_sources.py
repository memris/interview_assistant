from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_knowledge_source_file_upload():
    topic_resp = client.post("/api/topics/", json={"topic_name": "Test Topic"})
    topic_id = topic_resp.json()["id"]

    response = client.post(
        "/api/knowledge_sources/",
        data={"title": "Test Source", "topic_id": str(topic_id)},
        files={"file": ("test.txt", b"Hello world", "text/plain")}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Test Source"


def test_read_knowledge_sources():
    response = client.get("/api/knowledge_sources/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_knowledge_source():
    response = client.get("/api/knowledge_sources/1")
    assert response.status_code == 200 or response.status_code == 404
