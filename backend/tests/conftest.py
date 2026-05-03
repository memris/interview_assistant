import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import MagicMock, patch

from backend import database, models
from backend.database import get_db

# Mock vector_store_service before importing app
with patch("backend.services.vector_store.VectorStoreService") as mock_vector_class, \
     patch("backend.services.rag_service.RAGService") as mock_rag_class:
    mock_vector_instance = MagicMock()
    mock_rag_instance = MagicMock()
    mock_vector_class.return_value = mock_vector_instance
    mock_rag_class.return_value = mock_rag_instance
    from backend.main import app

os.environ.setdefault("PROJECT_NAME", "test-app")
os.environ.setdefault("PROJECT_VERSION", "0.0.0")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_DB", "test")


@pytest.fixture(scope="function")
def engine():
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    models.Base.metadata.create_all(bind=test_engine)
    return test_engine


@pytest.fixture(scope="function")
def db_session(engine):
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(autouse=True)
def patch_session_local(monkeypatch, engine):
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    monkeypatch.setattr(database, "SessionLocal", TestSessionLocal)
    yield


@pytest.fixture(autouse=True)
def override_get_db(engine):
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def _override_get_db():
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()
