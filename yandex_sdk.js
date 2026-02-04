/**
 * Модуль интеграции Yandex Games SDK
 * Документация: https://yandex.ru/dev/games/doc/ru/sdk/
 */

import { setLang } from './localization.js';
import { muteAudio, unmuteAudio } from './audio.js';

// Глобальные переменные SDK
let ysdk = null;
let player = null;
let payments = null;
let productCatalog = [];
let isSDKInitialized = false;
let lastInterstitialTime = 0;
let lastShopRewardedTime = 0;
let isAdsDisabled = false; // Флаг отключения рекламы (покупка)
const INTERSTITIAL_COOLDOWN = 90000; // 90 секунд между показами fullscreen рекламы
const SHOP_REWARDED_COOLDOWN = 600000; // 10 минут между показами rewarded в магазине

// Маппинг ID продуктов на внутренние ID
const PRODUCT_MAP = {
  'kup1500': { coins: 1500 },
  'kup7500': { coins: 7500 },
  'kup25000': { coins: 25000 },
  'kup50000': { coins: 50000 },
  'kup100000': { coins: 100000 },
  'bez_rek': { noAds: true },
  'prem': { coins: 9000, noAds: true, hints: 5, undos: 5 }
};

/**
 * Инициализация Yandex Games SDK
 * @returns {Promise<object>} - объект SDK
 */
export async function initYandexSDK() {
  if (isSDKInitialized && ysdk) {
    return ysdk;
  }

  try {
    // Проверяем, доступен ли SDK (загружен через script в index.html)
    if (typeof YaGames === 'undefined') {
      console.warn('Yandex Games SDK не загружен. Работаем в режиме разработки.');
      return null;
    }

    ysdk = await YaGames.init();
    isSDKInitialized = true;
    console.log('Yandex Games SDK инициализирован');

    // Устанавливаем язык игры на основе SDK
    setupLanguage();

    // Инициализируем игрока для облачных сохранений
    await initPlayer();

    // Инициализируем покупки
    await initPayments();

    // Проверяем необработанные покупки
    await checkPendingPurchases();

    return ysdk;
  } catch (error) {
    console.error('Ошибка инициализации Yandex SDK:', error);
    return null;
  }
}

/**
 * Установка языка игры на основе данных SDK
 */
function setupLanguage() {
  if (!ysdk) return;

  try {
    const lang = ysdk.environment.i18n.lang;
    // Если язык ru - ставим русский, иначе английский
    const gameLang = lang === 'ru' ? 'ru' : 'en';
    setLang(gameLang);
    console.log(`Язык игры установлен: ${gameLang} (SDK lang: ${lang})`);
  } catch (error) {
    console.warn('Не удалось получить язык из SDK, используем ru:', error);
    setLang('ru');
  }
}

/**
 * Инициализация объекта игрока для облачных сохранений
 */
async function initPlayer() {
  if (!ysdk) return null;

  try {
    player = await ysdk.getPlayer();
    console.log('Игрок инициализирован, авторизован:', player.getMode() !== 'lite');
    return player;
  } catch (error) {
    console.warn('Ошибка инициализации игрока:', error);
    return null;
  }
}

/**
 * Сигнал платформе что игра загружена и готова
 */
export function gameReady() {
  if (!ysdk) {
    console.log('gameReady: SDK не инициализирован (режим разработки)');
    return;
  }

  try {
    ysdk.features.LoadingAPI?.ready();
    console.log('Сигнал gameReady отправлен');
  } catch (error) {
    console.warn('Ошибка отправки gameReady:', error);
  }
}

/**
 * Сигнал о начале геймплея
 */
export function gameplayStart() {
  if (!ysdk) return;

  try {
    ysdk.features.GameplayAPI?.start();
  } catch (error) {
    console.warn('Ошибка GameplayAPI.start:', error);
  }
}

/**
 * Сигнал об остановке геймплея (меню, реклама, пауза)
 */
export function gameplayStop() {
  if (!ysdk) return;

  try {
    ysdk.features.GameplayAPI?.stop();
  } catch (error) {
    console.warn('Ошибка GameplayAPI.stop:', error);
  }
}


