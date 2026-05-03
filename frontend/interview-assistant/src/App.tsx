import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TopicsPage from './pages/TopicsPage';
import SourcesPage from './pages/SourcesPage';
import LandingPage from './pages/LandingPage/LandingPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import InterviewPage from './pages/InterviewPage/InterviewPage';

function App() {
  return (
    <Router>
      {/* Навигация */}
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '20px' }}>
        <Link to="/">Главная</Link>
        <Link to="/topics">Темы</Link>
        <Link to="/sources">Источники</Link>
        <Link to="/interview">Собеседование</Link>
      </nav>

      {/* Роутинг */}
      <Routes>
        {/* Главная страница */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Страница тем */}
        <Route path="/topics" element={<TopicsPage />} />
        
        {/* Страница источников */}
        <Route path="/sources" element={<SourcesPage />} />
        
        {/* Заглушка для интервью */}
        <Route path="/interview" element={<div style={{padding: '20px'}}>Страница интервью в разработке</div>} />
      <Route path="/topics" element={<DashboardPage />} /> 
      <Route path="/interview/:sessionId" element={<InterviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;