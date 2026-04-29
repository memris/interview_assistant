import os

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend import database, models

os.environ.setdefault("PROJECT_NAME", "test-app")
os.environ.setdefault("PROJECT_VERSION", "0.0.0")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("POSTGRES_DB", "test")


@pytest.fixture(scope="session")
def engine():
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
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
