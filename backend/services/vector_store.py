import os
from langchain_qdrant import QdrantVectorStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from backend.config import settings

class VectorStoreService:
    def __init__(self):
        # локальная модель эмбеддингов тк с гигачат не получилось
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Инициализация клиента Qdrant с локальным хранилищем
        self.client = QdrantClient(path=settings.VECTOR_DB_PATH)
        
        # Параметры коллекции
        collection_name = "knowledge_base"
        embedding_dimension = 384  # размерность all-MiniLM-L6-v2
        
        # Проверка, существует ли коллекция, если нет - создаем
        try:
            self.client.get_collection(collection_name)
        except Exception:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=embedding_dimension,
                    distance=Distance.COSINE
                )
            )
        
        self.vector_db = QdrantVectorStore.from_existing_collection(
            embedding=self.embeddings,
            collection_name=collection_name,
            client=self.client
        )

    def add_documents(self, documents, source_id: int):
        for doc in documents:
            doc.metadata["source_id"] = source_id
        self.vector_db.add_documents(documents)

    def search(self, query: str, k: int = 4):
        return self.vector_db.similarity_search(query, k=k)

vector_store_service = VectorStoreService()