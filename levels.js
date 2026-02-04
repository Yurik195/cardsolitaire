export const LEVELS = [
  {
    id: 1,
    movesLimit: -1,
    categorySlotsCount: 4,
    pilesCount: 4,
    cards: [
      { id: 'animals', type: 'CATEGORY', title: 'Животные', emoji: '🐶', needed: 5 },
      { id: 'burger', type: 'CATEGORY', title: 'Бургер', needed: 5 },
      { id: 'fruits', type: 'CATEGORY', title: 'Фрукты', emoji: '🍎', needed: 4 },
      { id: 'colors', type: 'CATEGORY', title: 'Цвета', needed: 4 },
      
      { id: 'cat', type: 'WORD', title: 'Кот', emoji: '🐱', categoryId: 'animals' },
      { id: 'dog', type: 'WORD', title: 'Собака', emoji: '🐶', categoryId: 'animals' },
      { id: 'hamster', type: 'WORD', title: 'Хомяк', emoji: '🐹', categoryId: 'animals' },
      { id: 'rabbit', type: 'WORD', title: 'Кролик', emoji: '🐰', categoryId: 'animals' },
      { id: 'bird', type: 'WORD', title: 'Птица', emoji: '🐦', categoryId: 'animals' },
      
      { id: 'patty', type: 'WORD', title: 'Котлета', categoryId: 'burger' },
      { id: 'lettuce', type: 'WORD', title: 'Салат', categoryId: 'burger' },
      { id: 'cheese', type: 'WORD', title: 'Сыр', categoryId: 'burger' },
      { id: 'sauce', type: 'WORD', title: 'Соус', categoryId: 'burger' },
      { id: 'bun', type: 'WORD', title: 'Булка', categoryId: 'burger' },
      
      { id: 'apple', type: 'WORD', title: 'Яблоко', emoji: '🍎', categoryId: 'fruits' },
      { id: 'banana', type: 'WORD', title: 'Банан', emoji: '🍌', categoryId: 'fruits' },
      { id: 'orange', type: 'WORD', title: 'Апельсин', emoji: '🍊', categoryId: 'fruits' },
      { id: 'grape', type: 'WORD', title: 'Виноград', emoji: '🍇', categoryId: 'fruits' },

      { id: 'red', type: 'WORD', title: 'Красный', categoryId: 'colors' },
      { id: 'blue', type: 'WORD', title: 'Синий', categoryId: 'colors' },
      { id: 'green', type: 'WORD', title: 'Зелёный', categoryId: 'colors' },
      { id: 'yellow', type: 'WORD', title: 'Жёлтый', categoryId: 'colors' },
    ],
    initialPiles: [
      ['animals', 'cat', 'patty'],
      ['burger', 'dog', 'apple', 'lettuce'],
      ['fruits', 'hamster', 'cheese', 'banana', 'red'],
      ['colors', 'rabbit', 'sauce', 'orange', 'blue', 'green'],
    ],
    deckOrder: ['bird', 'bun', 'grape', 'yellow'],
    openCardsCount: 2,
  },
  {
    id: 2,
    movesLimit: 50,
    categorySlotsCount: 4,
    pilesCount: 4,
    cards: [
      { id: 'animals2', type: 'CATEGORY', title: 'Животные', emoji: '🐶', needed: 4 },
      { id: 'food2', type: 'CATEGORY', title: 'Еда', emoji: '🍕', needed: 4 },
      { id: 'colors2', type: 'CATEGORY', title: 'Цвета', needed: 3 },
      { id: 'clothes2', type: 'CATEGORY', title: 'Одежда', needed: 3 },
      
      { id: 'cat2', type: 'WORD', title: 'Кот', emoji: '🐱', categoryId: 'animals2' },
      { id: 'dog2', type: 'WORD', title: 'Собака', emoji: '🐶', categoryId: 'animals2' },
      { id: 'bird2', type: 'WORD', title: 'Птица', emoji: '🐦', categoryId: 'animals2' },
      { id: 'rabbit2', type: 'WORD', title: 'Кролик', emoji: '�', cateIgoryId: 'animals2' },
      
      { id: 'apple2', type: 'WORD', title: 'Яблоко', emoji: '🍎', categoryId: 'food2' },
      { id: 'bread2', type: 'WORD', title: 'Хлеб', emoji: '🍞', categoryId: 'food2' },
      { id: 'cheese2', type: 'WORD', title: 'Сыр', emoji: '🧀', categoryId: 'food2' },
      { id: 'pizza2', type: 'WORD', title: 'Пицца', emoji: '🍕', categoryId: 'food2' },
      
      { id: 'red2', type: 'WORD', title: 'Красный', categoryId: 'colors2' },
      { id: 'blue2', type: 'WORD', title: 'Синий', categoryId: 'colors2' },
      { id: 'green2', type: 'WORD', title: 'Зелёный', categoryId: 'colors2' },
      
      { id: 'shirt2', type: 'WORD', title: 'Рубашка', categoryId: 'clothes2' },
      { id: 'pants2', type: 'WORD', title: 'Брюки', categoryId: 'clothes2' },
      { id: 'dress2', type: 'WORD', title: 'Платье', categoryId: 'clothes2' },
    ],
    initialPiles: [
      ['animals2', 'cat2', 'apple2'],
      ['food2', 'dog2', 'bread2', 'red2'],
      ['colors2', 'bird2', 'cheese2', 'blue2', 'shirt2'],
      ['clothes2', 'rabbit2', 'pizza2', 'green2', 'pants2', 'dress2'],
    ],
    deckOrder: [],
    openCardsCount: 2,
  },
];

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


