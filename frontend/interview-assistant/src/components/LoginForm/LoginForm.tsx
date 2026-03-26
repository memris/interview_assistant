import React, { useState } from 'react';
import { User, ShieldCheck, X } from 'lucide-react';
import './LoginForm.scss';

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [role, setRole] = useState<'candidate' | 'interviewer'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Данные входа:", { email, password, role });
    // TODO: реализовать вызов API бэкенда
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