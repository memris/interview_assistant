import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import axios from 'axios';
import SourcesPage from '../pages/SourcesPage';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

describe('SourcesPage component', () => {
  it('renders loading state', () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<SourcesPage />);
    expect(screen.getByText(/Загрузка источников/i)).toBeInTheDocument();
  });

  it('renders sources after loading', async () => {
    const mockSources = [
      { id: 1, title: 'Source 1', content: 'Content 1', status: 'completed' },
      { id: 2, title: 'Source 2', content: 'Content 2', status: 'pending' },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockSources });
    render(<SourcesPage />);
    await waitFor(() => {
      expect(screen.getByText('Source 1')).toBeInTheDocument();
      expect(screen.getByText('Source 2')).toBeInTheDocument();
    });
  });

  it('renders empty state', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<SourcesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Источники не найдены/i)).toBeInTheDocument();
    });
  });
});
