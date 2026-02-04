import { isMobileDevice } from './scale.js';
import { Game } from './game_logic.js';

// Блокировка контекстного меню
document.addEventListener('contextmenu', e => e.preventDefault());

// Блокировка drag
document.addEventListener('dragstart', e => e.preventDefault());

// Блокировка выделения текста
document.addEventListener('selectstart', e => e.preventDefault());

// Блокировка скролла и нативных жестов на мобильных
// НО разрешаем клики на кнопках и интерактивных элементах
document.addEventListener('touchstart', e => {
  const isScrollable = e.target.closest('.scrollable');
  const isButton = e.target.closest('button, .btn-image, .clickable-box, .shop-item, .shop-coin-item, .sound-toggle, .btn-menu, #deck, .card');
  // Не блокируем если это кнопка или скроллируемая область
  if (!isScrollable && !isButton) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchmove', e => {
  const isScrollable = e.target.closest('.scrollable');
  if (!isScrollable) {
    e.preventDefault();
  }
}, { passive: false });

// Блокировка двойного тапа для зума на iOS
document.addEventListener('dblclick', e => {
  if (isMobileDevice()) {
    e.preventDefault();
  }
}, { passive: false });

// Блокировка жестов масштабирования
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });

const root = document.getElementById('game-root');

// Защита от двойных нажатий на колоду (для мобильных)
let lastDeckClickTime = 0;
const DECK_CLICK_COOLDOWN = 400; // мс между нажатиями на колоду

let dragState = {
  isDragging: false,
  draggedCards: [],
  sourceInfo: null,
  startX: 0,
  startY: 0,
  dragContainer: null,
  originalElements: [],
};

