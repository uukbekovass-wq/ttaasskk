const BASE_URL = 'https://inai-col1.fishrungames.com';
const adsContainer = document.getElementById('adsList');
const adForm = document.getElementById('adForm');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');

// Загрузка списка объявлений (GET)
async function fetchAds() {
    try {
        const response = await fetch(`${BASE_URL}/ads`);
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        const data = await response.json();
        renderAds(data.items || []);
    } catch (err) {
        adsContainer.innerHTML = `<p style="color: #dc2626;">Не удалось загрузить объявления: ${err.message}</p>`;
    }
}

// Отрисовка списка карточек
function renderAds(items) {
    if (!items.length) {
        adsContainer.innerHTML = '<p>Объявлений пока нет.</p>';
        return;
    }

    adsContainer.innerHTML = items.map(item => {
        let imgSrc = null;
        if (item.image_url) {
            imgSrc = item.image_url.startsWith('http')
                ? item.image_url
                : `${BASE_URL}${item.image_url}`;
        }

            return `
        <article class="card">
            <div class="card-img">
            ${imgSrc
                    ? `<img src="${imgSrc}" alt="${escapeHtml(item.title)}" loading="lazy">`
                    : '<span>Нет фото</span>'}
            </div>
            <div class="card-content">
            <div class="card-title">${escapeHtml(item.title)}</div>
            <div class="card-price">${Number(item.price).toLocaleString('ru-RU')} сом</div>
            <div class="card-desc">${escapeHtml(item.description)}</div>
            </div>
        </article>
        `;
        }).join('');
    }

// Отправка формы создания объявления (POST)
adForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusMsg.className = 'status-msg';
    statusMsg.textContent = '';
    submitBtn.disabled = true;

    // Формируем multipart/form-data
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('price', document.getElementById('price').value);

    const fileInput = document.getElementById('image');
    if (fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${BASE_URL}/ads`, {
            method: 'POST',
            body: formData
            // Заголовок Content-Type указывать не нужно, браузер сформирует его автоматически вместе с boundary
        });

        if (!response.ok) {
            throw new Error(`Ошибка при публикации (${response.status})`);
        }

        statusMsg.classList.add('success');
        statusMsg.textContent = 'Объявление успешно добавлено!';
        adForm.reset();

        // Обновляем список, чтобы сразу увидеть добавленное объявление
        await fetchAds();
    } catch (err) {
        statusMsg.classList.add('error');
        statusMsg.textContent = err.message;
    } finally {
        submitBtn.disabled = false;
    }
});

// Защита от XSS инъекций в пользовательских данных
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Первоначальный запрос при загрузке страницы
fetchAds();