import asyncio
from backend.services.rag_service import rag_service
from unittest.mock import patch


def test_generate_question():
    with patch('backend.services.rag_service.vector_store_service.search', return_value=[]):
        result = asyncio.run(rag_service.generate_question(1))
        assert "Вопрос:" in result
        assert "Эталонный ответ:" in result
