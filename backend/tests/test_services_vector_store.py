from backend.services.vector_store import vector_store_service
from unittest.mock import patch


def test_search():
    with patch.object(vector_store_service.vector_db, 'similarity_search', return_value=[]):
        results = vector_store_service.search("test query")
        assert results == []
