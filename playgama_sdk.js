/**
 * Обёртка для Playgama Bridge SDK
 * Документация: https://docs.playgama.com/
 */

// Глобальная переменная bridge будет доступна после загрузки playgama-bridge.js
let bridge = null;
let isInitialized = false;
let languageApplied = false;
let gameReadySent = false;
let lastInterstitialTime = 0;
let lastShopRewardedTime = 0;
let isAdsDisabled = false;

const INTERSTITIAL_COOLDOWN = 90000; // 90 секунд
const SHOP_REWARDED_COOLDOWN = 600000; // 10 минут

/**
 * Ожидание загрузки Playgama Bridge
 */
async function waitForBridge() {
  return new Promise((resolve) => {
    if (typeof window.bridge !== 'undefined') {
      resolve(window.bridge);
      return;
    }
    
    // Ждём максимум 3 секунды
    let attempts = 0;
    const maxAttempts = 30;
    
    const interval = setInterval(() => {
      attempts++;
      
      if (typeof window.bridge !== 'undefined') {
        clearInterval(interval);
        resolve(window.bridge);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('Playgama Bridge не загружен за 3 секунды');
        resolve(null);
      }
    }, 100);
  });
}

/**
 * Инициализация Playgama Bridge SDK
 */
export async function initPlaygamaSDK() {
  if (isInitialized && bridge) {
    return bridge;
  }

  try {
    console.log('Ожидание загрузки Playgama Bridge...');
    
    // Ждём загрузки bridge из глобального скрипта
    bridge = await waitForBridge();
    
    if (!bridge) {
      console.warn('Playgama Bridge не загружен. Работаем в режиме разработки.');
      isInitialized = true; // Помечаем как инициализированный, чтобы игра запустилась
      return null;
    }

    console.log('Playgama Bridge найден, инициализируем...');
    
    // Инициализируем bridge
    await bridge.initialize();
    isInitialized = true;
    
    console.log('Playgama Bridge инициализирован');
    console.log('Platform:', bridge.platform.id);
    console.log('Language:', bridge.platform.language);
    
    return bridge;
  } catch (error) {
    console.error('Ошибка инициализации Playgama Bridge:', error);
    isInitialized = true; // Помечаем как инициализированный, чтобы игра запустилась
    return null;
  }
}

/**
 * Применить язык один раз
 */
export function applyLanguageOnce() {
  if (languageApplied) return;
  languageApplied = true;
  
  if (!bridge) {
    console.log('Language applied (dev mode): ru');
    return;
  }
  
  try {
    const lang = bridge.platform.language || 'ru';
    // Импортируем setLang динамически
    import('./localization.js').then(({ setLang }) => {
      const gameLang = lang === 'ru' ? 'ru' : 'en';
      setLang(gameLang);
      console.log(`Язык игры установлен: ${gameLang}`);
    });
  } catch (error) {
    console.warn('Ошибка установки языка:', error);
  }
}

/**
 * Отправить сигнал "игра готова" один раз
 */
export function sendGameReadyOnce() {
  if (gameReadySent) return;
  gameReadySent = true;
  
  if (!bridge) {
    console.log('gameReady (dev mode)');
    return;
  }
  
  try {
    bridge.platform.sendMessage('game_ready');
    console.log('Game ready signal sent');
  } catch (error) {
    console.warn('Ошибка отправки game_ready:', error);
  }
}

/**
 * Сигнал о начале геймплея
 */
export function gameplayStart() {
  if (!bridge) return;
  
  try {
    bridge.platform.sendMessage('gameplay_started');
  } catch (error) {
    console.warn('Ошибка gameplayStart:', error);
  }
}

/**
 * Сигнал об остановке геймплея
 */
export function gameplayStop() {
  if (!bridge) return;
  
  try {
    bridge.platform.sendMessage('gameplay_stopped');
  } catch (error) {
    console.warn('Ошибка gameplayStop:', error);
  }
}

/**
 * Показать межстраничную рекламу
 */
export async function showInterstitialAd(reason = '') {
  // Проверяем, отключена ли реклама
  if (isAdsDisabled) {
    console.log('Реклама отключена покупкой');
    return { shown: false };
  }
  
  // Проверяем кулдаун
  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN) {
    console.log('Interstitial cooldown active');
    return { shown: false };
  }
  
  if (!bridge) {
    console.log('showInterstitialAd (dev mode):', reason);
    return { shown: true };
  }
  
  try {
    gameplayStop();
    await bridge.advertisement.showInterstitial();
    lastInterstitialTime = Date.now();
    gameplayStart();
    return { shown: true };
  } catch (error) {
    console.warn('Ошибка показа interstitial:', error);
    gameplayStart();
    return { shown: false };
  }
}

/**
 * Показать rewarded рекламу
 */
export async function showRewardedAd(reason = '') {
  if (!bridge) {
    console.log('showRewardedAd (dev mode):', reason);
    return { rewarded: true };
  }
  
  try {
    gameplayStop();
    await bridge.advertisement.showRewarded();
    gameplayStart();
    return { rewarded: true };
  } catch (error) {
    console.warn('Ошибка показа rewarded:', error);
    gameplayStart();
    return { rewarded: false };
  }
}

