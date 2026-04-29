import React, { useState } from 'react';
import { User, ShieldCheck, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import './LoginForm.scss';

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [role, setRole] = useState<'candidate' | 'interviewer'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

// <HTMLFormElement>, чтобы уточнить, что это событие формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
        email: email,
        password: password
      });

      const { access_token, role: userRole, username } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('username', username);

      alert(`Успешный вход! Добро пожаловать, ${username}`);
      
      if (onClose) onClose();
      
      if (userRole === 'interviewer') {
        window.location.href = '/sources';
      } else {
        window.location.href = '/topics';
      }

    } catch (err) {
      // вместо (err: any) исп приведение к типу AxiosError
      const axiosError = err as AxiosError<{ detail: string }>;
      
      if (axiosError.response && axiosError.response.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка сервера. Попробуйте позже.');
      }
      console.error("Login error:", axiosError);
    }
  };

  return (
    <div className="login-form-card">
      {onClose && (
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      )}
      
      <h2>Вход в систему</h2>
      <p className="subtitle">Выберите вашу роль и введите данные</p>

      {/* вывод ошибки */}
      {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

      <div className="role-selector">
        <button 
          type="button"
          className={`role-btn ${role === 'candidate' ? 'active' : ''}`}
          onClick={() => setRole('candidate')}
        >
          <User size={20} />
          <span>Кандидат</span>
        </button>
        <button 
          type="button"
          className={`role-btn ${role === 'interviewer' ? 'active' : ''}`}
          onClick={() => setRole('interviewer')}
        >
          <ShieldCheck size={20} />
          <span>Интервьюер</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <label>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com" 
            required 
          />
        </div>

        <div className="input-field">
          <label>Пароль</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            required 
          />
        </div>

        <button type="submit" className="submit-login-btn">
          Войти как {role === 'candidate' ? 'Кандидат' : 'Интервьюер'}
        </button>
      </form>
      
      <div className="form-footer">
        <span>Нет аккаунта? <a href="#">Зарегистрироваться</a></span>
      </div>
    </div>
  );
};

export default LoginForm;