from pydantic_settings import BaseSettings
from pydantic import Field, ConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Класс для хранения всех настроек приложения.
    Настройки загружаются из переменных окружения и .env файла.
    """
    
    # --- Настройки проекта ---
    PROJECT_NAME: str = Field(...)
    PROJECT_VERSION: str = Field(...)
    
    # --- Настройки базы данных PostgreSQL ---
    POSTGRES_USER: str = Field(...)
    POSTGRES_PASSWORD: str = Field(...)
    POSTGRES_SERVER: str = Field(...)
    POSTGRES_PORT: int = Field(...)
    POSTGRES_DB: str = Field(...)

    # llm
    GIGACHAT_CREDENTIALS: Optional[str] = None 

    # rag
    VECTOR_DB_DIR: str = "vector_db_data" # папка, где chromadb будет хранить свои файлы
    CHUNK_SIZE: int = 1000                # размер кусочка текста (в символах)
    CHUNK_OVERLAP: int = 100              # нахлест между кусочками (чтобы не терять контекст)

    SECRET_KEY: str = "IkySpqz3G57XRJguHvCcAztiDO70J8SF" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 
    
    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

settings = Settings()