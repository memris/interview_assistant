import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterviewPage.scss';

// описание типа данных для истории чата
interface ChatItem {
  id: number;
  question: string;
  userAnswer: string;
  score: number;
  feedback: string;
}

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{id: number, text: string} | null>(null);

  // Получение первого вопроса при загрузке страницы
  useEffect(() => {
    const startInterview = async () => {
      try {
        setIsLoading(true);
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        
        const res = await axios.post(
          `http://127.0.0.1:8000/api/interview-sessions/${sessionId}/generate-question`,
          {},
          config
        );
        
        // установка полученного вопроса от бэкенда
        setCurrentQuestion({ id: res.data.id, text: res.data.question_text });
      } catch (error) {
        console.error("Ошибка при получении первого вопроса:", error);
      } finally {
        setIsLoading(false);
      }
    };

    startInterview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // выполнится один раз при открытии сессии


  const handleEndSession = () => {
    if (confirm("Вы уверены, что хотите завершить сессию?")) {
      navigate('/topics');
    }
  };

  // реальная отправка ответа
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return;

    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      
      // А) Отправляем ответ пользователя на оценку
      // ВАЖНО: Если бэкенд ждет параметры через URL (query), то нужно передавать через params. 
      // Если через тело запроса (JSON), то как здесь:
      const evalResponse = await axios.post(
        `http://127.0.0.1:8000/api/interview-sessions/${sessionId}/submit-answer?qna_id=${currentQuestion.id}&user_answer=${encodeURIComponent(answer)}`, 
        {},
        config
      );

      // Б) Добавляем текущий диалог в историю, преобразуя данные из бэкенда в наш формат
      const newHistoryItem: ChatItem = {
        id: currentQuestion.id,
        question: currentQuestion.text,
        userAnswer: answer,
        score: evalResponse.data.score || 0, // берем оценку от ИИ
        feedback: evalResponse.data.feedback || "Нет фидбэка" // берем фидбэк от ИИ
      };
      
      setChatHistory(prev => [...prev, newHistoryItem]);
      setAnswer(''); // Очищаем поле ввода

      // В) Запрашиваем следующий вопрос
      const nextQuestionRes = await axios.post(
        `http://127.0.0.1:8000/api/interview-sessions/${sessionId}/generate-question`,
        {}, 
        config 
      );

      // Обновляем текущий вопрос
      setCurrentQuestion({
        id: nextQuestionRes.data.id,
        text: nextQuestionRes.data.question_text
      });

    } catch (error) {
      console.error("Ошибка сети при отправке ответа:", error);
      alert("Не удалось отправить ответ и получить оценку.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="interview-container">
      {/* Шапка */}
      <div className="interview-header">
        <div className="left">
          <span className="badge">Интервью</span>
          <span className="progress-text">Вопрос {chatHistory.length + 1} из 10</span>
        </div>
        <button className="end-btn" onClick={handleEndSession}>
          Завершить сессию
        </button>
      </div>

      {/* История чата */}
      <div className="chat-history">
        {chatHistory.map((item, index) => (
          <React.Fragment key={index}>
            <div className="message ai-question">
              <div className="avatar">AI</div>
              <div className="content">
                <div className="sender-name">Ассистент</div>
                <div className="text">{item.question}</div>
              </div>
            </div>

            <div className="message user-answer">
              <div className="avatar">AM</div>
              <div className="content">
                <div className="sender-name">Вы</div>
                <div className="text">{item.userAnswer}</div>
              </div>
            </div>

            <div className="message ai-feedback">
              <div className="avatar">AI</div>
              <div className="content">
                <div className="sender-name">Оценка ответа</div>
                <div className="feedback-box">
                  <div>
                    <span className="score">{item.score} / 10</span>
                    <span style={{ fontWeight: 600, color: item.score >= 5 ? '#065f46' : '#991b1b' }}>
                      {item.score >= 8 ? 'Отличный ответ' : item.score >= 5 ? 'Хороший ответ' : 'Нужно повторить'}
                    </span>
                  </div>
                  <div className="text" style={{ marginTop: '0.5rem', color: '#064e3b' }}>
                    {item.feedback}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}

        {/* Текущий (новый) вопрос от ИИ */}
        {currentQuestion && (
          <div className="message ai-question">
            <div className="avatar">AI</div>
            <div className="content">
              <div className="sender-name">Ассистент</div>
              <div className="text">{currentQuestion.text}</div>
            </div>
          </div>
        )}
        
        {/* Индикатор загрузки пока ИИ думает */}
        {isLoading && currentQuestion && chatHistory.length > 0 && (
          <div className="message ai-feedback" style={{ opacity: 0.7 }}>
             <div className="avatar">AI</div>
             <div className="content">Ассистент анализирует ваш ответ...</div>
          </div>
        )}
      </div>

      {/* Поле ввода ответа */}
      <div className="input-area">
        <textarea 
          placeholder="Введите ваш ответ..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isLoading || !currentQuestion}
        ></textarea>
        
        <div className="input-footer">
          <div className="progress-bar">
            <div className="fill" style={{ width: `${(chatHistory.length + 1) * 10}%` }}></div>
          </div>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: 'auto', marginLeft: '1rem' }}>
            {chatHistory.length + 1} / 10 вопросов
          </span>
          <button onClick={handleSubmitAnswer} disabled={isLoading || !answer.trim() || !currentQuestion}>
            {isLoading ? 'Отправка...' : 'Ответить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;