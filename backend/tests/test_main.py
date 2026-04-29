import os

os.environ.setdefault("PROJECT_NAME", "test-app")
os.environ.setdefault("PROJECT_VERSION", "0.0.0")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_DB", "test")

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "<!DOCTYPE html>" in response.text or "<div" in response.text