// Темы с эмодзи (30% категорий) - только цветные эмодзи
const EMOJI_THEMES = [
  { id: 'animals', title: 'Животные', emoji: '🐶', isEmoji: true, words: [
    { word: 'Кот', emoji: '🐱' }, { word: 'Собака', emoji: '🐶' }, { word: 'Мышь', emoji: '🐭' },
    { word: 'Хомяк', emoji: '🐹' }, { word: 'Кролик', emoji: '🐰' }, { word: 'Лиса', emoji: '🦊' },
    { word: 'Медведь', emoji: '🐻' }, { word: 'Панда', emoji: '🐼' }, { word: 'Тигр', emoji: '🐯' }
  ]},
  { id: 'food', title: 'Еда', emoji: '🍕', isEmoji: true, words: [
    { word: 'Яблоко', emoji: '🍎' }, { word: 'Груша', emoji: '🍐' }, { word: 'Апельсин', emoji: '🍊' },
    { word: 'Пицца', emoji: '🍕' }, { word: 'Торт', emoji: '🎂' }, { word: 'Бургер', emoji: '🍔' },
    { word: 'Картошка', emoji: '🍟' }, { word: 'Хот-дог', emoji: '🌭' }, { word: 'Пончик', emoji: '🍩' }
  ]},
  { id: 'transport', title: 'Транспорт', emoji: '🚗', isEmoji: true, words: [
    { word: 'Машина', emoji: '🚗' }, { word: 'Такси', emoji: '🚕' }, { word: 'Автобус', emoji: '🚌' },
    { word: 'Поезд', emoji: '🚂' }, { word: 'Метро', emoji: '🚇' }, { word: 'Трактор', emoji: '🚜' },
    { word: 'Скорая', emoji: '🚑' }, { word: 'Пожарная', emoji: '🚒' }, { word: 'Полиция', emoji: '🚓' }
  ]},
  { id: 'nature', title: 'Природа', emoji: '🌸', isEmoji: true, words: [
    { word: 'Дерево', emoji: '🌳' }, { word: 'Цветок', emoji: '🌸' }, { word: 'Роза', emoji: '🌹' },
    { word: 'Подсолнух', emoji: '🌻' }, { word: 'Кактус', emoji: '🌵' }, { word: 'Пальма', emoji: '🌴' },
    { word: 'Ёлка', emoji: '🎄' }, { word: 'Клевер', emoji: '🍀' }, { word: 'Гриб', emoji: '🍄' }
  ]},
  { id: 'sports', title: 'Спорт', emoji: '🏀', isEmoji: true, words: [
    { word: 'Футбол', emoji: '⚽' }, { word: 'Баскетбол', emoji: '🏀' }, { word: 'Бейсбол', emoji: '⚾' },
    { word: 'Теннис', emoji: '🎾' }, { word: 'Волейбол', emoji: '🏐' }, { word: 'Регби', emoji: '🏈' },
    { word: 'Боулинг', emoji: '🎳' }, { word: 'Бильярд', emoji: '🎱' }, { word: 'Бокс', emoji: '🥊' }
  ]},
  { id: 'music', title: 'Музыка', emoji: '🎸', isEmoji: true, words: [
    { word: 'Гитара', emoji: '🎸' }, { word: 'Пианино', emoji: '🎹' }, { word: 'Барабаны', emoji: '🥁' },
    { word: 'Скрипка', emoji: '🎻' }, { word: 'Микрофон', emoji: '🎤' }, { word: 'Саксофон', emoji: '🎷' },
    { word: 'Труба', emoji: '🎺' }, { word: 'Наушники', emoji: '🎧' }, { word: 'Радио', emoji: '📻' }
  ]},
  { id: 'faces', title: 'Эмоции', emoji: '😀', isEmoji: true, words: [
    { word: 'Радость', emoji: '😊' }, { word: 'Грусть', emoji: '😢' }, { word: 'Злость', emoji: '😠' },
    { word: 'Удивление', emoji: '😲' }, { word: 'Страх', emoji: '😨' }, { word: 'Любовь', emoji: '😍' },
    { word: 'Смех', emoji: '😂' }, { word: 'Сон', emoji: '😴' }, { word: 'Думать', emoji: '🤔' }
  ]},
  { id: 'hearts', title: 'Сердца', emoji: '❤️', isEmoji: true, words: [
    { word: 'Красное', emoji: '❤️' }, { word: 'Оранжевое', emoji: '🧡' }, { word: 'Жёлтое', emoji: '💛' },
    { word: 'Зелёное', emoji: '💚' }, { word: 'Синее', emoji: '💙' }, { word: 'Фиолетовое', emoji: '💜' },
    { word: 'Розовое', emoji: '💗' }, { word: 'Разбитое', emoji: '💔' }, { word: 'Искры', emoji: '💖' }
  ]},
  { id: 'hands', title: 'Жесты', emoji: '👍', isEmoji: true, words: [
    { word: 'Класс', emoji: '👍' }, { word: 'Победа', emoji: '✌️' }, { word: 'Рок', emoji: '🤘' },
    { word: 'Ок', emoji: '👌' }, { word: 'Привет', emoji: '👋' }, { word: 'Кулак', emoji: '✊' },
    { word: 'Хлопок', emoji: '👏' }, { word: 'Молитва', emoji: '🙏' }, { word: 'Сила', emoji: '💪' }
  ]},
];


