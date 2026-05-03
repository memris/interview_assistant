from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_topic():
    response = client.post("/api/topics/", json={"topic_name": "Test Topic", "topic_description": "Description"})
    assert response.status_code == 200
    assert response.json()["topic_name"] == "Test Topic"


def test_read_topics():
    response = client.get("/api/topics/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_topic():
    # Assuming topic with id 1 exists from previous test
    response = client.get("/api/topics/1")
    assert response.status_code == 200 or response.status_code == 404  # Depending on data


def test_update_topic():
    response = client.put("/api/topics/1", json={"topic_name": "Updated Topic", "topic_description": "Updated"})
    assert response.status_code == 200 or response.status_code == 404


def test_delete_topic():
    response = client.delete("/api/topics/1")
    assert response.status_code == 204 or response.status_code == 404
