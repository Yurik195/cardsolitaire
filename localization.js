const STRINGS = {
  ru: {
    PLAY: 'Играть',
    READY: 'Готово',
    MENU: 'Меню',
    RESTART: 'Рестарт',
    MOVES: 'Ходы',
    LEVEL: 'Уровень',
    MOVES_ENDED: 'Ходы закончились',
    ADD_MOVES: 'Можно добавить +10 ходов',
    WATCH_AD: 'Смотреть рекламу',
    RESTART_LEVEL: 'Начать заново',
    EXCELLENT: 'Отлично!',
    CONTINUE: 'Продолжить',
    TRIPLE_REWARD: 'x3 награда',
    SOUND: 'Звук',
    BUY_HINT: 'Купить подсказку?',
    BUY: 'Купить',
    GET_COINS: 'Получить монеты?',
    WATCH_AD: 'Смотреть рекламу',
    SHOP: 'Магазин',
    PREMIUM_SET: 'Премиум набор',
    PREMIUM_DESC: 'Без рекламы + 9000 монет + по 5 подсказок',
    NO_ADS: 'Без межстраничной рекламы',
    COINS: 'Монеты',
    FOR_AD: 'За рекламу',
    OTHER_GAMES: 'Другие игры',
    GAME_OVER: 'Игра завершена',
    NO_CARDS: 'Доступных карт нет, вытяните из колоды',
    CLICK_DECK: 'Нажмите на колоду чтобы вернуть карты',
    HINT_WRONG_CATEGORY: 'Вы можете складывать карты только одной категории.',
    HINT_CATEGORY_SLOT: 'В этот слот можно поместить только карту категории.',
    HINT_DIFFERENT_CATEGORY: 'Эта карта из другой категории.',
    HINT_CATEGORY_NOT_IN_SLOT: 'Сначала положите карту категории в слот.',
    HINT_JOKER_SLOT: 'Драгоценного джокера можно закрыть последней картой в игре.',
    AD_MOVES: '+10 ходов',
    AD_COUNTDOWN: 'Реклама через',
  },
  en: {
    PLAY: 'Play',
    READY: 'Ready',
    MENU: 'Menu',
    RESTART: 'Restart',
    MOVES: 'Moves',
    LEVEL: 'Level',
    MOVES_ENDED: 'Out of moves',
    ADD_MOVES: 'You can add +10 moves',
    WATCH_AD: 'Watch ad',
    RESTART_LEVEL: 'Restart',
    EXCELLENT: 'Excellent!',
    CONTINUE: 'Continue',
    TRIPLE_REWARD: 'x3 reward',
    SOUND: 'Sound',
    BUY_HINT: 'Buy hint?',
    BUY: 'Buy',
    GET_COINS: 'Get coins?',
    WATCH_AD: 'Watch ad',
    SHOP: 'Shop',
    PREMIUM_SET: 'Premium pack',
    PREMIUM_DESC: 'No ads + 9000 coins + 5 hints each',
    NO_ADS: 'No interstitial ads',
    COINS: 'Coins',
    FOR_AD: 'Watch ad',
    OTHER_GAMES: 'Other games',
    GAME_OVER: 'Game over',
    NO_CARDS: 'No cards available, draw from deck',
    CLICK_DECK: 'Click deck to return cards',
    HINT_WRONG_CATEGORY: 'You can only stack cards of the same category.',
    HINT_CATEGORY_SLOT: 'Only category cards can be placed in this slot.',
    HINT_DIFFERENT_CATEGORY: 'This card is from a different category.',
    HINT_CATEGORY_NOT_IN_SLOT: 'First place a category card in the slot.',
    HINT_JOKER_SLOT: 'The precious joker can be covered with the last card in the game.',
    AD_MOVES: '+10 moves',
    AD_COUNTDOWN: 'Ad in',
  },
};

