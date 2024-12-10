// Получение элементов интерфейса
const giphyInput = document.getElementById('giphyInput');
const errorAlert = document.getElementById('errorAlert');
const giphyInfo = document.getElementById('giphyInfo');
const nextButton = document.getElementById('nextButton');

const API_KEY = 'aBxTLzXcECf2eFGsJUaFCUZ9717ZbglH'; // Есть ограничение на 100 вызовов API в час
const BASE_URL = 'https://api.giphy.com/v1/gifs/search'; // Все есть здесь https://developers.giphy.com/docs/api/#quick-start-guide

let debounceTimeout = null;
let offset = 0;
const LIMIT = 4; // Четыре гифки
let firstRequestCompleted = false; // Значение первого реквеста на ложь (это для скрытия/появлния кнопки Еще)

// Функция для выполнения запроса к API
const fetchGiphy = async (keyword) => {
    clearError(); // Очистка ошибок перед новым запросом
    clearGiphyInfo(); // Очистка гифок перед новым запросом

    try {
        const response = await fetch(
            `${BASE_URL}?q=${keyword}&api_key=${API_KEY}&limit=${LIMIT}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error(`Ошибка при поиске.`);
        }

        const data = await response.json();
        if (data.data.length > 0) {
            displayGiphyInfo(data.data); // Отображение гифок
            offset += LIMIT; // Загрузка результатов по частям
            if (!firstRequestCompleted) {
                nextButton.style.display = 'block'; // Отображение кнопки "Ещё" после первого запроса
                firstRequestCompleted = true; // Значение первого реквеста на тру
            }
        } else {
            throw new Error('Gif не найдены.');
        }
    } catch (err) {
        console.error(err.message);
        displayError(err.message); // Отображение ошибки, если запрос не удался
    }
};

// Функция для отображения гифок
const displayGiphyInfo = (giphys) => {
    giphyInfo.innerHTML = giphys.map(giphy => `
        <img src="${giphy.images.fixed_height.url}" alt="${giphy.title}" class="img-fluid mb-3">
    `).join('');
};

// Функция для отображения ошибки
const displayError = (message) => {
    errorAlert.textContent = message;
};

// Функция для очистки ошибок
const clearError = () => {
    errorAlert.textContent = ''; // Очистка текста ошибки
};

// Функция для очистки данных о гифках
const clearGiphyInfo = () => {
    giphyInfo.innerHTML = ''; // Очистка гифок
};

// Обработчик ввода с задержкой
giphyInput.addEventListener('input', () => {
    const keyword = giphyInput.value.trim(); // Получение ключевого слова
    offset = 0; // Сброс offset при новом поиске
    firstRequestCompleted = false; // Флаг первого реквеста на ложь, чтобы работало скрытие/появление Еще
    nextButton.style.display = 'none'; // Скрытие кнопки Ещё при новом поиске

    if (debounceTimeout) {
        clearTimeout(debounceTimeout); // Очистка предыдущего таймаута
    }

    if (keyword) {
        debounceTimeout = setTimeout(() => {
            fetchGiphy(keyword);
        }, 1000); // Теперь написать в поле для ввода нужно всего за 1 секунду
    }
});

// Обработчик кнопки Ещё
nextButton.addEventListener('click', () => {
    const keyword = giphyInput.value.trim(); // Получение ключевого слова из поля ввода
    if (keyword) {
        fetchGiphy(keyword); // Запрос API для загрузки дополнительных гифок
    }
});