from backend.services.indexing_service import IndexingService


def test_text_splitter():
    service = IndexingService()
    text = "This is a test document. " * 100  # Long text
    chunks = service.text_splitter.split_text(text)
    assert len(chunks) > 1
    assert all(len(chunk) <= 1000 for chunk in chunks)  # Assuming chunk_size
