import { vi } from 'vitest';
vi.mock('lucide-react', () => ({
  Cloud: () => null,
  User: () => null,
  ShieldCheck: () => null,
  X: () => null,
}));

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App component', () => {
  it('renders navigation links', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Главная/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Темы/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Источники/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Собеседование/i })).toBeInTheDocument();
  });
});
