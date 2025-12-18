async function initializePage() {
    await populateFormOptions(); 
    await fetchAndDisplaySources();
}

async function populateFormOptions() {
    try {
        // Параллельно запрашиваем темы и теги
        const [topicsResponse, tagsResponse] = await Promise.all([
            fetch('/api/topics/'),
            fetch('/api/tags/')
        ]);

        if (!topicsResponse.ok || !tagsResponse.ok) {
            throw new Error('Failed to load form options');
        }

        const topics = await topicsResponse.json();
        const tags = await tagsResponse.json();

        // Заполняем выпадающий список тем
        const topicSelect = document.getElementById('source-topic');
        topicSelect.innerHTML = '<option value="">-- Выберите тему --</option>'; // Опция по умолчанию
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.topic_name;
            topicSelect.appendChild(option);
        });

        // Заполняем контейнер с чекбоксами тегов
        const tagsContainer = document.getElementById('source-tags-container');
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="tags" value="${tag.id}">
                ${tag.tag_name}
            `;
            tagsContainer.appendChild(label);
        });

    } catch (error) {
        console.error('Ошибка при загрузке опций для формы:', error);
    }
}

/**
 * Загружает и отображает все источники знаний.
 */
async function fetchAndDisplaySources() {
    try {
        const response = await fetch('/api/knowledge_sources/');
        if (!response.ok) throw new Error('Network response was not ok');
        const sources = await response.json();

        const tableBody = document.querySelector('#sources-table tbody');
        tableBody.innerHTML = '';

        sources.forEach(source => {
            const row = document.createElement('tr');
            
            // Превращаем массив объектов тегов в строку
            const tagsString = source.tags.map(tag => tag.tag_name).join(', ');

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

/**
 * Обрабатывает отправку формы для добавления нового источника.
 */
async function addSource(event) {
    event.preventDefault();

    const title = document.getElementById('source-title').value;
    const url = document.getElementById('source-url').value;
    const content = document.getElementById('source-content').value;
    const topicId = document.getElementById('source-topic').value;

    // Собираем ID всех выбранных тегов
    const selectedTags = [];
    document.querySelectorAll('#source-tags-container input[type="checkbox"]:checked').forEach(checkbox => {
        selectedTags.push(parseInt(checkbox.value));
    });
    
    // Проверяем, что тема выбрана
    if (!topicId) {
        alert("Пожалуйста, выберите тему.");
        return;
    }

    try {
        const response = await fetch('/api/knowledge_sources/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                source_url: url,
                content: content,
                topic_id: parseInt(topicId),
                tags: selectedTags
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Ошибка при добавлении источника: ${errorData.detail}`);
        }

        document.getElementById('add-source-form').reset();
        await fetchAndDisplaySources();

    } catch (error) {
        console.error('Ошибка:', error);
        alert(error.message);
    }
}

async function handleDelete(sourceId) {
    if (!confirm(`Вы уверены, что хотите удалить источник с ID ${sourceId}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/knowledge_sources/${sourceId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении источника');
        }
        
        await fetchAndDisplaySources(); // Обновляем список
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


/**
 * Отправляет запрос на обновление источника.
 * (Эта функция будет вызываться после того, как пользователь введет новые данные)
 */
async function updateSource(sourceId, updatedData) {
    try {
        const response = await fetch(`/api/knowledge_sources/${sourceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Ошибка при обновлении: ${errorData.detail}`);
        }

        await fetchAndDisplaySources(); // Обновляем список
    } catch (error) {
        console.error('Ошибка:', error);
        alert(error.message);
    }
}


// --- ОБНОВЛЕННЫЙ "СЛУШАТЕЛЬ" СОБЫТИЙ ---

document.addEventListener('DOMContentLoaded', initializePage);
document.getElementById('add-source-form').addEventListener('submit', addSource);

// Добавляем "слушатель" на всю таблицу для кнопок
document.getElementById('sources-table').addEventListener('click', function(event) {
    
    // --- Обработка клика на кнопку удаления ---
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
        const sourceId = deleteButton.dataset.id;
        handleDelete(sourceId);
        return;
    }
    
    // --- Обработка клика на кнопку изменения ---
    // Для источников `prompt` не очень удобен, так как полей много.
    // В реальном проекте здесь бы открывалось модальное окно с формой.
    // Для курсовой можно сделать простое уведомление.
    const editButton = event.target.closest('.edit-btn');
    if (editButton) {
        alert("Функция редактирования для источников в разработке.\n" + 
              "Для изменения удалите старую запись и создайте новую.");
        // const sourceId = editButton.dataset.id;
        // handleEdit(sourceId); // <-- Эту функцию нужно будет написать, если захочешь
        return;
    }
});