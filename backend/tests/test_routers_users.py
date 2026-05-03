from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_create_user():
    response = client.post("/api/auth/", json={"username": "testuser", "email": "test@example.com", "password": "pass", "role": "candidate"})
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_read_users():
    response = client.get("/api/auth/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_user():
    response = client.get("/api/auth/1")
    assert response.status_code == 200 or response.status_code == 404


def test_register_user():
    response = client.post("/api/auth/register", json={"username": "newuser", "email": "newuser@example.com", "password": "pass", "role": "candidate"})
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@example.com"


def test_login_user():
    client.post("/api/auth/register", json={"username": "loginuser", "email": "login@example.com", "password": "pass", "role": "candidate"})
    response = client.post("/api/auth/login", json={"email": "login@example.com", "password": "pass"})
    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