// Словарь переводов для карт (русский -> английский)
// Карты с эмодзи не переводятся, только текстовые
const CARD_TRANSLATIONS = {
  // Категории
  'Животные': 'Animals',
  'Бургер': 'Burger',
  'Фрукты': 'Fruits',
  'Цвета': 'Colors',
  'Еда': 'Food',
  'Одежда': 'Clothes',
  'Дом': 'Home',
  'Профессии': 'Jobs',
  'Школа': 'School',
  'Тело': 'Body',
  'Время': 'Time',
  'Семья': 'Family',
  'Город': 'City',
  'Кухня': 'Kitchen',
  'Сад': 'Garden',
  'Офис': 'Office',
  'Пляж': 'Beach',
  'Лес': 'Forest',
  'Ферма': 'Farm',
  'Инструменты': 'Tools',
  'Овощи': 'Vegetables',
  'Напитки': 'Drinks',
  'Месяцы': 'Months',
  'Материалы': 'Materials',
  'Транспорт': 'Transport',
  'Природа': 'Nature',
  'Спорт': 'Sports',
  'Музыка': 'Music',
  'Эмоции': 'Emotions',
  'Сердца': 'Hearts',
  'Жесты': 'Gestures',
  
  // Животные
  'Кот': 'Cat',
  'Собака': 'Dog',
  'Хомяк': 'Hamster',
  'Кролик': 'Rabbit',
  'Птица': 'Bird',
  'Рыба': 'Fish',
  'Лошадь': 'Horse',
  'Корова': 'Cow',
  'Свинья': 'Pig',
  'Мышь': 'Mouse',
  'Лиса': 'Fox',
  'Медведь': 'Bear',
  'Панда': 'Panda',
  'Тигр': 'Tiger',
  
  // Бургер/Еда
  'Котлета': 'Patty',
  'Салат': 'Lettuce',
  'Сыр': 'Cheese',
  'Соус': 'Sauce',
  'Булка': 'Bun',
  'Яблоко': 'Apple',
  'Хлеб': 'Bread',
  'Пицца': 'Pizza',
  'Торт': 'Cake',
  'Мясо': 'Meat',
  'Рис': 'Rice',
  'Груша': 'Pear',
  'Апельсин': 'Orange',
  'Бургер': 'Burger',
  'Картошка': 'Fries',
  'Хот-дог': 'Hot dog',
  'Пончик': 'Donut',
  
  // Фрукты
  'Банан': 'Banana',
  'Виноград': 'Grapes',
  'Персик': 'Peach',
  'Слива': 'Plum',
  'Киви': 'Kiwi',
  'Манго': 'Mango',
  
  // Цвета
  'Красный': 'Red',
  'Синий': 'Blue',
  'Зелёный': 'Green',
  'Жёлтый': 'Yellow',
  'Чёрный': 'Black',
  'Белый': 'White',
  'Розовый': 'Pink',
  'Фиолетовый': 'Purple',
  'Оранжевый': 'Orange',
  
  // Одежда
  'Рубашка': 'Shirt',
  'Брюки': 'Pants',
  'Платье': 'Dress',
  'Куртка': 'Jacket',
  'Обувь': 'Shoes',
  'Шапка': 'Hat',
  'Носки': 'Socks',
  'Перчатки': 'Gloves',
  'Шарф': 'Scarf',
  
  // Дом
  'Стол': 'Table',
  'Стул': 'Chair',
  'Кровать': 'Bed',
  'Окно': 'Window',
  'Дверь': 'Door',
  'Лампа': 'Lamp',
  'Диван': 'Sofa',
  'Шкаф': 'Wardrobe',
  'Зеркало': 'Mirror',
  
  // Профессии
  'Врач': 'Doctor',
  'Учитель': 'Teacher',
  'Повар': 'Chef',
  'Водитель': 'Driver',
  'Строитель': 'Builder',
  'Художник': 'Artist',
  'Музыкант': 'Musician',
  'Писатель': 'Writer',
  'Продавец': 'Seller',
  
  // Школа
  'Книга': 'Book',
  'Ручка': 'Pen',
  'Тетрадь': 'Notebook',
  'Доска': 'Board',
  'Урок': 'Lesson',
  'Учебник': 'Textbook',
  'Карандаш': 'Pencil',
  'Линейка': 'Ruler',
  'Рюкзак': 'Backpack',
  
  // Тело
  'Голова': 'Head',
  'Рука': 'Hand',
  'Нога': 'Leg',
  'Глаз': 'Eye',
  'Нос': 'Nose',
  'Рот': 'Mouth',
  'Ухо': 'Ear',
  'Палец': 'Finger',
  'Спина': 'Back',
  
  // Время
  'Утро': 'Morning',
  'День': 'Day',
  'Вечер': 'Evening',
  'Ночь': 'Night',
  'Час': 'Hour',
  'Минута': 'Minute',
  'Неделя': 'Week',
  'Месяц': 'Month',
  'Год': 'Year',
  
  // Семья
  'Мама': 'Mom',
  'Папа': 'Dad',
  'Сын': 'Son',
  'Дочь': 'Daughter',
  'Брат': 'Brother',
  'Сестра': 'Sister',
  'Дедушка': 'Grandpa',
  'Бабушка': 'Grandma',
  'Дядя': 'Uncle',
  
  // Город
  'Улица': 'Street',
  'Магазин': 'Shop',
  'Парк': 'Park',
  'Больница': 'Hospital',
  'Банк': 'Bank',
  'Кафе': 'Cafe',
  'Музей': 'Museum',
  
  // Кухня
  'Тарелка': 'Plate',
  'Ложка': 'Spoon',
  'Вилка': 'Fork',
  'Нож': 'Knife',
  'Чашка': 'Cup',
  'Кастрюля': 'Pot',
  'Сковорода': 'Pan',
  'Холодильник': 'Fridge',
  'Плита': 'Stove',
  
  // Сад
  'Трава': 'Grass',
  'Куст': 'Bush',
  'Клумба': 'Flowerbed',
  'Забор': 'Fence',
  'Скамейка': 'Bench',
  'Фонтан': 'Fountain',
  'Беседка': 'Gazebo',
  'Дорожка': 'Path',
  'Качели': 'Swing',
  
  // Офис
  'Компьютер': 'Computer',
  'Принтер': 'Printer',
  'Телефон': 'Phone',
  'Папка': 'Folder',
  'Степлер': 'Stapler',
  'Скрепка': 'Clip',
  'Календарь': 'Calendar',
  'Кресло': 'Armchair',
  
  // Пляж
  'Песок': 'Sand',
  'Волна': 'Wave',
  'Зонт': 'Umbrella',
  'Полотенце': 'Towel',
  'Ракушка': 'Shell',
  'Краб': 'Crab',
  'Мяч': 'Ball',
  'Лежак': 'Lounger',
  'Очки': 'Glasses',
  
  // Лес
  'Дерево': 'Tree',
  'Гриб': 'Mushroom',
  'Ягода': 'Berry',
  'Тропа': 'Trail',
  'Поляна': 'Glade',
  'Пень': 'Stump',
  'Мох': 'Moss',
  'Листья': 'Leaves',
  'Ветка': 'Branch',
  
  // Ферма
  'Трактор': 'Tractor',
  'Сарай': 'Barn',
  'Поле': 'Field',
  'Сено': 'Hay',
  'Колодец': 'Well',
  'Ограда': 'Fence',
  'Амбар': 'Granary',
  'Мельница': 'Mill',
  'Урожай': 'Harvest',
  
  // Инструменты
  'Молоток': 'Hammer',
  'Отвёртка': 'Screwdriver',
  'Пила': 'Saw',
  'Дрель': 'Drill',
  'Гвоздь': 'Nail',
  'Шуруп': 'Screw',
  'Клещи': 'Pliers',
  'Рулетка': 'Tape',
  'Уровень': 'Level',
  
  // Овощи
  'Морковь': 'Carrot',
  'Картофель': 'Potato',
  'Помидор': 'Tomato',
  'Огурец': 'Cucumber',
  'Капуста': 'Cabbage',
  'Лук': 'Onion',
  'Чеснок': 'Garlic',
  'Перец': 'Pepper',
  'Свёкла': 'Beet',
  
  // Напитки
  'Вода': 'Water',
  'Чай': 'Tea',
  'Кофе': 'Coffee',
  'Сок': 'Juice',
  'Молоко': 'Milk',
  'Компот': 'Compote',
  'Лимонад': 'Lemonade',
  'Какао': 'Cocoa',
  'Кефир': 'Kefir',
  
  // Месяцы
  'Январь': 'January',
  'Февраль': 'February',
  'Март': 'March',
  'Апрель': 'April',
  'Май': 'May',
  'Июнь': 'June',
  'Июль': 'July',
  'Август': 'August',
  'Сентябрь': 'September',
  
  // Материалы
  'Металл': 'Metal',
  'Стекло': 'Glass',
  'Пластик': 'Plastic',
  'Ткань': 'Fabric',
  'Бумага': 'Paper',
  'Камень': 'Stone',
  'Резина': 'Rubber',
  'Кожа': 'Leather',
  
  // Транспорт
  'Машина': 'Car',
  'Такси': 'Taxi',
  'Автобус': 'Bus',
  'Поезд': 'Train',
  'Метро': 'Metro',
  'Скорая': 'Ambulance',
  'Пожарная': 'Fire truck',
  'Полиция': 'Police',
  
  // Природа
  'Цветок': 'Flower',
  'Роза': 'Rose',
  'Подсолнух': 'Sunflower',
  'Кактус': 'Cactus',
  'Пальма': 'Palm',
  'Ёлка': 'Fir tree',
  'Клевер': 'Clover',
  
  // Спорт
  'Футбол': 'Football',
  'Баскетбол': 'Basketball',
  'Бейсбол': 'Baseball',
  'Теннис': 'Tennis',
  'Волейбол': 'Volleyball',
  'Регби': 'Rugby',
  'Боулинг': 'Bowling',
  'Бильярд': 'Billiards',
  'Бокс': 'Boxing',
  
  // Музыка
  'Гитара': 'Guitar',
  'Пианино': 'Piano',
  'Барабаны': 'Drums',
  'Скрипка': 'Violin',
  'Микрофон': 'Microphone',
  'Саксофон': 'Saxophone',
  'Труба': 'Trumpet',
  'Наушники': 'Headphones',
  'Радио': 'Radio',
  
  // Эмоции
  'Радость': 'Joy',
  'Грусть': 'Sadness',
  'Злость': 'Anger',
  'Удивление': 'Surprise',
  'Страх': 'Fear',
  'Любовь': 'Love',
  'Смех': 'Laughter',
  'Сон': 'Sleep',
  'Думать': 'Think',
  
  // Сердца
  'Красное': 'Red',
  'Оранжевое': 'Orange',
  'Жёлтое': 'Yellow',
  'Зелёное': 'Green',
  'Синее': 'Blue',
  'Фиолетовое': 'Purple',
  'Розовое': 'Pink',
  'Разбитое': 'Broken',
  'Искры': 'Sparks',
  
  // Жесты
  'Класс': 'Thumbs up',
  'Победа': 'Victory',
  'Рок': 'Rock',
  'Ок': 'OK',
  'Привет': 'Hello',
  'Кулак': 'Fist',
  'Хлопок': 'Clap',
  'Молитва': 'Prayer',
  'Сила': 'Strength',
  
  // Погода
  'Погода': 'Weather',
  'Солнце': 'Sun',
  'Дождь': 'Rain',
  'Снег': 'Snow',
  'Ветер': 'Wind',
  'Туман': 'Fog',
  'Гроза': 'Storm',
  'Облако': 'Cloud',
  'Радуга': 'Rainbow',
  'Мороз': 'Frost',
  
  // Сезоны
  'Сезоны': 'Seasons',
  'Весна': 'Spring',
  'Лето': 'Summer',
  'Осень': 'Autumn',
  'Зима': 'Winter',
  'Тепло': 'Warmth',
  'Холод': 'Cold',
  'Жара': 'Heat',
  'Прохлада': 'Cool',
  'Оттепель': 'Thaw',
  
  // Космос
  'Космос': 'Space',
  'Звезда': 'Star',
  'Луна': 'Moon',
  'Планета': 'Planet',
  'Ракета': 'Rocket',
  'Комета': 'Comet',
  'Галактика': 'Galaxy',
  'Орбита': 'Orbit',
  'Спутник': 'Satellite',
  
  // Море
  'Море': 'Sea',
  'Корабль': 'Ship',
  'Якорь': 'Anchor',
  'Маяк': 'Lighthouse',
  'Остров': 'Island',
  'Берег': 'Shore',
  'Прибой': 'Surf',
  'Чайка': 'Seagull',
  
  // Искусство
  'Искусство': 'Art',
  'Картина': 'Painting',
  'Скульптура': 'Sculpture',
  'Галерея': 'Gallery',
  'Выставка': 'Exhibition',
  'Портрет': 'Portrait',
  'Пейзаж': 'Landscape',
  'Холст': 'Canvas',
  'Кисть': 'Brush',
  
  // Книги
  'Книги': 'Books',
  'Роман': 'Novel',
  'Сказка': 'Fairy tale',
  'Поэма': 'Poem',
  'Рассказ': 'Story',
  'Повесть': 'Novella',
  'Глава': 'Chapter',
  'Страница': 'Page',
  'Автор': 'Author',
  'Герой': 'Hero',
  
  // Игры
  'Игры': 'Games',
  'Шахматы': 'Chess',
  'Шашки': 'Checkers',
  'Домино': 'Domino',
  'Карты': 'Cards',
  'Лото': 'Lotto',
  'Пазл': 'Puzzle',
  'Кубик': 'Dice',
  'Фишка': 'Chip',
  'Поле': 'Board',
  
  // Птицы
  'Птицы': 'Birds',
  'Воробей': 'Sparrow',
  'Голубь': 'Pigeon',
  'Ворона': 'Crow',
  'Сорока': 'Magpie',
  'Синица': 'Tit',
  'Снегирь': 'Bullfinch',
  'Ласточка': 'Swallow',
  'Орёл': 'Eagle',
  'Сова': 'Owl',
  
  // Офис (дополнение)
  'Монитор': 'Monitor',
};

let lang = 'ru';

export function setLang(l) {
  lang = STRINGS[l] ? l : 'ru';
}

export function t(key) {
  return STRINGS[lang]?.[key] ?? key;
}

export function getCurrentLang() {
  return lang;
}

/**
 * Перевод названия карты (для карт без эмодзи)
 * @param {string} title - оригинальное название карты на русском
 * @returns {string} - переведённое название или оригинал
 */
export function translateCardTitle(title) {
  if (lang === 'ru') {
    return title;
  }
  
  // Проверяем базовое слово (без номера)
  const baseTitle = title.replace(/\s+\d+$/, '');
  const numberMatch = title.match(/\s+(\d+)$/);
  const number = numberMatch ? numberMatch[1] : '';
  
  const translated = CARD_TRANSLATIONS[baseTitle];
  if (translated) {
    return number ? `${translated} ${number}` : translated;
  }
  
  return title;
}