/**
 * Показать rewarded рекламу в магазине (с кулдауном)
 */
export async function showShopRewardedAd() {
  const now = Date.now();
  const timeSinceLastAd = now - lastShopRewardedTime;
  
  if (timeSinceLastAd < SHOP_REWARDED_COOLDOWN) {
    const remainingTime = Math.ceil((SHOP_REWARDED_COOLDOWN - timeSinceLastAd) / 1000);
    return { rewarded: false, cooldown: true, remainingTime };
  }
  
  const result = await showRewardedAd('shop_coins');
  
  if (result.rewarded) {
    lastShopRewardedTime = Date.now();
  }
  
  return { rewarded: result.rewarded, cooldown: false, remainingTime: 0 };
}

/**
 * Получить оставшееся время кулдауна для rewarded в магазине
 */
export function getShopRewardedCooldown() {
  const now = Date.now();
  const timeSinceLastAd = now - lastShopRewardedTime;
  
  if (timeSinceLastAd >= SHOP_REWARDED_COOLDOWN) {
    return 0;
  }
  
  return Math.ceil((SHOP_REWARDED_COOLDOWN - timeSinceLastAd) / 1000);
}

/**
 * Сохранить данные игрока в облако
 */
export async function savePlayerData(data) {
  if (!bridge) {
    console.log('savePlayerData (dev mode):', data);
    // Fallback на localStorage
    try {
      localStorage.setItem('cloudSave', JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Ошибка сохранения в localStorage:', error);
      return false;
    }
  }
  
  try {
    await bridge.storage.set(data);
    console.log('Данные сохранены в облако');
    return true;
  } catch (error) {
    console.warn('Ошибка сохранения в облако:', error);
    return false;
  }
}

/**
 * Загрузить данные игрока из облака
 */
export async function loadPlayerData() {
  if (!bridge) {
    console.log('loadPlayerData (dev mode)');
    // Fallback на localStorage
    try {
      const saved = localStorage.getItem('cloudSave');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Ошибка загрузки из localStorage:', error);
      return {};
    }
  }
  
  try {
    const data = await bridge.storage.get();
    console.log('Данные загружены из облака:', data);
    return data || {};
  } catch (error) {
    console.warn('Ошибка загрузки из облака:', error);
    return {};
  }
}

/**
 * Покупка товара
 */
export async function makePurchase(productId) {
  if (!bridge) {
    console.log('makePurchase (dev mode):', productId);
    return { success: true, bonuses: {} };
  }
  
  try {
    const result = await bridge.payments.purchase({ id: productId });
    console.log('Покупка успешна:', result);
    return { success: true, bonuses: result };
  } catch (error) {
    console.warn('Ошибка покупки:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Получить цену товара
 */
export function getProductPrice(productId) {
  if (!bridge) {
    return { price: '99 ₽', currencyImage: '' };
  }
  
  try {
    // Playgama Bridge может предоставлять каталог товаров
    return { price: '99 ₽', currencyImage: '' };
  } catch (error) {
    return null;
  }
}

/**
 * Получить все цены товаров
 */
export function getAllProductPrices() {
  if (!bridge) {
    return {};
  }
  
  return {};
}

/**
 * Проверка, отключена ли реклама
 */
export function isAdsDisabledByPurchase() {
  return isAdsDisabled;
}

/**
 * Установить флаг отключения рекламы
 */
export function setAdsDisabled(disabled) {
  isAdsDisabled = disabled;
  console.log('Реклама отключена:', disabled);
}

/**
 * Проверка, является ли платформа VK
 */
export function isVKPlatform() {
  if (!bridge) return false;
  return bridge.platform.id === 'vk';
}

/**
 * Открыть группу VK
 */
export function openVKGroup() {
  console.log('openVKGroup called, bridge:', !!bridge, 'isVK:', isVKPlatform());
  
  if (!bridge || !isVKPlatform()) {
    console.log('openVKGroup: not available on this platform');
    return;
  }
  
  try {
    // Используем ID группы из конфига
    const groupId = 217329390;
    console.log('Opening VK group via bridge:', groupId);
    bridge.social.joinCommunity({ groupId });
  } catch (error) {
    console.warn('Ошибка openVKGroup:', error);
    // Fallback - открываем через прямую ссылку
    try {
      window.open('https://vk.com/public217329390', '_blank');
    } catch (e) {
      console.warn('Не удалось открыть группу:', e);
    }
  }
}

/**
 * Поделиться в VK
 */
export function shareVK() {
  if (!bridge || !isVKPlatform()) {
    console.log('shareVK: not available');
    return;
  }
  
  try {
    bridge.social.share();
  } catch (error) {
    console.warn('Ошибка shareVK:', error);
  }
}

// Заглушки для совместимости
export function isYandexSDKReady() {
  return isInitialized;
}

export function getYSDK() {
  return bridge;
}

export async function showOtherGames() {
  console.log('showOtherGames: not implemented');
}

export async function canRequestReview() {
  return { canReview: false, reason: 'not_implemented' };
}

export async function requestGameReview() {
  console.log('requestGameReview: not implemented');
  return false;
}