/**
 * Показ межстраничной (fullscreen) рекламы
 * Показывается только если прошло больше 90 секунд с последнего показа
 * @param {string} reason - причина показа (для логов)
 * @returns {Promise<boolean>} - была ли показана реклама
 */
export async function showInterstitialAd(reason = '') {
  // Проверяем, отключена ли реклама покупкой
  if (isAdsDisabled) {
    console.log(`Interstitial пропущен: реклама отключена покупкой`);
    return false;
  }

  const now = Date.now();
  const timeSinceLastAd = now - lastInterstitialTime;

  // Проверяем кулдаун 90 секунд
  if (timeSinceLastAd < INTERSTITIAL_COOLDOWN) {
    console.log(`Interstitial пропущен: прошло ${Math.round(timeSinceLastAd / 1000)}с из ${INTERSTITIAL_COOLDOWN / 1000}с`);
    return false;
  }

  // Если SDK не инициализирован - режим разработки
  if (!ysdk) {
    console.log(`Interstitial (dev mode): ${reason}`);
    lastInterstitialTime = now;
    return false;
  }

  return new Promise((resolve) => {
    gameplayStop();
    muteAudio();

    ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: () => {
          console.log(`Interstitial открыт: ${reason}`);
        },
        onClose: (wasShown) => {
          console.log(`Interstitial закрыт, показан: ${wasShown}`);
          if (wasShown) {
            lastInterstitialTime = Date.now();
          }
          unmuteAudio();
          gameplayStart();
          resolve(wasShown);
        },
        onError: (error) => {
          console.warn('Ошибка показа Interstitial:', error);
          unmuteAudio();
          gameplayStart();
          resolve(false);
        },
        onOffline: () => {
          console.log('Interstitial: нет сети');
          unmuteAudio();
          gameplayStart();
          resolve(false);
        }
      }
    });
  });
}

/**
 * Показ рекламы с вознаграждением (rewarded video)
 * @param {string} reason - причина показа (для логов)
 * @returns {Promise<{rewarded: boolean}>} - получил ли игрок награду
 */
export async function showRewardedAd(reason = '') {
  // Если SDK не инициализирован - режим разработки (даём награду)
  if (!ysdk) {
    console.log(`Rewarded (dev mode): ${reason}`);
    await new Promise(r => setTimeout(r, 500)); // Имитация задержки
    return { rewarded: true };
  }

  return new Promise((resolve) => {
    let wasRewarded = false;

    gameplayStop();
    muteAudio();

    ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => {
          console.log(`Rewarded открыт: ${reason}`);
        },
        onRewarded: () => {
          console.log('Rewarded: награда получена!');
          wasRewarded = true;
        },
        onClose: () => {
          console.log(`Rewarded закрыт, награда: ${wasRewarded}`);
          unmuteAudio();
          gameplayStart();
          resolve({ rewarded: wasRewarded });
        },
        onError: (error) => {
          console.warn('Ошибка показа Rewarded:', error);
          unmuteAudio();
          gameplayStart();
          resolve({ rewarded: false });
        }
      }
    });
  });
}

/**
 * Сохранение данных игрока в облако
 * @param {object} data - данные для сохранения
 * @returns {Promise<boolean>} - успешно ли сохранено
 */
export async function savePlayerData(data) {
  if (!player) {
    // Fallback на localStorage в режиме разработки
    try {
      localStorage.setItem('gameData', JSON.stringify(data));
      console.log('Данные сохранены в localStorage (dev mode)');
      return true;
    } catch (error) {
      console.warn('Ошибка сохранения в localStorage:', error);
      return false;
    }
  }

  try {
    await player.setData(data, true); // flush: true для немедленной отправки
    console.log('Данные сохранены в облако');
    return true;
  } catch (error) {
    console.warn('Ошибка сохранения в облако:', error);
    return false;
  }
}

/**
 * Загрузка данных игрока из облака
 * @param {string[]} keys - ключи для загрузки (опционально)
 * @returns {Promise<object>} - загруженные данные
 */