// Получение координат из события (поддержка touch и mouse)
function getEventCoords(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

root.addEventListener('pointerdown', e => {
  // Захватываем pointer для корректной работы на мобильных
  if (e.target.setPointerCapture && e.pointerId !== undefined) {
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (err) {
      // Игнорируем ошибки захвата
    }
  }
  
  const deckEl = e.target.closest('#deck');
  if (deckEl) {
    // Защита от двойных нажатий на мобильных
    const now = Date.now();
    if (now - lastDeckClickTime < DECK_CLICK_COOLDOWN) {
      return; // Игнорируем слишком быстрые нажатия
    }
    lastDeckClickTime = now;
    
    // Проверяем что это не кнопка повтора колоды (она обрабатывается отдельно)
    const reshuffleBtn = e.target.closest('.btn-reshuffle-deck');
    if (reshuffleBtn) {
      return; // Кнопка повтора обрабатывается своим обработчиком
    }
    
    Game.onDeckClick();
    return;
  }

  const cardEl = e.target.closest('.card');
  if (cardEl && !cardEl.classList.contains('card--deck') && !cardEl.classList.contains('card--in-slot')) {
    startDrag(e, cardEl);
    return;
  }
});

document.addEventListener('pointermove', e => {
  if (dragState.isDragging) {
    updateDrag(e);
  }
}, { passive: false });

document.addEventListener('pointerup', e => {
  if (dragState.isDragging) {
    endDrag(e);
  }
});

document.addEventListener('pointercancel', e => {
  if (dragState.isDragging) {
    cleanupDrag(false, null);
  }
});

function startDrag(e, cardEl) {
  const cardId = cardEl.dataset.cardId;
  const zone = cardEl.dataset.zone;
  const pileIndex = Number(cardEl.dataset.pileIndex ?? -1);

  const sourceInfo = { zone, pileIndex };
  const cardsToGrab = Game.getCardsToGrab(cardId, sourceInfo);

  if (cardsToGrab.length === 0) return;

  dragState.isDragging = true;
  dragState.draggedCards = cardsToGrab;
  dragState.sourceInfo = sourceInfo;
  dragState.startX = e.clientX;
  dragState.startY = e.clientY;

  prepareDragContainer(cardsToGrab, zone, pileIndex);

  document.body.style.cursor = 'grabbing';
  
  // Уведомляем туториал о начале перетаскивания
  import('./tutorial.js').then(({ Tutorial }) => {
    Tutorial.onDragStart();
  }).catch(() => {});
}

function updateDrag(e) {
  if (!dragState.dragContainer) return;

  const offsetX = e.clientX - dragState.startX;
  const offsetY = e.clientY - dragState.startY;

  dragState.dragContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

async function endDrag(e) {
  const target = findDropTarget(e);

  let shouldAnimate = false;
  // координаты по умолчанию — позиция курсора
  let dropCenter = { x: e.clientX, y: e.clientY };

  // если есть целевой элемент — берем его центр
  if (target) {
    if (target.type === 'slot') {
      const slotEl = document.querySelectorAll('#category-slots .category-slot')[target.slotIndex];
      if (slotEl) {
        const r = slotEl.getBoundingClientRect();
        dropCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    } else if (target.type === 'card') {
      const cardEl = document.querySelector(`.card[data-card-id="${target.cardId}"]`);
      if (cardEl) {
        const r = cardEl.getBoundingClientRect();
        dropCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    } else if (target.type === 'pile') {
      const pileEl = document.querySelector(`.pile[data-pile-index="${target.pileIndex}"]`);
      if (pileEl) {
        const r = pileEl.getBoundingClientRect();
        dropCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
  }

  if (target) {
    shouldAnimate = await Game.onCardsDrop(dragState.draggedCards, dragState.sourceInfo, target) === true;
    
    // Уведомляем туториал о завершении перетаскивания и определяем тип действия
    import('./tutorial.js').then(({ Tutorial }) => {
      const firstCardId = dragState.draggedCards[0];
      const firstCard = Game.state.cardsById[firstCardId];
      
      if (firstCard) {
        if (firstCard.type === 'CATEGORY' && target.type === 'slot') {
          Tutorial.onCategoryPlaced();
        } else if (firstCard.type === 'WORD' && target.type === 'slot') {
          Tutorial.onCardPlacedInCategory();
        } else if (firstCard.type === 'WORD' && target.type === 'card') {
          Tutorial.onCardsStacked();
        }
      }
      
      Tutorial.onDragEnd();
      
      // Обновляем туториал после завершения действия
      // Задержка увеличена чтобы карты успели открыться
      setTimeout(() => {
        Tutorial.update();
      }, 300);
    }).catch(() => {});
  } else {
    // Перетаскивание отменено
    import('./tutorial.js').then(({ Tutorial }) => {
      Tutorial.onDragEnd();
    }).catch(() => {});
  }

  cleanupDrag(shouldAnimate, dropCenter);
}

function findDropTarget(e) {
  if (dragState.dragContainer) {
    dragState.dragContainer.style.display = 'none';
  }

  const elementUnder = document.elementFromPoint(e.clientX, e.clientY);

  if (dragState.dragContainer) {
    dragState.dragContainer.style.display = 'block';
  }

  const cardUnder = elementUnder?.closest('.card');
  if (cardUnder && !dragState.draggedCards.includes(cardUnder.dataset.cardId)) {
    const targetCardId = cardUnder.dataset.cardId;
    const targetZone = cardUnder.dataset.zone;
    const targetPileIndex = Number(cardUnder.dataset.pileIndex ?? -1);
    return { type: 'card', cardId: targetCardId, zone: targetZone, pileIndex: targetPileIndex };
  }

  const pileUnder = elementUnder?.closest('.pile');
  if (pileUnder) {
    const pileIndex = Number(pileUnder.dataset.pileIndex);
    return { type: 'pile', pileIndex };
  }

  const slotUnder = elementUnder?.closest('.category-slot');
  if (slotUnder) {
    const slotIndex = Array.from(slotUnder.parentElement.children).indexOf(slotUnder);
    return { type: 'slot', slotIndex };
  }

  return null;
}

function prepareDragContainer(cardIds, zone, pileIndex) {
  dragState.originalElements = [];

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '10000';
  container.style.left = '0';
  container.style.top = '0';

  let minX = Infinity;
  let minY = Infinity;

  const cardElements = [];

  cardIds.forEach(cardId => {
    const selector = `.card[data-card-id="${cardId}"][data-zone="${zone}"][data-pile-index="${pileIndex}"]`;
    const cardEl = document.querySelector(selector);
    
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      
      if (rect.left < minX) minX = rect.left;
      if (rect.top < minY) minY = rect.top;

      cardElements.push({
        element: cardEl,
        rect: rect,
      });

      dragState.originalElements.push(cardEl);
      cardEl.style.visibility = 'hidden';
    }
  });

  container.style.left = `${minX}px`;
  container.style.top = `${minY}px`;

  // Базовый размер карты (без CSS увеличений для mobile-portrait)
  // Это размер карты в DOM (77px), но внутренние элементы уже увеличены на 5%
  // На мобильных в портретной ориентации emoji увеличены ещё на 50% (кроме закрытых карт)
  const BASE_CARD_WIDTH = 77;
  const BASE_EMOJI_SIZE = 47.25;  // 30 * 1.05 * 1.5 (увеличено на 50% для mobile-portrait)
  const BASE_EMOJI_COVERED_SIZE = 18.9;  // 18 * 1.05 (БЕЗ увеличения на 50% для видимости в стопках)
  const BASE_TITLE_SIZE = 11;  // 10.5 * 1.05
  const BASE_ICON_SIZE = 24.15;  // 23 * 1.05
  const BASE_ICON_COVERED_SIZE = 15.75;  // 15 * 1.05
  const BASE_PROGRESS_SIZE = 18.9;  // 9.45 * 2 (увеличено в 2 раза для мобильных)
  const BASE_CROWN_SIZE = 15.75;  // 15 * 1.05
  
  cardElements.forEach(({ element, rect }) => {
    const clone = element.cloneNode(true);
    clone.classList.remove('card--flip', 'card--will-flip');
    // Добавляем класс для фантома чтобы отключить CSS правила mobile-portrait
    clone.classList.add('card--drag-phantom');
    clone.style.position = 'absolute';
    clone.style.left = `${rect.left - minX}px`;
    clone.style.top = `${rect.top - minY}px`;
    // Используем cssText для установки !important
    clone.style.cssText += `
      width: ${rect.width}px !important;
      height: ${rect.height}px !important;
      position: absolute !important;
      left: ${rect.left - minX}px !important;
      top: ${rect.top - minY}px !important;
      margin: 0 !important;
      opacity: 1 !important;
      visibility: visible !important;
      animation: none !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    `;
    
    // Вычисляем коэффициент масштабирования внутренних элементов
    // Фантом получает визуальные размеры карты (rect.width/height)
    // Внутренние элементы должны масштабироваться пропорционально
    const scaleRatio = rect.width / BASE_CARD_WIDTH;
    const isCovered = element.classList.contains('card--covered');
    
    const cloneEmoji = clone.querySelector('.card-emoji');
    if (cloneEmoji) {
      const baseSize = isCovered ? BASE_EMOJI_COVERED_SIZE : BASE_EMOJI_SIZE;
      cloneEmoji.style.cssText += `font-size: ${baseSize * scaleRatio}px !important;`;
    }
    
    const cloneTitle = clone.querySelector('.card-title');
    if (cloneTitle) {
      cloneTitle.style.cssText += `font-size: ${BASE_TITLE_SIZE * scaleRatio}px !important;`;
    }
    
    const cloneIcon = clone.querySelector('.card-icon');
    if (cloneIcon) {
      const baseSize = isCovered ? BASE_ICON_COVERED_SIZE : BASE_ICON_SIZE;
      cloneIcon.style.cssText += `font-size: ${baseSize * scaleRatio}px !important;`;
    }
    
    const cloneProgress = clone.querySelector('.card-progress');
    if (cloneProgress) {
      cloneProgress.style.cssText += `font-size: ${BASE_PROGRESS_SIZE * scaleRatio}px !important;`;
    }
    
    const cloneCrown = clone.querySelector('.card-crown');
    if (cloneCrown) {
      cloneCrown.style.cssText += `font-size: ${BASE_CROWN_SIZE * scaleRatio}px !important;`;
    }
    
    const cloneJokerImg = clone.querySelector('.card-joker-image');
    if (cloneJokerImg) {
      cloneJokerImg.style.cssText += `width: ${60 * scaleRatio}px !important; height: ${60 * scaleRatio}px !important;`;
    }
    
    // Счётчик вместимости категории
    const cloneCapacityBadge = clone.querySelector('.card-capacity-badge');
    if (cloneCapacityBadge) {
      const badgeSize = 12 * scaleRatio;
      cloneCapacityBadge.style.cssText += `font-size: ${badgeSize}px !important;`;
    }
    
    container.appendChild(clone);
  });

  document.body.appendChild(container);
  dragState.dragContainer = container;
}

function cleanupDrag(shouldAnimate = false, dropCenter = null) {
  if (dragState.dragContainer) {
    if (shouldAnimate) {
      // играть анимацию растворения на клонах в контейнере
      if (dropCenter && dropCenter.x !== null && dropCenter.y !== null) {
        const firstChild = dragState.dragContainer.firstElementChild;
        const childRect = firstChild ? firstChild.getBoundingClientRect() : { width: 0, height: 0 };
        const w = childRect.width;
        const h = childRect.height;
        dragState.dragContainer.style.left = `${dropCenter.x - w / 2}px`;
        dragState.dragContainer.style.top = `${dropCenter.y - h / 2}px`;
        dragState.dragContainer.style.width = `${w}px`;
        dragState.dragContainer.style.height = `${h}px`;
        dragState.dragContainer.style.transform = 'translate(0, 0)';
      }
      Array.from(dragState.dragContainer.children).forEach(child => {
        child.classList.remove('card--flip', 'card--will-flip');
        child.style.animation = '';
        child.style.left = '0px';
        child.style.top = '0px';
        child.style.transform = 'translate(0, 0)';
        child.classList.add('card--dissolve');
      });
      const containerToRemove = dragState.dragContainer;
      setTimeout(() => {
        containerToRemove.remove();
      }, 700);
    } else {
      dragState.dragContainer.remove();
    }
    dragState.dragContainer = null;
  }

  if (!shouldAnimate) {
    dragState.originalElements.forEach(el => {
      el.style.visibility = '';
      el.style.animation = '';
      el.classList.remove('card--flip', 'card--will-flip');
    });
  }

  dragState.isDragging = false;
  dragState.draggedCards = [];
  dragState.sourceInfo = null;
  dragState.originalElements = [];

  document.body.style.cursor = '';
}
