// Система туториала для первого уровня
import { Game } from './game_logic.js';
import { isMobileDevice } from './scale.js';

const Tutorial = {
  isActive: false,
  completedSteps: new Set(), // Завершённые шаги обучения
  currentPhantom: null, // Текущий активный фантом
  isDragging: false, // Флаг перетаскивания карты игроком
  
  // 4 шага обучения
  STEPS: {
    PLACE_CATEGORY: 'place_category', // Положить категорию в слот
    STACK_CARDS: 'stack_cards', // Сложить карты одной категории
    PLACE_IN_CATEGORY: 'place_in_category', // Положить карту в категорию
    OPEN_DECK: 'open_deck' // Открыть колоду
  },

  // Инициализация туториала
  init() {
    if (Game.state.levelId !== 1) {
      this.isActive = false;
      return;
    }
    
    this.isActive = true;
    this.completedSteps.clear();
    this.currentPhantom = null;
    this.isDragging = false;
  },

  // Проверка завершения туториала
  isCompleted() {
    return this.completedSteps.size >= 4;
  },

  // Отметить шаг как завершённый
  completeStep(step) {
    if (!this.isActive) return;
    
    this.completedSteps.add(step);
    
    // Убираем текущий фантом
    this.removePhantom();
    
    if (this.isCompleted()) {
      this.isActive = false;
    } else {
      // Показываем следующую подсказку через задержку
      // Увеличена до 800мс чтобы карты успели открыться
      setTimeout(() => {
        this.update();
      }, 800);
    }
  },

  // Уведомление о начале перетаскивания
  onDragStart() {
    this.isDragging = true;
    this.removePhantom();
  },

  // Уведомление об окончании перетаскивания
  onDragEnd() {
    this.isDragging = false;
  },

  // Обновление туториала (вызывается после рендера)
  update() {
    if (!this.isActive || this.isCompleted() || this.isDragging) {
      return;
    }

    // Если уже есть активный фантом - не показываем новый
    if (this.currentPhantom) {
      return;
    }

    const state = Game.state;

    // Проверяем условия для каждого шага
    
    // 1. Показать как положить категорию в слот
    if (!this.completedSteps.has(this.STEPS.PLACE_CATEGORY)) {
      const topCategory = this.findTopCategoryCard();
      if (topCategory && this.hasEmptySlot()) {
        this.showCategoryToSlotPhantom(topCategory);
        return;
      }
    }

    // 2. Показать как складывать карты одной категории
    if (!this.completedSteps.has(this.STEPS.STACK_CARDS)) {
      const stackableCards = this.findStackableCards();
      if (stackableCards) {
        this.showStackCardsPhantom(stackableCards);
        return;
      }
    }

    // 3. Показать как положить карту в категорию
    if (!this.completedSteps.has(this.STEPS.PLACE_IN_CATEGORY)) {
      const cardForCategory = this.findCardForCategory();
      if (cardForCategory) {
        this.showCardToCategoryPhantom(cardForCategory);
        return;
      }
    }

    // 4. Показать как открыть колоду
    if (!this.completedSteps.has(this.STEPS.OPEN_DECK)) {
      if (!this.hasAvailableActions() && state.deck.length > 0) {
        this.showOpenDeckPhantom();
        return;
      }
    }
  },

  // Найти верхнюю карту категории
  findTopCategoryCard() {
    const state = Game.state;
    
    // Проверяем discard
    if (state.discard.length > 0) {
      const topCardId = state.discard[state.discard.length - 1];
      const card = state.cardsById[topCardId];
      if (card && card.type === 'CATEGORY') {
        return { cardId: topCardId, zone: 'discard' };
      }
    }

    // Проверяем стопки
    for (let i = 0; i < state.piles.length; i++) {
      const pile = state.piles[i];
      if (pile.length > 0) {
        const topCardId = pile[pile.length - 1];
        const card = state.cardsById[topCardId];
        if (card && card.type === 'CATEGORY') {
          return { cardId: topCardId, zone: 'pile', pileIndex: i };
        }
      }
    }

    return null;
  },

  // Проверить наличие пустого слота
  hasEmptySlot() {
    return Game.state.categorySlots.some(slot => slot === null);
  },

  // Найти карты для складывания
  findStackableCards() {
    const state = Game.state;
    
    // Проверяем discard
    if (state.discard.length > 0) {
      const topCardId = state.discard[state.discard.length - 1];
      const topCard = state.cardsById[topCardId];
      
      if (topCard && topCard.type === 'WORD') {
        // Ищем карту той же категории в стопках
        for (let i = 0; i < state.piles.length; i++) {
          const pile = state.piles[i];
          if (pile.length > 0) {
            const pileTopId = pile[pile.length - 1];
            const pileTopCard = state.cardsById[pileTopId];
            
            if (pileTopCard && pileTopCard.type === 'WORD' && 
                pileTopCard.categoryId === topCard.categoryId) {
              return {
                sourceCardId: topCardId,
                sourceZone: 'discard',
                targetCardId: pileTopId,
                targetZone: 'pile',
                targetPileIndex: i
              };
            }
          }
        }
      }
    }

    // Проверяем между стопками
    for (let i = 0; i < state.piles.length; i++) {
      const pile = state.piles[i];
      if (pile.length > 0) {
        const topCardId = pile[pile.length - 1];
        const topCard = state.cardsById[topCardId];
        
        if (topCard && topCard.type === 'WORD') {
          for (let j = 0; j < state.piles.length; j++) {
            if (i === j) continue;
            
            const otherPile = state.piles[j];
            if (otherPile.length > 0) {
              const otherTopId = otherPile[otherPile.length - 1];
              const otherTopCard = state.cardsById[otherTopId];
              
              if (otherTopCard && otherTopCard.type === 'WORD' && 
                  otherTopCard.categoryId === topCard.categoryId) {
                return {
                  sourceCardId: topCardId,
                  sourceZone: 'pile',
                  sourcePileIndex: i,
                  targetCardId: otherTopId,
                  targetZone: 'pile',
                  targetPileIndex: j
                };
              }
            }
          }
        }
      }
    }

    return null;
  },

  // Найти карту для размещения в категории
  findCardForCategory() {
    const state = Game.state;
    
    // Проверяем что есть хотя бы одна активная категория в слоте
    const activeSlot = state.categorySlots.find(slot => slot !== null);
    if (!activeSlot) return null;

    // Проверяем discard
    if (state.discard.length > 0) {
      const topCardId = state.discard[state.discard.length - 1];
      const topCard = state.cardsById[topCardId];
      
      if (topCard && topCard.type === 'WORD' && topCard.categoryId === activeSlot.categoryId) {
        return {
          cardId: topCardId,
          zone: 'discard',
          slotIndex: activeSlot.slotIndex
        };
      }
    }

    // Проверяем стопки
    for (let i = 0; i < state.piles.length; i++) {
      const pile = state.piles[i];
      if (pile.length > 0) {
        const topCardId = pile[pile.length - 1];
        const topCard = state.cardsById[topCardId];
        
        if (topCard && topCard.type === 'WORD' && topCard.categoryId === activeSlot.categoryId) {
          return {
            cardId: topCardId,
            zone: 'pile',
            pileIndex: i,
            slotIndex: activeSlot.slotIndex
          };
        }
      }
    }

    return null;
  },

  // Проверить наличие доступных действий
  hasAvailableActions() {
    return this.findTopCategoryCard() || this.findStackableCards() || this.findCardForCategory();
  },

  // Показать фантом для размещения категории в слот
  showCategoryToSlotPhantom(cardInfo) {
    const cardEl = this.getCardElement(cardInfo);
    if (!cardEl) return;

    const emptySlotIndex = Game.state.categorySlots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) return;

    const slotEl = document.querySelectorAll('#category-slots .category-slot')[emptySlotIndex];
    if (!slotEl) return;

    this.createPhantom(cardEl, slotEl, 'category-to-slot');
  },

  // Показать фантом для складывания карт
  showStackCardsPhantom(cardsInfo) {
    const sourceEl = this.getCardElement({
      cardId: cardsInfo.sourceCardId,
      zone: cardsInfo.sourceZone,
      pileIndex: cardsInfo.sourcePileIndex
    });
    
    const targetEl = this.getCardElement({
      cardId: cardsInfo.targetCardId,
      zone: cardsInfo.targetZone,
      pileIndex: cardsInfo.targetPileIndex
    });

    if (!sourceEl || !targetEl) return;

    this.createPhantom(sourceEl, targetEl, 'stack-cards');
  },

  // Показать фантом для размещения карты в категории
  showCardToCategoryPhantom(cardInfo) {
    const cardEl = this.getCardElement(cardInfo);
    if (!cardEl) return;

    const slotEl = document.querySelectorAll('#category-slots .category-slot')[cardInfo.slotIndex];
    if (!slotEl) return;

    this.createPhantom(cardEl, slotEl, 'card-to-category');
  },

  // Показать фантом для открытия колоды
  showOpenDeckPhantom() {
    const deckEl = document.getElementById('deck');
    if (!deckEl) return;

    // Создаём пульсирующую подсветку колоды
    const isMobile = isMobileDevice();
    const borderWidth = isMobile ? 1.5 : 3;
    const padding = isMobile ? 2 : 5;
    const shadowSize = isMobile ? 10 : 20;
    
    const phantom = document.createElement('div');
    phantom.className = 'tutorial-phantom tutorial-phantom--deck';
    phantom.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 5000;
      border: ${borderWidth}px solid #FFD700;
      border-radius: ${isMobile ? '5px' : '8px'};
      animation: tutorial-pulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 ${shadowSize}px rgba(255, 215, 0, 0.6);
    `;

    const rect = deckEl.getBoundingClientRect();
    phantom.style.left = `${rect.left - padding}px`;
    phantom.style.top = `${rect.top - padding}px`;
    phantom.style.width = `${rect.width + padding * 2}px`;
    phantom.style.height = `${rect.height + padding * 2}px`;

    document.body.appendChild(phantom);
    this.currentPhantom = phantom;
  },

  // Получить DOM элемент карты
  getCardElement(cardInfo) {
    let selector = `.card[data-card-id="${cardInfo.cardId}"]`;
    
    if (cardInfo.zone === 'discard') {
      selector += `[data-zone="discard"]`;
    } else if (cardInfo.zone === 'pile') {
      selector += `[data-zone="pile"][data-pile-index="${cardInfo.pileIndex}"]`;
    }

    return document.querySelector(selector);
  },

  // Создать фантом карты
  createPhantom(sourceEl, targetEl, type) {
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Клонируем карту
    const phantom = sourceEl.cloneNode(true);
    phantom.className = 'card tutorial-phantom';
    
    // Уменьшаем размер фантома на мобильных устройствах
    const isMobile = isMobileDevice();
    const scale = isMobile ? 0.85 : 1.0; // 85% размера на мобильных, 100% на ПК
    
    // Используем transform: scale() для масштабирования
    phantom.style.cssText = `
      position: fixed;
      left: ${sourceRect.left}px;
      top: ${sourceRect.top}px;
      width: ${sourceRect.width}px !important;
      height: ${sourceRect.height}px !important;
      pointer-events: none;
      z-index: 5000;
      opacity: 0.7;
      border: ${isMobile ? '1.5px' : '3px'} solid #FFD700;
      box-shadow: 0 0 ${isMobile ? '10px' : '20px'} rgba(255, 215, 0, 0.8);
      animation: tutorial-move 2s ease-in-out infinite;
      transform-origin: center center;
      transform: scale(${scale}) !important;
    `;

    // Устанавливаем CSS переменные для анимации
    const scaledWidth = sourceRect.width * scale;
    const scaledHeight = sourceRect.height * scale;
    const startX = sourceRect.left + (sourceRect.width - scaledWidth) / 2;
    const startY = sourceRect.top + (sourceRect.height - scaledHeight) / 2;
    const endX = targetRect.left + targetRect.width / 2 - scaledWidth / 2;
    const endY = targetRect.top + targetRect.height / 2 - scaledHeight / 2;
    
    phantom.style.setProperty('--start-x', `${startX}px`);
    phantom.style.setProperty('--start-y', `${startY}px`);
    phantom.style.setProperty('--end-x', `${endX}px`);
    phantom.style.setProperty('--end-y', `${endY}px`);

    // transform: scale() автоматически масштабирует все внутренние элементы
    
    document.body.appendChild(phantom);
    this.currentPhantom = phantom;
  },

  // Удалить текущий фантом
  removePhantom() {
    if (this.currentPhantom) {
      this.currentPhantom.remove();
      this.currentPhantom = null;
    }
  },

  // Обработчики событий игры
  onCategoryPlaced() {
    this.completeStep(this.STEPS.PLACE_CATEGORY);
  },

  onCardsStacked() {
    this.completeStep(this.STEPS.STACK_CARDS);
  },

  onCardPlacedInCategory() {
    this.completeStep(this.STEPS.PLACE_IN_CATEGORY);
  },

  onDeckOpened() {
    this.completeStep(this.STEPS.OPEN_DECK);
  }
};

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes tutorial-move {
    0%, 100% {
      left: var(--start-x);
      top: var(--start-y);
    }
    50% {
      left: var(--end-x);
      top: var(--end-y);
    }
  }

  @keyframes tutorial-pulse {
    0%, 100% {
      opacity: 0.7;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }
  
  @keyframes tutorial-pulse-mobile {
    0%, 100% {
      opacity: 0.7;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.03);
    }
  }

  .tutorial-phantom {
    transition: none !important;
  }
  
  /* Более быстрая анимация на мобильных */
  @media (max-width: 768px) {
    .tutorial-phantom {
      animation-duration: 1.5s !important;
    }
    
    .tutorial-phantom--deck {
      animation-name: tutorial-pulse-mobile !important;
      animation-duration: 1.2s !important;
    }
  }
`;
document.head.appendChild(style);

export { Tutorial };
