import { initLayout } from './ui_layout.js';
import { updateScale } from './scale.js';
import './input.js';
import { initAudio } from './audio.js';
import { Game } from './game_logic.js';
import { initPlaygamaSDK, applyLanguageOnce, sendGameReadyOnce, loadPlayerData, setAdsDisabled, isVKPlatform, showStickyBanner } from './playgama_sdk.js';

// Глобальная защита от ошибок SDK
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message);
  
  // Игнорируем ошибки из внешних скриптов (SDK, реклама)
  if (event.filename && (
    event.filename.includes('playgama') ||
    event.filename.includes('vk.com') ||
    event.filename.includes('mail.ru') ||
    event.filename.includes('browser.js')
  )) {
    console.warn('Игнорируем ошибку из внешнего скрипта:', event.message);
    event.preventDefault();
    return true;
  }
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('load', async () => {
  console.log('=== GAME LOADING START ===');
  
  const root = document.getElementById('game-root');
  console.log('Root element:', root);
  
  // Инициализируем Playgama SDK
  try {
    console.log('Initializing Playgama SDK...');
    await initPlaygamaSDK();
    console.log('Playgama SDK initialized');
    
    applyLanguageOnce();
    console.log('Language applied');
  } catch (e) {
    console.warn('SDK initialization failed (local dev):', e);
  }
  
  // Инициализируем UI и аудио
  console.log('Initializing UI...');
  initLayout(root);
  console.log('UI initialized');
  
  console.log('Initializing audio...');
  initAudio();
  console.log('Audio initialized');
  
  console.log('Updating scale...');
  updateScale();
  console.log('Scale updated');
  
  // Загружаем сохранённые данные из облака
  console.log('Loading player data...');
  const savedData = await loadPlayerData();
  console.log('Player data loaded:', savedData);
  
  if (savedData.coins !== undefined) {
    localStorage.setItem('gameCoins', savedData.coins.toString());
  }
  
  // Загружаем флаг отключения рекламы
  if (savedData.noAds) {
    setAdsDisabled(true);
  }
  
  // Загружаем подсказки и отмены из облака
  console.log('Loading hints from cloud...');
  Game.loadHintsFromCloud(
    savedData.hints !== undefined ? savedData.hints : 3,
    savedData.undos !== undefined ? savedData.undos : 3
  );
  
  // Загружаем максимальный открытый уровень из облака
  if (savedData.maxLevel !== undefined) {
    Game.loadMaxLevelFromCloud(savedData.maxLevel);
  }
  
  // Запускаем игру с максимального открытого уровня
  console.log('Starting game...');
  const maxLevel = Game.getMaxLevel();
  console.log('Max level:', maxLevel);
  Game.startLevel(maxLevel);
  console.log('Game started');
  
  // Сообщаем платформе что игра готова
  console.log('Sending game ready signal...');
  sendGameReadyOnce();
  console.log('=== GAME LOADING COMPLETE ===');
  
  // Если платформа VK - добавляем класс к body и показываем баннер
  if (isVKPlatform()) {
    console.log('VK platform detected, adding class and showing banner...');
    document.body.classList.add('vk-platform');
    // Показываем sticky баннер внизу экрана
    await showStickyBanner();
  }
});

