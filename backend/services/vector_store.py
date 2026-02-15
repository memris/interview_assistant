import os
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from backend.config import settings

class VectorStoreService:
    def __init__(self):
        # локальная модель эмбеддингов тк с гигачат не получилось
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        self.vector_db = Chroma(
            persist_directory=settings.VECTOR_DB_DIR,
            embedding_function=self.embeddings,
            collection_name="knowledge_base"
        )

    def add_documents(self, documents, source_id: int):
        for doc in documents:
            doc.metadata["source_id"] = source_id
        self.vector_db.add_documents(documents)

    def search(self, query: str, k: int = 4):
        return self.vector_db.similarity_search(query, k=k)

vector_store_service = VectorStoreService()