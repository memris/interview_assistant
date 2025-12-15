from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# --- Настройка подключения к базе данных ---

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# --- Функция-зависимость для получения сессии БД ---

def get_db():
    """
    Эта функция-зависимость (dependency) для FastAPI создает сессию БД
    для каждого запроса и гарантированно закрывает ее после выполнения.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()