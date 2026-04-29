import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage/LandingPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LandingPage component', () => {
  it('renders hero section', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/Подготовься к собеседованию с ИИ/i)).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/Войти/i)).toBeInTheDocument();
  });

  it('opens modal on login click', () => {
    renderWithRouter(<LandingPage />);
    fireEvent.click(screen.getByText(/Войти/i));
    expect(screen.getByText(/Вход в систему/i)).toBeInTheDocument();
  });

  it('renders topic cards', () => {
    renderWithRouter(<LandingPage />);
    expect(screen.getByText(/Frontend/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Science/i)).toBeInTheDocument();
  });

  it('navigates on topic button click', () => {
    mockNavigate.mockReset();
    renderWithRouter(<LandingPage />);
    const buttons = screen.getAllByText(/Выбрать/i);
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalled();
  });
});