export async function loadPlayerData(keys = null) {
  if (!player) {
    // Fallback на localStorage в режиме разработки
    try {
      const stored = localStorage.getItem('gameData');
      const data = stored ? JSON.parse(stored) : {};
      console.log('Данные загружены из localStorage (dev mode)');
      return data;
    } catch (error) {
      console.warn('Ошибка загрузки из localStorage:', error);
      return {};
    }
  }

  try {
    const data = keys ? await player.getData(keys) : await player.getData();
    console.log('Данные загружены из облака:', data);
    return data || {};
  } catch (error) {
    console.warn('Ошибка загрузки из облака:', error);
    return {};
  }
}

/**
 * Проверка, инициализирован ли SDK
 * @returns {boolean}
 */
export function isYandexSDKReady() {
  return isSDKInitialized && ysdk !== null;
}

/**
 * Получение объекта SDK (для расширенного использования)
 * @returns {object|null}
 */
export function getYSDK() {
  return ysdk;
}

/**
 * Показать другие игры разработчика
 * @returns {Promise<boolean>} - успешно ли открыто
 */
export async function showOtherGames() {
  if (!ysdk) {
    console.log('showOtherGames: SDK не инициализирован (режим разработки)');
    return false;
  }

  try {
    const result = await ysdk.features.GamesAPI?.getAllGames();
    if (result && result.developerURL) {
      // Открываем страницу разработчика
      window.open(result.developerURL, '_blank');
      return true;
    }
    console.warn('Не удалось получить ссылку на другие игры');
    return false;
  } catch (error) {
    console.warn('Ошибка показа других игр:', error);
    return false;
  }
}


/**
 * Проверить возможность запросить оценку игры
 * @returns {Promise<{canReview: boolean, reason: string|null}>}
 */
export async function canRequestReview() {
  if (!ysdk) {
    console.log('canRequestReview: SDK не инициализирован (режим разработки)');
    return { canReview: false, reason: 'NO_SDK' };
  }

  try {
    const result = await ysdk.feedback.canReview();
    return { canReview: result.value, reason: result.reason || null };
  } catch (error) {
    console.warn('Ошибка проверки возможности оценки:', error);
    return { canReview: false, reason: 'ERROR' };
  }
}

/**
 * Запросить оценку игры у пользователя
 * @returns {Promise<boolean>} - был ли показан диалог
 */
