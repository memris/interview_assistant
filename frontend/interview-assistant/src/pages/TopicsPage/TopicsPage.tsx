import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { Topic } from '../../types';
import './TopicsPage.scss'; 

const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Topic[]>('http://127.0.0.1:8000/api/topics/');
        setTopics(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleSelectTopic = async (topicId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Пожалуйста, сначала войдите в систему");
        navigate('/'); // редирект если нет токена
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // создание сессии в ьд
      const sessionRes = await axios.post('http://127.0.0.1:8000/api/interview-sessions/', {
        topic_id: topicId,
        user_id: 1 // позже нужно брать реальный ID из декодированного токена
      }, config);
      
      // перезод в интерфейс чата с нужным id сессии
      navigate(`/interview/${sessionRes.data.id}`);
    } catch (error) {
      console.error("Ошибка при создании сессии:", error);
      alert("Не удалось начать сессию. Проверьте соединение с сервером.");
    }
  };

  if (isLoading) return <div className="topics-page-loader">Загрузка направлений...</div>;

  return (
    <div className="topics-page-container">
      <h1>Выберите направление</h1>
      
      <div className="cards-wrapper">
        {topics.map(topic => {
          // разбиение описание (строку через запятую) на массив элементов
          const skills = topic.topic_description ? topic.topic_description.split(',') : [];

          return (
            <div key={topic.id} className="topic-card">
              <h2>{topic.topic_name}</h2>
              
              <ul className="skills-list">
                {skills.map((skill, index) => (
                  <li key={index}>{skill.trim()}</li>
                ))}
              </ul>

              <button 
                className="select-btn" 
                onClick={() => handleSelectTopic(topic.id)}
              >
                Выбрать
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsPage;