from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_tag():
    response = client.post("/api/tags/", json={"tag_name": "testtag"})
    assert response.status_code == 200
    assert response.json()["tag_name"] == "testtag"


def test_read_tags():
    response = client.get("/api/tags/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_tag():
    response = client.get("/api/tags/1")
    assert response.status_code == 200 or response.status_code == 404


def test_update_tag():
    response = client.put("/api/tags/1", json={"tag_name": "updatedtag"})
    assert response.status_code == 200 or response.status_code == 404


def test_delete_tag():
    response = client.delete("/api/tags/1")
    assert response.status_code == 204 or response.status_code == 404
