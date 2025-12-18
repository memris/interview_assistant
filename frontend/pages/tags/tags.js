async function fetchAndDisplayTags() {
    try {
        const response = await fetch('/api/tags/');
        if (!response.ok) throw new Error('Network response was not ok');
        const tags = await response.json();

        const tableBody = document.querySelector('#tags-table tbody');
        tableBody.innerHTML = ''; 

        tags.forEach(tag => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tag.id}</td>
                <td>${tag.tag_name}</td>
                <td>
                    <button class="edit-btn" data-id="${tag.id}">✏️ Изменить</button>
                    <button class="delete-btn" data-id="${tag.id}">🗑️ Удалить</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке тегов:', error);
    }
}

async function addTag(event) {
    event.preventDefault();

    const tagNameInput = document.getElementById('tag-name');
    const tagName = tagNameInput.value;

    try {
        const response = await fetch('/api/tags/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tag_name: tagName,
            }), 
        });

        if (!response.ok) {
            throw new Error('Ошибка при добавлении тега');
        }

        tagNameInput.value = ''; 
        await fetchAndDisplayTags(); 
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


async function handleDelete(tagId) {
    if (!confirm(`Вы уверены, что хотите удалить тег с ID ${tagId}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/tags/${tagId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении тега');
        }
        
        await fetchAndDisplayTags(); 
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function handleEdit(tagId, currentName) {
    const newName = prompt("Введите новое название тега:", currentName);

    if (newName === null || newName.trim() === '') return; 

    updateTag(tagId, newName);
}


async function updateTag(tagId, newName) {
    try {
        const response = await fetch(`/api/tags/${tagId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tag_name: newName,
            }), 
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при обновлении тега');
        }

        await fetchAndDisplayTags();
    } catch (error) {
        console.error('Ошибка:', error);
    }
}


document.addEventListener('DOMContentLoaded', fetchAndDisplayTags);

document.getElementById('add-tag-form').addEventListener('submit', addTag);

document.getElementById('tags-table').addEventListener('click', function(event) {
    
    const deleteButton = event.target.closest('.delete-btn');
    if (deleteButton) {
        const tagId = deleteButton.dataset.id;
        handleDelete(tagId);
        return;
    }
    
    const editButton = event.target.closest('.edit-btn');
    if (editButton) {
        const tagId = editButton.dataset.id;
        const row = editButton.closest('tr');
        const currentName = row.cells[1].textContent;
        handleEdit(tagId, currentName);
        return;
    }
});