export async function requestGameReview() {
  if (!ysdk) {
    console.log('requestGameReview: SDK не инициализирован (режим разработки)');
    return false;
  }

  try {
    const { canReview } = await canRequestReview();
    if (canReview) {
      ysdk.feedback.requestReview();
      console.log('Запрос оценки игры отправлен');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Ошибка запроса оценки:', error);
    return false;
  }
}


/**
 * Показ рекламы за монеты в магазине (с кулдауном 2 минуты)
 * @returns {Promise<{rewarded: boolean, cooldown: boolean, remainingTime: number}>}
 */
export async function showShopRewardedAd() {
  const now = Date.now();
  const timeSinceLastAd = now - lastShopRewardedTime;

  // Проверяем кулдаун 2 минуты
  if (timeSinceLastAd < SHOP_REWARDED_COOLDOWN) {
    const remainingTime = Math.ceil((SHOP_REWARDED_COOLDOWN - timeSinceLastAd) / 1000);
    console.log(`Shop Rewarded пропущен: осталось ${remainingTime}с`);
    return { rewarded: false, cooldown: true, remainingTime };
  }

  // Показываем обычную rewarded рекламу
  const result = await showRewardedAd('shop_coins');
  
  if (result.rewarded) {
    lastShopRewardedTime = Date.now();
  }
  
  return { rewarded: result.rewarded, cooldown: false, remainingTime: 0 };
}

/**
 * Получить оставшееся время кулдауна рекламы в магазине
 * @returns {number} - секунды до следующей возможности
 */
export function getShopRewardedCooldown() {
  const now = Date.now();
  const timeSinceLastAd = now - lastShopRewardedTime;
  
  if (timeSinceLastAd >= SHOP_REWARDED_COOLDOWN) {
    return 0;
  }
  
  return Math.ceil((SHOP_REWARDED_COOLDOWN - timeSinceLastAd) / 1000);
}


// ==================== ПОКУПКИ ====================

/**
 * Инициализация системы покупок
 */
async function initPayments() {
  if (!ysdk) return;

  try {
    payments = await ysdk.getPayments();
    console.log('Система покупок инициализирована');
    
    // Загружаем каталог товаров
    await loadProductCatalog();
  } catch (error) {
    console.warn('Покупки недоступны:', error);
  }
}

/**
 * Загрузка каталога товаров
 */
async function loadProductCatalog() {
  if (!payments) return;

  try {
    productCatalog = await payments.getCatalog();
    console.log('Каталог товаров загружен:', productCatalog.length, 'товаров');
  } catch (error) {
    console.warn('Ошибка загрузки каталога:', error);
  }
}

/**
 * Получить цену товара из каталога (с валютой из SDK)
 * @param {string} productId - ID товара
 * @returns {{price: string, currencyImage: string}|null}
 */
export function getProductPrice(productId) {
  if (!productCatalog || productCatalog.length === 0) {
    return null;
  }

  const product = productCatalog.find(p => p.id === productId);
  if (!product) return null;

  return {
    price: product.price,
    priceValue: product.priceValue,
    currencyCode: product.priceCurrencyCode,
    currencyImage: product.getPriceCurrencyImage ? product.getPriceCurrencyImage('small') : null
  };
}

/**
 * Получить все цены из каталога
 * @returns {Object} - объект с ценами по ID
 */
export function getAllProductPrices() {
  const prices = {};
  
  if (!productCatalog || productCatalog.length === 0) {
    return prices;
  }

  productCatalog.forEach(product => {
    prices[product.id] = {
      price: product.price,
      priceValue: product.priceValue,
      currencyCode: product.priceCurrencyCode,
      currencyImage: product.getPriceCurrencyImage ? product.getPriceCurrencyImage('small') : null
    };
  });

  return prices;
}

/**
 * Совершить покупку
 * @param {string} productId - ID товара из консоли Яндекс
 * @returns {Promise<{success: boolean, error?: string, bonuses?: object}>}
 */
export async function makePurchase(productId) {
  if (!payments) {
    console.log('makePurchase (dev mode):', productId);
    // В режиме разработки симулируем успешную покупку
    const productData = PRODUCT_MAP[productId];
    if (productData) {
      // Симулируем начисление бонусов в dev mode
      if (productData.coins) {
        const currentCoins = parseInt(localStorage.getItem('gameCoins') || '0');
        localStorage.setItem('gameCoins', (currentCoins + productData.coins).toString());
      }
      if (productData.noAds) {
        isAdsDisabled = true;
      }
      // Обновляем подсказки в Game если есть
      if (productData.hints || productData.undos) {
        try {
          const { Game } = await import('./game_logic.js');
          if (productData.hints) {
            Game.hintCount += productData.hints;
          }
          if (productData.undos) {
            Game.undoCount += productData.undos;
          }
        } catch (e) {
          console.warn('Не удалось обновить подсказки:', e);
        }
      }
    }
    return { success: true, devMode: true, bonuses: productData };
  }

  try {
    const purchase = await payments.purchase({ id: productId });
    console.log('Покупка совершена:', purchase);

    // Обрабатываем покупку
    const bonuses = await processPurchase(purchase);
    
    // Обновляем подсказки в Game если были начислены
    if (bonuses.hints || bonuses.undos) {
      try {
        const { Game } = await import('./game_logic.js');
        if (bonuses.hints) {
          Game.hintCount += bonuses.hints;
        }
        if (bonuses.undos) {
          Game.undoCount += bonuses.undos;
        }
      } catch (e) {
        console.warn('Не удалось обновить подсказки:', e);
      }
    }

    return { success: true, bonuses };
  } catch (error) {
    console.warn('Ошибка покупки:', error);
    return { success: false, error: error.message || 'Покупка отменена' };
  }
}

/**
 * Обработка покупки и начисление бонусов
 * @param {object} purchase - объект покупки
 * @returns {Promise<object>} - данные о начисленных бонусах
 */
async function processPurchase(purchase) {
  const productId = purchase.productID;
  const productData = PRODUCT_MAP[productId];

  if (!productData) {
    console.warn('Неизвестный продукт:', productId);
    return {};
  }

  // Загружаем текущие данные
  const currentData = await loadPlayerData();
  const newData = { ...currentData };
  const bonuses = {};

  // Проверяем, была ли уже отключена реклама (для премиум набора)
  const wasAdsAlreadyDisabled = isAdsDisabled || currentData.noAds;

  // Начисляем бонусы
  if (productData.coins) {
    const currentCoins = parseInt(localStorage.getItem('gameCoins') || '0');
    const newCoins = currentCoins + productData.coins;
    localStorage.setItem('gameCoins', newCoins.toString());
    newData.coins = newCoins;
    bonuses.coins = productData.coins;
    console.log(`Начислено ${productData.coins} монет, всего: ${newCoins}`);
  }

  // Отключаем рекламу только если она ещё не была отключена
  // Для премиум набора: если реклама уже отключена - просто пропускаем этот бонус
  if (productData.noAds && !wasAdsAlreadyDisabled) {
    isAdsDisabled = true;
    newData.noAds = true;
    bonuses.noAds = true;
    console.log('Реклама отключена');
  } else if (productData.noAds && wasAdsAlreadyDisabled) {
    // Реклама уже была отключена ранее, просто обновляем флаг
    isAdsDisabled = true;
    newData.noAds = true;
    console.log('Реклама уже была отключена ранее, бонус пропущен');
  }

  if (productData.hints) {
    const currentHints = newData.hints || 2;
    newData.hints = currentHints + productData.hints;
    bonuses.hints = productData.hints;
    console.log(`Начислено ${productData.hints} подсказок`);
  }

  if (productData.undos) {
    const currentUndos = newData.undos || 2;
    newData.undos = currentUndos + productData.undos;
    bonuses.undos = productData.undos;
    console.log(`Начислено ${productData.undos} отмен`);
  }

  // Сохраняем в облако
  await savePlayerData(newData);

  // Консумируем покупку (для расходуемых товаров)
  if (productData.coins && !productData.noAds) {
    // Монеты - расходуемый товар, консумируем
    try {
      await payments.consumePurchase(purchase.purchaseToken);
      console.log('Покупка консумирована');
    } catch (error) {
      console.warn('Ошибка консумации:', error);
    }
  }
  // Для bez_rek и prem - не консумируем, это постоянные покупки
  
  return bonuses;
}

/**
 * Проверка и обработка необработанных покупок
 */
async function checkPendingPurchases() {
  if (!payments) return;

  try {
    const purchases = await payments.getPurchases();
    
    if (purchases && purchases.length > 0) {
      console.log('Найдено необработанных покупок:', purchases.length);
      
      for (const purchase of purchases) {
        // Проверяем постоянные покупки (без рекламы)
        if (purchase.productID === 'bez_rek' || purchase.productID === 'prem') {
          isAdsDisabled = true;
          const currentData = await loadPlayerData();
          if (!currentData.noAds) {
            await savePlayerData({ ...currentData, noAds: true });
          }
        }
        
        // Для расходуемых покупок - обрабатываем и консумируем
        const productData = PRODUCT_MAP[purchase.productID];
        if (productData && productData.coins && !productData.noAds) {
          await processPurchase(purchase);
        }
      }
    }
  } catch (error) {
    console.warn('Ошибка проверки покупок:', error);
  }
}

/**
 * Проверить, отключена ли реклама
 * @returns {boolean}
 */
export function isAdsDisabledByPurchase() {
  return isAdsDisabled;
}

/**
 * Установить флаг отключения рекламы (при загрузке из облака)
 * @param {boolean} disabled
 */
export function setAdsDisabled(disabled) {
  isAdsDisabled = disabled;
}
