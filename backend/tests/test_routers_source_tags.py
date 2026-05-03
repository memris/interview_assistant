from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_register_duplicate_email():
    client.post("/api/auth/register", json={"username": "dupuser", "email": "dup@example.com", "password": "pass", "role": "candidate"})
    response = client.post("/api/auth/register", json={"username": "dupuser2", "email": "dup@example.com", "password": "pass", "role": "candidate"})
    assert response.status_code == 400


def test_login_incorrect_credentials():
    client.post("/api/auth/register", json={"username": "wronguser", "email": "wrong@example.com", "password": "pass", "role": "candidate"})
    response = client.post("/api/auth/login", json={"email": "wrong@example.com", "password": "wrong"})
    assert response.status_code == 401
