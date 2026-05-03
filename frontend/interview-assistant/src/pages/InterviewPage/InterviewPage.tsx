import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterviewPage.scss';

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Для верстки пока используем захардкоженные данные (как на макете)
  // Позже сюда будут попадать реальные данные из БД
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      question: "Объясните разницу между asyncio.gather() и asyncio.wait() в Python 3.12. В каких случаях предпочтительнее использовать каждый из них?",
      userAnswer: "asyncio.gather() запускает корутины параллельно и возвращает список результатов в том же порядке. asyncio.wait() даёт больше контроля — можно обрабатывать задачи по мере завершения через done и pending множества.",
      score: 8,
      feedback: "Верно описана основная разница. Стоит добавить: gather() отменяет все задачи при исключении в одной (если return_exceptions=False), тогда как wait() позволяет продолжить выполнение остальных. Также не упомянут параметр timeout в asyncio.wait()."
    }
  ]);

  // Текущий вопрос, на который пользователь должен ответить сейчас
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 2,
    text: "Расскажите, как реализована синхронизация потоков при доступе к общим данным в FastAPI?"
  });

  const handleEndSession = () => {
    if (confirm("Вы уверены, что хотите завершить сессию?")) {
      navigate('/topics'); // Возвращаем на дашборд
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    // ВРЕМЕННАЯ ЛОГИКА ДЛЯ ВЕРСТКИ (имитация загрузки)
    setIsLoading(true);
    setTimeout(() => {
      setChatHistory([
        ...chatHistory, 
        {
          id: currentQuestion.id,
          question: currentQuestion.text,
          userAnswer: answer,
          score: 7,
          feedback: "Хороший ответ, но можно было бы упомянуть использование мьютексов."
        }
      ]);
      setAnswer('');
      setIsLoading(false);
      // Имитация получения следующего вопроса
      setCurrentQuestion({ id: 3, text: "Что такое Dependency Injection и как оно работает в FastAPI?" });
    }, 1500);

    /* --- РЕАЛЬНАЯ ЛОГИКА (раскомментируй позже) ---
    try {
      setIsLoading(true);
      
      // 1. Отправляем ответ пользователя на оценку
      const evalResponse = await axios.post(`http://127.0.0.1:8000/api/interview-sessions/${sessionId}/submit-answer`, {
        qna_id: currentQuestion.id,
        user_answer: answer
      });

      // Добавляем в историю оцененный ответ
      setChatHistory([...chatHistory, evalResponse.data]);
      setAnswer('');

      // 2. Сразу запрашиваем следующий вопрос
      const nextQuestionRes = await axios.post(`http://127.0.0.1:8000/api/interview-sessions/${sessionId}/generate-question`);
      setCurrentQuestion({
        id: nextQuestionRes.data.id,
        text: nextQuestionRes.data.question_text
      });

    } catch (error) {
      console.error("Ошибка сети:", error);
      alert("Не удалось отправить ответ.");
    } finally {
      setIsLoading(false);
    }
    --------------------------------------------- */
  };

  return (
    <div className="interview-container">
      {/* Шапка */}
      <div className="interview-header">
        <div className="left">
          <span className="badge">Python</span>
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
            {/* Вопрос ИИ */}
            <div className="message ai-question">
              <div className="avatar">AI</div>
              <div className="content">
                <div className="sender-name">Ассистент</div>
                <div className="text">{item.question}</div>
              </div>
            </div>

            {/* Ответ пользователя */}
            <div className="message user-answer">
              <div className="avatar">AM</div>
              <div className="content">
                <div className="sender-name">Вы</div>
                <div className="text">{item.userAnswer}</div>
              </div>
            </div>

            {/* Оценка ИИ */}
            <div className="message ai-feedback">
              <div className="avatar">AI</div>
              <div className="content">
                <div className="sender-name">Оценка ответа</div>
                <div className="feedback-box">
                  <div>
                    <span className="score">{item.score} / 10</span>
                    <span style={{ fontWeight: 600, color: '#065f46' }}>
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

        {/* Текущий (новый) вопрос от ИИ, на который нужно ответить */}
        {currentQuestion && (
          <div className="message ai-question">
            <div className="avatar">AI</div>
            <div className="content">
              <div className="sender-name">Ассистент</div>
              <div className="text">{currentQuestion.text}</div>
            </div>
          </div>
        )}
      </div>

      {/* Поле ввода ответа */}
      <div className="input-area">
        <textarea 
          placeholder="Введите ваш ответ..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isLoading}
        ></textarea>
        
        <div className="input-footer">
          <div className="progress-bar">
            {/* Заполнение прогресс-бара */}
            <div className="fill" style={{ width: `${(chatHistory.length + 1) * 10}%` }}></div>
          </div>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', marginRight: 'auto', marginLeft: '1rem' }}>
            {chatHistory.length + 1} / 10 вопросов
          </span>
          <button onClick={handleSubmitAnswer} disabled={isLoading || !answer.trim()}>
            {isLoading ? 'Отправка...' : 'Ответить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;