// Темы без эмодзи (70% категорий)
const TEXT_THEMES = [
  { id: 'colors', title: 'Цвета', words: ['Красный', 'Синий', 'Зелёный', 'Жёлтый', 'Чёрный', 'Белый', 'Розовый', 'Фиолетовый', 'Оранжевый'] },
  { id: 'clothes', title: 'Одежда', words: ['Рубашка', 'Брюки', 'Платье', 'Куртка', 'Обувь', 'Шапка', 'Носки', 'Перчатки', 'Шарф'] },
  { id: 'house', title: 'Дом', words: ['Стол', 'Стул', 'Кровать', 'Окно', 'Дверь', 'Лампа', 'Диван', 'Шкаф', 'Зеркало'] },
  { id: 'work', title: 'Профессии', words: ['Врач', 'Учитель', 'Повар', 'Водитель', 'Строитель', 'Художник', 'Музыкант', 'Писатель', 'Продавец'] },
  { id: 'school', title: 'Школа', words: ['Книга', 'Ручка', 'Тетрадь', 'Доска', 'Урок', 'Учебник', 'Карандаш', 'Линейка', 'Рюкзак'] },
  { id: 'body', title: 'Тело', words: ['Голова', 'Рука', 'Нога', 'Глаз', 'Нос', 'Рот', 'Ухо', 'Палец', 'Спина'] },
  { id: 'time', title: 'Время', words: ['Утро', 'День', 'Вечер', 'Ночь', 'Час', 'Минута', 'Неделя', 'Месяц', 'Год'] },
  { id: 'family', title: 'Семья', words: ['Мама', 'Папа', 'Сын', 'Дочь', 'Брат', 'Сестра', 'Дедушка', 'Бабушка', 'Дядя'] },
  { id: 'city', title: 'Город', words: ['Улица', 'Дом', 'Магазин', 'Парк', 'Школа', 'Больница', 'Банк', 'Кафе', 'Музей'] },
  { id: 'kitchen', title: 'Кухня', words: ['Тарелка', 'Ложка', 'Вилка', 'Нож', 'Чашка', 'Кастрюля', 'Сковорода', 'Холодильник', 'Плита'] },
  { id: 'garden', title: 'Сад', words: ['Трава', 'Куст', 'Клумба', 'Забор', 'Скамейка', 'Фонтан', 'Беседка', 'Дорожка', 'Качели'] },
  { id: 'office', title: 'Офис', words: ['Компьютер', 'Принтер', 'Телефон', 'Папка', 'Степлер', 'Скрепка', 'Календарь', 'Кресло', 'Монитор'] },
  { id: 'beach', title: 'Пляж', words: ['Песок', 'Волна', 'Зонт', 'Полотенце', 'Ракушка', 'Краб', 'Мяч', 'Лежак', 'Очки'] },
  { id: 'forest', title: 'Лес', words: ['Дерево', 'Гриб', 'Ягода', 'Тропа', 'Поляна', 'Пень', 'Мох', 'Листья', 'Ветка'] },
  { id: 'farm', title: 'Ферма', words: ['Трактор', 'Сарай', 'Поле', 'Сено', 'Колодец', 'Ограда', 'Амбар', 'Мельница', 'Урожай'] },
  { id: 'tools', title: 'Инструменты', words: ['Молоток', 'Отвёртка', 'Пила', 'Дрель', 'Гвоздь', 'Шуруп', 'Клещи', 'Рулетка', 'Уровень'] },
  { id: 'fruits', title: 'Фрукты', words: ['Яблоко', 'Банан', 'Апельсин', 'Груша', 'Виноград', 'Персик', 'Слива', 'Киви', 'Манго'] },
  { id: 'vegetables', title: 'Овощи', words: ['Морковь', 'Картофель', 'Помидор', 'Огурец', 'Капуста', 'Лук', 'Чеснок', 'Перец', 'Свёкла'] },
  { id: 'drinks', title: 'Напитки', words: ['Вода', 'Чай', 'Кофе', 'Сок', 'Молоко', 'Компот', 'Лимонад', 'Какао', 'Кефир'] },
  { id: 'months', title: 'Месяцы', words: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь'] },
  { id: 'materials', title: 'Материалы', words: ['Дерево', 'Металл', 'Стекло', 'Пластик', 'Ткань', 'Бумага', 'Камень', 'Резина', 'Кожа'] },
  { id: 'weather', title: 'Погода', words: ['Солнце', 'Дождь', 'Снег', 'Ветер', 'Туман', 'Гроза', 'Облако', 'Радуга', 'Мороз'] },
  { id: 'seasons', title: 'Сезоны', words: ['Весна', 'Лето', 'Осень', 'Зима', 'Тепло', 'Холод', 'Жара', 'Прохлада', 'Оттепель'] },
  { id: 'space', title: 'Космос', words: ['Звезда', 'Луна', 'Солнце', 'Планета', 'Ракета', 'Комета', 'Галактика', 'Орбита', 'Спутник'] },
  { id: 'sea', title: 'Море', words: ['Волна', 'Корабль', 'Рыба', 'Якорь', 'Маяк', 'Остров', 'Берег', 'Прибой', 'Чайка'] },
  { id: 'music_inst', title: 'Музыка', words: ['Нота', 'Песня', 'Мелодия', 'Ритм', 'Хор', 'Оркестр', 'Концерт', 'Опера', 'Джаз'] },
  { id: 'art', title: 'Искусство', words: ['Картина', 'Скульптура', 'Музей', 'Галерея', 'Выставка', 'Портрет', 'Пейзаж', 'Холст', 'Кисть'] },
  { id: 'books', title: 'Книги', words: ['Роман', 'Сказка', 'Поэма', 'Рассказ', 'Повесть', 'Глава', 'Страница', 'Автор', 'Герой'] },
  { id: 'games', title: 'Игры', words: ['Шахматы', 'Шашки', 'Домино', 'Карты', 'Лото', 'Пазл', 'Кубик', 'Фишка', 'Поле'] },
  { id: 'birds', title: 'Птицы', words: ['Воробей', 'Голубь', 'Ворона', 'Сорока', 'Синица', 'Снегирь', 'Ласточка', 'Орёл', 'Сова'] },
];


// Проверяет, должен ли появиться Джокер на уровне
function shouldSpawnJoker(levelId) {
  // После 30 уровня - 5% шанс
  if (levelId > 30) {
    return Math.random() < 0.05;
  }
  
  return false;
}

function generateLevel(levelId) {
  // Базовое количество карт-слов: уровень 2 = 30, уровень 3 = 35, растёт на 5 карт за уровень
  const baseWordCards = levelId === 2 ? 30 : 35;
  const cardsGrowthPerLevel = 5;
  const targetWordCards = baseWordCards + (levelId - 3) * cardsGrowthPerLevel;
  
  // Количество категорий: уровень 2 = 8 категорий, уровень 3+ начинаем с 4, добавляем 1 каждые 2 уровня, максимум 12
  let categoriesCount;
  if (levelId === 2) {
    categoriesCount = 8; // 30 карт / 8 категорий = ~3-4 карты на категорию
  } else {
    const baseCategories = 4;
    const extraCategories = Math.floor((levelId - 3) / 2);
    categoriesCount = Math.min(baseCategories + extraCategories, 12);
  }
  
  // Каждый 5-й уровень после 15 - легкий (меньше категорий)
  if (levelId > 15 && levelId % 5 === 0) {
    categoriesCount = Math.max(4, categoriesCount - 2);
  }
  
  // Средний размер категории растёт с уровнем
  // На начальных уровнях - маленькие категории для обучения
  let minCategorySize, maxCategorySize;
  if (levelId === 2) {
    // Уровень 2: маленькие категории (3-4 карты), много категорий
    minCategorySize = 3;
    maxCategorySize = 4;
  } else if (levelId <= 3) {
    // Уровень 3: маленькие категории (3-4 карты)
    minCategorySize = 3;
    maxCategorySize = 4;
  } else if (levelId <= 10) {
    // Уровни 4-10: маленькие и средние (3-5 карт)
    minCategorySize = 3;
    maxCategorySize = 5;
  } else if (levelId <= 20) {
    // Уровни 11-20: средние категории (4-5 карт)
    minCategorySize = 4;
    maxCategorySize = 5;
  } else if (levelId <= 35) {
    // Уровни 21-35: средние и большие (4-6 карт)
    minCategorySize = 4;
    maxCategorySize = 6;
  } else if (levelId <= 50) {
    // Уровни 36-50: большие категории (5-7 карт)
    minCategorySize = 5;
    maxCategorySize = 7;
  } else if (levelId <= 80) {
    // Уровни 51-80: очень большие (5-8 карт)
    minCategorySize = 5;
    maxCategorySize = 8;
  } else {
    // Уровни 81+: максимальные (6-9 карт)
    minCategorySize = 6;
    maxCategorySize = 9;
  }
  
  // Распределяем targetWordCards по категориям
  const categorySizes = [];
  let remainingCards = targetWordCards;
  
  for (let i = 0; i < categoriesCount; i++) {
    categorySizes.push(minCategorySize);
    remainingCards -= minCategorySize;
  }
  
  // Распределяем оставшиеся карты случайно
  while (remainingCards > 0) {
    const idx = Math.floor(Math.random() * categoriesCount);
    if (categorySizes[idx] < maxCategorySize) {
      categorySizes[idx]++;
      remainingCards--;
    } else {
      if (categoriesCount < 12) {
        categoriesCount++;
        categorySizes.push(minCategorySize);
        remainingCards -= minCategorySize;
      } else {
        break;
      }
    }
  }
  
  const totalWordCards = categorySizes.reduce((sum, size) => sum + size, 0);
  const movesLimit = Math.floor(totalWordCards * 2.5) + Math.floor(levelId / 5) * 5;
  
  // Количество столбцов (стопок) по уровням - синхронизировано со слотами
  let pilesCount;
  if (levelId < 15) pilesCount = 4;
  else if (levelId < 40) pilesCount = 5;
  else pilesCount = 6;
  
  const shuffledSizes = shuffleArray(categorySizes);

  // 30% категорий с эмодзи
  const emojiCategoriesCount = Math.ceil(categoriesCount * 0.3);
  const textCategoriesCount = categoriesCount - emojiCategoriesCount;
  
  const emojiOffset = (levelId * 2) % EMOJI_THEMES.length;
  const textOffset = (levelId * 3) % TEXT_THEMES.length;
  
  const selectedEmojiThemes = [];
  for (let i = 0; i < emojiCategoriesCount; i++) {
    const idx = (emojiOffset + i * 2) % EMOJI_THEMES.length;
    selectedEmojiThemes.push(EMOJI_THEMES[idx]);
  }
  
  const selectedTextThemes = [];
  for (let i = 0; i < textCategoriesCount; i++) {
    const idx = (textOffset + i * 2) % TEXT_THEMES.length;
    selectedTextThemes.push(TEXT_THEMES[idx]);
  }

  const cards = [];
  let cardIdCounter = 1;
  const allThemes = shuffleArray([...selectedEmojiThemes, ...selectedTextThemes]);
  
  // Проверяем, нужно ли добавить Джокера
  const hasJoker = shouldSpawnJoker(levelId);
  if (hasJoker) {
    cards.push({
      id: `joker_${levelId}`,
      type: 'JOKER',
      title: 'Джокер',
      emoji: '🃏',
      needed: 0 // Джокер не требует карт
    });
    console.log(`🃏 Джокер добавлен на уровень ${levelId}!`);
  }

  allThemes.forEach((theme, index) => {
    const cardsInCategory = shuffledSizes[index];
    const categoryId = `cat_${theme.id}_${levelId}`;
    const isEmojiTheme = theme.isEmoji === true;

    const categoryCard = {
      id: categoryId,
      type: 'CATEGORY',
      title: theme.title,
      needed: cardsInCategory
    };
    if (isEmojiTheme && theme.emoji) {
      categoryCard.emoji = theme.emoji;
    }
    cards.push(categoryCard);

    const wordsSource = theme.words.map(w => typeof w === 'string' ? { word: w } : w);
    const words = shuffleArray([...wordsSource]).slice(0, Math.min(cardsInCategory, wordsSource.length));
    
    while (words.length < cardsInCategory) {
      const baseWord = wordsSource[words.length % wordsSource.length];
      const newWord = { 
        word: `${baseWord.word} ${Math.floor(words.length / wordsSource.length) + 2}`,
        emoji: baseWord.emoji
      };
      words.push(newWord);
    }
    
    words.forEach((wordData) => {
      const wordCard = {
        id: `word_${levelId}_${cardIdCounter++}`,
        type: 'WORD',
        title: wordData.word,
        categoryId: categoryId
      };
      if (isEmojiTheme && wordData.emoji) {
        wordCard.emoji = wordData.emoji;
      }
      cards.push(wordCard);
    });
  });

  const shuffledCards = shuffleArray(cards);

  const initialPiles = [];
  let cardIndex = 0;
  
  for (let pile = 0; pile < pilesCount; pile++) {
    const cardsInPile = 3 + pile;
    const pileCards = [];
    
    for (let i = 0; i < cardsInPile && cardIndex < shuffledCards.length; i++) {
      pileCards.push(shuffledCards[cardIndex].id);
      cardIndex++;
    }
    
    initialPiles.push(pileCards);
  }

  const deckOrder = [];
  while (cardIndex < shuffledCards.length) {
    deckOrder.push(shuffledCards[cardIndex].id);
    cardIndex++;
  }

  // Количество слотов на игровом поле - увеличивается на уровнях 15, 40
  let categorySlotsCount;
  if (levelId < 15) {
    categorySlotsCount = 4;
  } else if (levelId < 40) {
    categorySlotsCount = 5;
  } else {
    categorySlotsCount = 6;
  }

  const wordCardsCount = cards.filter(c => c.type === 'WORD').length;
  const categoryCardsCount = cards.filter(c => c.type === 'CATEGORY').length;
  console.log(`Уровень ${levelId}: ${wordCardsCount} карт, ${categoryCardsCount} категорий, слотов: ${categorySlotsCount}`);

  return {
    id: levelId,
    movesLimit,
    categorySlotsCount,
    pilesCount,
    cards,
    initialPiles,
    deckOrder,
    openCardsCount: 2
  };
}

export function getLevel(levelId) {
  // Уровень 1 - статический обучающий
  // Уровни 2+ - генерируются динамически
  if (levelId === 1) {
    return LEVELS[0];
  }
  return generateLevel(levelId);
}
