import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Topic } from '../types';

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);


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

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Загрузка тем...</div>;
  }

  return (
    <div>
      <h1>Темы обучения</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
          </tr>
        </thead>
        <tbody>
          {topics.map(topic => (
            <tr key={topic.id}>
              <td>{topic.id}</td>
              <td>{topic.topic_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopicsPage;