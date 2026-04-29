import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import axios from 'axios';
import TopicsPage from '../pages/TopicsPage';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

describe('TopicsPage component', () => {
  it('renders loading state', () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<TopicsPage />);
    expect(screen.getByText(/Загрузка тем/i)).toBeInTheDocument();
  });

  it('renders topics after loading', async () => {
    const mockTopics = [
      { id: 1, topic_name: 'Topic 1', topic_description: 'Desc 1' },
      { id: 2, topic_name: 'Topic 2', topic_description: 'Desc 2' },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockTopics });
    render(<TopicsPage />);
    await waitFor(() => {
      expect(screen.getByText('Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Topic 2')).toBeInTheDocument();
    });
  });

  it('renders table headers', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<TopicsPage />);
    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Название')).toBeInTheDocument();
    });
  });
});
