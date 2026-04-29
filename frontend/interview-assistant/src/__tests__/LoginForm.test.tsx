import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('lucide-react', () => ({
  User: () => null,
  ShieldCheck: () => null,
  X: () => null,
}));

import axios from 'axios';
import LoginForm from '../components/LoginForm/LoginForm';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

describe('LoginForm component', () => {
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  it('renders email, password, and submit button', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText(/mail@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Войти как Кандидат/i })).toBeInTheDocument();
  });

  it('switches role when interviewer button is clicked', () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /Интервьюер/i }));

    expect(screen.getByRole('button', { name: /Войти как Интервьюер/i })).toBeInTheDocument();
  });

  it('shows error when login fails with 401', async () => {
    mockedAxios.post.mockRejectedValue({ response: { status: 401 } });

    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText(/mail@example.com/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Войти как Кандидат/i }));

    await waitFor(() => {
      expect(screen.getByText(/Неверный email или пароль/i)).toBeInTheDocument();
    });
  });
});
