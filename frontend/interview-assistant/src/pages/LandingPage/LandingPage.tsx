import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react'; 
import LoginForm from '../../components/LoginForm/LoginForm'; 
import './LandingPage.scss';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const topicsRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const scrollToTopics = () => {
    topicsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      <header className="header">
        <div className="logo-section">
          <span className="logo-text">AI Interviewer</span>
          <Cloud size={32} strokeWidth={1.5} color="#94a3b8" />
        </div>

        <nav className="nav-links">
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToTopics(); }}>О проекте</a>
          <a href="https://github.com/memris/interview_assistant">GitHub</a>
        </nav>

       <button className="login-btn" onClick={openModal}>Войти</button>
      </header>
 <div className='hero-section'>
      <main className="hero">
        <h1>Подготовься к собеседованию с ИИ</h1>
        <p>
          Симуляция технического интервью: вопросы с <br />
          моментальной обратной связью
        </p>

        <button 
          className="start-btn" 
          onClick={scrollToTopics}
        >
          Начать тренировку
        </button>
      </main>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          {/* onClick={closeModal} на оверлее позволит закрыть окно при клике вне формы */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* e.stopPropagation() нужен, чтобы клик по самой форме не закрывал её */}
            <LoginForm onClose={closeModal} />
          </div>
        </div>
      )}
</div>
      {/* Секция с выбором направлений */}
      <section ref={topicsRef} id="topics" className="topics-section">
        <h2 className="topics-title">Выберите направление</h2>
        
        <div className="topics-grid">
          {/* Frontend */}
          <div className="topic-card frontend">
            <h3>Frontend</h3>
            <ul>
              <li>JavaScript (ES6+)</li>
              <li>TypeScript</li>
              <li>React</li>
              <li>HTML/CSS</li>
              <li>Web Performance</li>
              <li>Browser API</li>
              <li>State Management</li>
            </ul>
            <button className="topic-btn" onClick={() => navigate('/interview/frontend')}>
              Выбрать
            </button>
          </div>

          {/* Backend */}
          <div className="topic-card backend">
            <h3>Backend</h3>
            <ul>
              <li>Python (Django/FastAPI)</li>
              <li>Go</li>
              <li>Java</li>
              <li>Базы данных (SQL/NoSQL)</li>
              <li>REST & GraphQL API</li>
              <li>System Design</li>
              <li>Docker</li>
            </ul>
            <button className="topic-btn" onClick={() => navigate('/interview/backend')}>
              Выбрать
            </button>
          </div>

          {/* Data Science */}
          <div className="topic-card datascience">
            <h3>Data Science</h3>
            <ul>
              <li>Python</li>
              <li>SQL</li>
              <li>Machine Learning</li>
              <li>Deep Learning</li>
              <li>Статистика и теорема</li>
              <li>A/B тесты</li>
              <li>Pandas & NumPy</li>
            </ul>
            <button className="topic-btn" onClick={() => navigate('/interview/datascience')}>
              Выбрать
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;