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

        const statusMap = {
            'pending': '⏳ Ожидает',
            'processing': '⚙️ Обработка',
            'completed': '✅ Готов',
            'failed': '❌ Ошибка'
        };

        sources.forEach(source => {
            const row = document.createElement('tr');
            const tagsString = source.tags.map(tag => tag.tag_name).join(', ');
            
            // statusText вычисляем внутри цикла для каждого source
            const statusText = statusMap[source.status] || source.status;

            row.dataset.source = JSON.stringify(source);

            row.innerHTML = `
                <td>${source.id}</td>
                <td>${source.title}</td>
                <td>${statusText}</td> 
                <td><a href="${source.source_url || '#'}" target="_blank">Ссылка</a></td>
                <td>${source.topic ? source.topic.topic_name : 'N/A'}</td>
                <td>${tagsString}</td>
                <td>
                    <button class="edit-btn" data-id="${source.id}">✏️</button>
                    <button class="delete-btn" data-id="${source.id}">🗑️</button>
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

    const sourceId = sourceIdInput.value;
    const isEditing = !!sourceId;

    const title = document.getElementById('source-title').value;
    const topicId = document.getElementById('source-topic').value;
    const fileInput = document.getElementById('source-file'); 
    
    const selectedTags = Array.from(document.querySelectorAll('#source-tags-container input:checked'))
                              .map(cb => cb.value);

    if (!topicId) {
        alert("Пожалуйста, выберите тему.");
        return;
    }

    // исп FormData вместо обычного объекта
    const formData = new FormData();
    formData.append('title', title);
    formData.append('topic_id', topicId);
    
    // если созд новый источник, файл обязателен
    if (!isEditing) {
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        } else {
            alert("Пожалуйста, выберите файл.");
            return;
        }
    }

    selectedTags.forEach(tagId => {
        formData.append('tags', tagId);
    });

    const urlEndpoint = isEditing ? `/api/knowledge_sources/${sourceId}` : '/api/knowledge_sources/';
    const method = isEditing ? 'PUT' : 'POST';

    try {
        console.log("Отправка данных...");

        const response = await fetch(urlEndpoint, {
            method: method,
            // headers с content-type удаляем совсем, 
            // браузер сам поймет, что это FormData и поставит нужный boundary
            body: formData, 
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Ошибка сервера:', errorData);
            throw new Error(`Ошибка: ${JSON.stringify(errorData.detail)}`);
        }

        alert(isEditing ? "Обновлено" : "Источник добавлен и отправляется на индексацию");
        resetForm();
        await fetchAndDisplaySources();
    } catch (error) {
        console.error('Ошибка в handleFormSubmit:', error);
        alert(error.message);
    }
}

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

function populateFormForEdit(sourceId) {
    const row = document.querySelector(`button[data-id='${sourceId}']`).closest('tr');
    const source = JSON.parse(row.dataset.source);
    
    sourceIdInput.value = source.id;
    document.getElementById('source-title').value = source.title;
    document.getElementById('source-url').value = source.source_url || '';
    
    // поле контента у нас теперь readonly и берется из файла, 
    // при редактировании мы обычно меняем только название/теги
    document.getElementById('source-content').value = "Контент загруженного файла (редактирование недоступно)";
    document.getElementById('source-topic').value = source.topic.id;

    // сброс и установка чекбоксов
    document.querySelectorAll('#source-tags-container input').forEach(cb => cb.checked = false);
    const sourceTagIds = source.tags.map(tag => tag.id);
    document.querySelectorAll('#source-tags-container input').forEach(cb => {
        if (sourceTagIds.includes(parseInt(cb.value))) {
            cb.checked = true;
        }
    });

    submitButton.textContent = 'Сохранить изменения';
    form.scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    sourceIdInput.value = '';
    submitButton.textContent = 'Добавить';

    const fileInput = document.getElementById('source-file');
    if (fileInput) fileInput.value = ""; 
}

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