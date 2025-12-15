from fastapi import FastAPI
from .config import settings
from .routers import topics, users, tags, knowledge_sources, interview_sessions


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

app.include_router(topics.router)
app.include_router(users.router)
app.include_router(tags.router)
app.include_router(knowledge_sources.router)
app.include_router(interview_sessions.router)

@app.get("/", tags=["Root"])
def read_root():
    """
    Корневой эндпоинт для проверки работоспособности API.
    """
    return {"message": f"Welcome to {settings.PROJECT_NAME} API v{settings.PROJECT_VERSION}"}