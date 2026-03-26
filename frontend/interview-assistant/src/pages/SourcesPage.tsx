import { useEffect, useState } from 'react';
import axios from 'axios';
import { type KnowledgeSource, SourceStatus } from '../types';

const SourcesPage = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const fetchSources = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<KnowledgeSource[]>('http://127.0.0.1:8000/api/knowledge_sources/');
        setSources(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSources();
  }, []);

  const renderStatus = (status: string) => {
    switch (status) {
      case SourceStatus.COMPLETED: return 'Готов';
      case SourceStatus.PROCESSING: return 'В процессе';
      case SourceStatus.PENDING: return 'В очереди';
      case SourceStatus.FAILED: return 'Ошибка';
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Загрузка источников...</div>;
  }


  return (
    <div style={{ padding: '20px' }}>
      <h1>Управление источниками знаний (RAG)</h1>
      
      {sources.length === 0 ? (
        <p>Источники не найдены. Загрузите PDF-файл в базу знаний.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Название</th>
              <th style={{ padding: '10px' }}>Тема</th>
              <th style={{ padding: '10px' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {sources.map(source => (
              <tr key={source.id}>
                <td style={{ padding: '10px', textAlign: 'center' }}>{source.id}</td>
                <td style={{ padding: '10px' }}>{source.title}</td>
                <td style={{ padding: '10px' }}>{source.topic?.topic_name || 'N/A'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {renderStatus(source.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/*TODO: форма загрузки файлов */}
      <button style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        + Добавить новый файл
      </button>
    </div>
  );
};


export default SourcesPage;