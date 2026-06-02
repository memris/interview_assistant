from pydantic_settings import BaseSettings
from pydantic import Field 
from typing import Optional

class Settings(BaseSettings):
    """
    Класс для хранения всех настроек приложения.
    Настройки загружаются из переменных окружения и .env файла.
    """
    
    # --- Настройки проекта ---
    PROJECT_NAME: str = Field(..., env='PROJECT_NAME')
    PROJECT_VERSION: str = Field(..., env='PROJECT_VERSION')
    
    # --- Настройки базы данных PostgreSQL ---
    POSTGRES_USER: str = Field(..., env='POSTGRES_USER')
    POSTGRES_PASSWORD: str = Field(..., env='POSTGRES_PASSWORD')
    POSTGRES_SERVER: str = Field(..., env='POSTGRES_SERVER')
    POSTGRES_PORT: int = Field(..., env='POSTGRES_PORT')
    POSTGRES_DB: str = Field(..., env='POSTGRES_DB')

    # llm
    GIGACHAT_CREDENTIALS: Optional[str] = None 

    # rag
    QDRANT_URL: str = "http://localhost:6333"  # URL for local Qdrant server
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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()