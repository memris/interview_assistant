import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from backend.services.vector_store import vector_store_service
from backend.config import settings
from sqlalchemy.orm import Session
from backend.models import KnowledgeSource, SourceStatus

class IndexingService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            add_start_index=True,
        )

    async def process_source(self, db: Session, source_id: int, file_path: str):
        """
        Процесс: Загрузка файла -> Извлечение текста -> Сохранение в БД -> Индексация в ChromaDB
        """
        # получение объекта из БД
        source = db.query(KnowledgeSource).filter(KnowledgeSource.id == source_id).first()
        if not source:
            return

        try:
            source.status = SourceStatus.PROCESSING
            db.commit()

            # выбор загрузчика
            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            else:
                loader = TextLoader(file_path, encoding='utf-8')

            # чтение документа
            documents = loader.load()
            
            # сохр извлеченный текст обратно в БД (поле content)
            full_text = "\n".join([doc.page_content for doc in documents])
            source.content = full_text
            db.commit()

            # режем на чанки для векторной базы
            chunks = self.text_splitter.split_documents(documents)

            # доб метаданные для фильтрации
            for chunk in chunks:
                chunk.metadata["topic_id"] = source.topic_id
                chunk.metadata["source_id"] = source.id

            # отпр в ChromaDB (эмбеддинги через GigaChat)
            vector_store_service.add_documents(chunks, source_id=source.id)

            source.status = SourceStatus.COMPLETED
            db.commit()

        except Exception as e:
            print(f"Ошибка индексации источника {source_id}: {e}")
            source.status = SourceStatus.FAILED
            db.commit()
        finally:
            # опционально удалить временный файл после индексации
            # if os.path.exists(file_path): os.remove(file_path)
            pass

indexing_service = IndexingService()