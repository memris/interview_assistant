from langchain_gigachat import GigaChat
from backend.services.vector_store import vector_store_service
from backend.config import settings
from langchain.schema import HumanMessage, SystemMessage

class RAGService:
    def __init__(self):
        try:
            self.llm = GigaChat(
                credentials=settings.GIGACHAT_CREDENTIALS,
                scope="GIGACHAT_API_PERS",
                verify_ssl_certs=False
            )
        except Exception as e:
            print(f"Ошибка инициализации GigaChat: {e}")
            self.llm = None

    async def generate_question(self, topic_id: int):
        # достаем текст из пдф
        docs = vector_store_service.search(query="основные понятия", k=2)
        
        if not docs:
            return "Вопрос: Расскажите об общих принципах темы. Эталонный ответ: Информация в базе знаний не найдена."

        context = "\n\n".join([d.page_content for d in docs])
        
        # попытка спросить ИИ
        if self.llm:
            try:
                messages = [
                    SystemMessage(content="Ты — интервьюер. Придумай вопрос по контексту."),
                    HumanMessage(content=f"Контекст:\n{context}\n\nФормат: Вопрос: [текст] Эталонный ответ: [текст]")
                ]
                response = self.llm.invoke(messages)
                return response.content
            except Exception as e:
                print(f"GigaChat выдал ошибку (возможно 402/401): {e}")

        
        # запасной враиант если гигачат не сработает
        snippet = docs[0].page_content[:150]
        return f"Вопрос: Основываясь на материале '{snippet}...', объясните суть данного утверждения? Эталонный ответ: Ответ содержится в загруженной документации."

rag_service = RAGService()