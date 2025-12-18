const form = document.getElementById('add-source-form');
const submitButton = form.querySelector('button[type="submit"]');
const sourceIdInput = document.getElementById('source-id');


async function initializePage() {
    await populateFormOptions();
    await fetchAndDisplaySources();
}


async function populateFormOptions() {
    try {
        const [topicsResponse, tagsResponse] = await Promise.all([
            fetch('/api/topics/'),
            fetch('/api/tags/')
        ]);
        if (!topicsResponse.ok || !tagsResponse.ok) throw new Error('Failed to load form options');
        
        const topics = await topicsResponse.json();
        const tags = await tagsResponse.json();

        const topicSelect = document.getElementById('source-topic');
        topicSelect.innerHTML = '<option value="">-- Выберите тему --</option>';
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.topic_name;
            topicSelect.appendChild(option);
        });

        const tagsContainer = document.getElementById('source-tags-container');
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const label = document.createElement('label');
            label.style.display = 'inline-block';
            label.style.marginRight = '10px';
            label.innerHTML = `<input type="checkbox" name="tags" value="${tag.id}"> ${tag.tag_name}`;
            tagsContainer.appendChild(label);
        });
    } catch (error) {
        console.error('Ошибка при загрузке опций для формы:', error);
    }
}

async function fetchAndDisplaySources() {
    try {
        const response = await fetch('/api/knowledge_sources/');
        if (!response.ok) throw new Error('Network response was not ok');
        const sources = await response.json();

        const tableBody = document.querySelector('#sources-table tbody');
        tableBody.innerHTML = '';

        sources.forEach(source => {
            const row = document.createElement('tr');
            const tagsString = source.tags.map(tag => tag.tag_name).join(', ');

            row.dataset.source = JSON.stringify(source);

            row.innerHTML = `
                <td>${source.id}</td>
                <td>${source.title}</td>
                <td><a href="${source.source_url || '#'}" target="_blank">Ссылка</a></td>
                <td>${source.topic ? source.topic.topic_name : 'N/A'}</td>
                <td>${tagsString}</td>
                <td>
                    <button class="edit-btn" data-id="${source.id}">✏️ Изменить</button>
                    <button class="delete-btn" data-id="${source.id}">🗑️ Удалить</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке источников:', error);
    }
}


async function handleFormSubmit(event) {
    event.preventDefault();

    const sourceId = sourceIdInput.value; // Получаем ID из скрытого поля
    const isEditing = !!sourceId; // Если ID есть, значит, это режим редактирования

    const title = document.getElementById('source-title').value;
    const url = document.getElementById('source-url').value;
    const content = document.getElementById('source-content').value;
    const topicId = document.getElementById('source-topic').value;
    const selectedTags = Array.from(document.querySelectorAll('#source-tags-container input:checked')).map(cb => parseInt(cb.value));

    if (!topicId) {
        alert("Пожалуйста, выберите тему.");
        return;
    }

    const sourceData = {
        title: title,
        source_url: url,
        content: content,
        topic_id: parseInt(topicId),
        tags: selectedTags
    };

    const urlEndpoint = isEditing ? `/api/knowledge_sources/${sourceId}` : '/api/knowledge_sources/';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(urlEndpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sourceData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Ошибка: ${errorData.detail}`);
        }

        resetForm();
        await fetchAndDisplaySources();
    } catch (error) {
        console.error('Ошибка:', error);
        alert(error.message);
    }
}

/**
 * Обрабатывает удаление источника.
 */
async function handleDelete(sourceId) {
    if (!confirm(`Вы уверены, что хотите удалить источник с ID ${sourceId}?`)) return;

    try {
        const response = await fetch(`/api/knowledge_sources/${sourceId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ошибка при удалении источника');
        await fetchAndDisplaySources();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

/**
 * Заполняет форму данными для редактирования.
 */
function populateFormForEdit(sourceId) {
    // Находим строку таблицы с нужным ID
    const row = document.querySelector(`button[data-id='${sourceId}']`).closest('tr');
    // Получаем полный объект source из data-атрибута
    const source = JSON.parse(row.dataset.source);

    // Заполняем все поля формы
    sourceIdInput.value = source.id;
    document.getElementById('source-title').value = source.title;
    document.getElementById('source-url').value = source.source_url || '';
    document.getElementById('source-content').value = source.content;
    document.getElementById('source-topic').value = source.topic.id;

    // Сбрасываем все чекбоксы тегов
    document.querySelectorAll('#source-tags-container input').forEach(cb => cb.checked = false);
    // Отмечаем те, которые есть у источника
    const sourceTagIds = source.tags.map(tag => tag.id);
    document.querySelectorAll('#source-tags-container input').forEach(cb => {
        if (sourceTagIds.includes(parseInt(cb.value))) {
            cb.checked = true;
        }
    });

    // Меняем текст кнопки и прокручиваем к форме
    submitButton.textContent = 'Сохранить изменения';
    form.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Сбрасывает форму в исходное состояние (для создания).
 */
function resetForm() {
    form.reset();
    sourceIdInput.value = '';
    submitButton.textContent = 'Добавить';
}


// --- "Слушатели" событий ---

document.addEventListener('DOMContentLoaded', initializePage);
form.addEventListener('submit', handleFormSubmit);

document.getElementById('sources-table').addEventListener('click', function(event) {
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
        const sourceId = deleteButton.dataset.id;
        handleDelete(sourceId);
        return;
    }
    
    const editButton = event.target.closest('.edit-btn');
    if (editButton) {
        const sourceId = editButton.dataset.id;
        populateFormForEdit(sourceId);
        return;
    }
});