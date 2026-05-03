import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Topic } from '../../types';
import './DashboardPage.scss';

const DashboardPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const[selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get<Topic[]>('http://127.0.0.1:8000/api/topics/');
        setTopics(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
      }
    };
    fetchTopics();
  },[]);

  const handleStartSession = async () => {
    if (!selectedTopic) return;
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/interview-sessions/', {
        topic_id: selectedTopic,
        user_id: 1 // TODO: Заменить на ID текущего пользователя из токена
      });
      navigate(`/interview/${response.data.id}`);
    } catch (error) {
      console.error("Не удалось создать сессию: ", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Выберите тему для подготовки</h1>
        <p>Система сгенерирует вопросы на основе вашей базы знаний</p>
      </div>

      <div className="topics-grid">
        {topics.map(topic => (
          <div 
            key={topic.id} 
            className={`topic-card ${selectedTopic === topic.id ? 'active' : ''}`}
            onClick={() => setSelectedTopic(topic.id)}
          >
            <h3>{topic.topic_name}</h3>
            <span>База знаний подключена</span>
          </div>
        ))}
      </div>

      <button className="upload-btn" onClick={() => navigate('/sources')}>
        + Загрузить документ (PDF, TXT)
      </button>

      <button 
        className="start-btn" 
        disabled={!selectedTopic}
        onClick={handleStartSession}
      >
        Начать сессию
      </button>

      {/* Блок статистики (пока статичный) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">14</div>
          <div className="stat-label">Сессий пройдено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">7.4</div>
          <div className="stat-label">Средний балл</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Загружено документов</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;