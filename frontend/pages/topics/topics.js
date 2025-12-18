
async function fetchAndDisplayTopics() {
    try {
        const response = await fetch('/api/topics/');
        if (!response.ok) throw new Error('Network response was not ok');
        const topics = await response.json();

        const tableBody = document.querySelector('#topics-table tbody');
        tableBody.innerHTML = '';

        topics.forEach(topic => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${topic.id}</td>
                <td>${topic.topic_name}</td>
                <td>${topic.topic_description || ''}</td>
                <td>
                    <button class="edit-btn" data-id="${topic.id}">✏️ Изменить</button>
                    <button class="delete-btn" data-id="${topic.id}">🗑️ Удалить</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Ошибка при загрузке тем:', error);
    }
}

async function addTopic(event) {
    event.preventDefault();

    const topicName = document.getElementById('topic-name').value;
    const topicDescription = document.getElementById('topic-description').value;

    try {
        const response = await fetch('/api/topics/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic_name: topicName,
                topic_description: topicDescription,
            }),
        });

        if (!response.ok) {
            throw new Error('Ошибка при добавлении темы');
        }

        document.getElementById('add-topic-form').reset();

        await fetchAndDisplayTopics();

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function handleDelete(topicId) {
    if (!confirm(`Вы уверены, что хотите удалить тему с ID ${topicId}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/topics/${topicId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении темы');
        }
        
        await fetchAndDisplayTopics();

    } catch (error) {
        console.error('Ошибка:', error);
    }
}


function handleEdit(topicId, currentName, currentDescription) {

    const newName = prompt("Введите новое название темы:", currentName);
    if (newName === null || newName.trim() === '') return; 

    const newDescription = prompt("Введите новое описание:", currentDescription || '');
    if (newDescription === null) return; 

    updateTopic(topicId, newName, newDescription);
}

async function updateTopic(topicId, newName, newDescription) {
    try {
        const response = await fetch(`/api/topics/${topicId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic_name: newName,
                topic_description: newDescription,
            }),
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при обновлении темы');
        }

        await fetchAndDisplayTopics();

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayTopics);

document.getElementById('add-topic-form').addEventListener('submit', addTopic);

document.getElementById('topics-table').addEventListener('click', function(event) {
    const target = event.target;
    
    if (target.classList.contains('delete-btn')) {
        const topicId = target.dataset.id; 
        handleDelete(topicId);
    }
    
    if (target.classList.contains('edit-btn')) {
        const topicId = target.dataset.id;
        const row = target.closest('tr');
        const currentName = row.cells[1].textContent;
        const currentDescription = row.cells[2].textContent;
        handleEdit(topicId, currentName, currentDescription);
    }
});