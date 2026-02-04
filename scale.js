import { DESIGN_WIDTH, DESIGN_HEIGHT, ORIENTATION_MODE, MOBILE_PORTRAIT_WIDTH, MOBILE_PORTRAIT_HEIGHT } from './config.js';

let currentScale = 1;
let offsetX = 0;
let offsetY = 0;
let currentTargetWidth = DESIGN_WIDTH;
let currentTargetHeight = DESIGN_HEIGHT;

// Базовые размеры контента для мобильного портрета (исходные 720x1280)
const MOBILE_CONTENT_WIDTH = DESIGN_HEIGHT; // 720
const MOBILE_CONTENT_HEIGHT = DESIGN_WIDTH; // 1280

// Определение мобильного устройства
export function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
}

// Получение безопасных размеров viewport (учёт iOS safe-area)
function getViewportSize() {
  // Используем visualViewport если доступен (лучше для мобильных)
  if (window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

export function updateScale() {
  const root = document.getElementById('game-root');
  if (!root) return;
  
  const { width: vw, height: vh } = getViewportSize();
  const isMobile = isMobileDevice();
  const isPortrait = vh > vw;

  let targetWidth = DESIGN_WIDTH;
  let targetHeight = DESIGN_HEIGHT;

  // На мобильных в портретной ориентации используем новые размеры 750x1460
  // Контент остается 720x1280, но canvas расширяется для дополнительного пространства
  if (isMobile && isPortrait) {
    targetWidth = MOBILE_PORTRAIT_WIDTH;   // 750
    targetHeight = MOBILE_PORTRAIT_HEIGHT; // 1460
  }

  currentTargetWidth = targetWidth;
  currentTargetHeight = targetHeight;

  // Вычисляем масштаб для заполнения экрана
  let scale = Math.min(vw / targetWidth, vh / targetHeight);
  
  // На ПК ограничиваем масштаб до 1, на мобильных разрешаем увеличение
  if (!isMobile && scale > 1) {
    scale = 1;
  }

  currentScale = scale;

  const scaledWidth = targetWidth * scale;
  const scaledHeight = targetHeight * scale;

  // Центрирование
  offsetX = (vw - scaledWidth) / 2;
  offsetY = (vh - scaledHeight) / 2;

  root.style.width = `${targetWidth}px`;
  root.style.height = `${targetHeight}px`;
  root.style.transform = `scale(${scale})`;
  root.style.transformOrigin = 'top left';
  root.style.position = 'absolute';
  root.style.left = `${offsetX}px`;
  root.style.top = `${offsetY}px`;
  
  // Добавляем/убираем класс для портретного режима на мобильных
  if (isMobile && isPortrait) {
    document.body.classList.add('mobile-portrait');
  } else {
    document.body.classList.remove('mobile-portrait');
  }
}

export function screenToGameCoords(screenX, screenY) {
  // Преобразование экранных координат в координаты игры
  const x = (screenX - offsetX) / currentScale;
  const y = (screenY - offsetY) / currentScale;
  return { x, y };
}

export function getScaleInfo() {
  return {
    scale: currentScale,
    offsetX: offsetX,
    offsetY: offsetY,
    targetWidth: currentTargetWidth,
    targetHeight: currentTargetHeight
  };
}

// Инициализация при загрузке
function initScale() {
  updateScale();
  
  // Обработка visualViewport для мобильных (лучше чем resize)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateScale);
    window.visualViewport.addEventListener('scroll', updateScale);
  }
}

window.addEventListener('load', initScale);
window.addEventListener('resize', updateScale);
window.addEventListener('orientationchange', () => {
  // Задержка для корректного определения размеров после поворота
  setTimeout(updateScale, 100);
  setTimeout(updateScale, 300);
});

