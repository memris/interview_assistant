from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .config import settings
from .routers import topics, users, tags, knowledge_sources, interview_sessions
import os


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

app.include_router(topics.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(tags.router, prefix="/api")
app.include_router(knowledge_sources.router, prefix="/api")
app.include_router(interview_sessions.router, prefix="/api")


current_file_path = os.path.dirname(os.path.realpath(__file__))

frontend_path = os.path.join(current_file_path, "..", "frontend")

app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

@app.get("/", tags=["Root"])
def read_root():
    """
    Корневой эндпоинт для проверки работоспособности API.
    """
    return {"message": f"Welcome to {settings.PROJECT_NAME} API v{settings.PROJECT_VERSION}"}