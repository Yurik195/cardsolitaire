import { LEVELS, shuffleArray, getLevel } from './levels.js';
import { renderGameState, setStatusText, showVictoryModal, showWrongCategoryHint, showCategorySlotHint, showDifferentCategoryHint, showCategoryNotInSlotHint, showJokerSlotHint } from './ui_layout.js';
import { loadSound, playSound } from './audio.js';
import { Tutorial } from './tutorial.js';

// Звуки игры
const sounds = {
  go: null,      // проигрыш
  kliiik: null,  // клики по кнопкам
  win: null,     // выигрыш
  kart: null,    // перекладывание карты
  koloda: null,  // нажатие на колоду
  good: null,    // правильная карта в категорию
  kat: null      // закрытие категории
};

// Загрузка звуков
async function loadGameSounds() {
  try {
    sounds.go = await loadSound('./go.mp3');
    sounds.kliiik = await loadSound('./kliiik.mp3');
    sounds.win = await loadSound('./win.mp3');
    sounds.kart = await loadSound('./kart.mp3');
    sounds.koloda = await loadSound('./koloda.mp3');
    sounds.good = await loadSound('./good.mp3');
    sounds.kat = await loadSound('./kat.mp3');
    console.log('Звуки загружены');
  } catch (error) {
    console.warn('Ошибка загрузки звуков:', error);
  }
}

// Воспроизведение звука (неблокирующее)
export function playGameSound(soundName) {
  if (sounds[soundName]) {
    // Запускаем воспроизведение без ожидания чтобы не блокировать игровую логику
    playSound(sounds[soundName]).then(() => {
      console.log(`Звук ${soundName} воспроизведён`);
    }).catch(err => {
      console.warn(`Ошибка воспроизведения звука ${soundName}:`, err);
    });
  } else {
    console.warn(`Звук ${soundName} не загружен, sounds:`, Object.keys(sounds).filter(k => sounds[k]));
  }
}

// Инициализация звуков при загрузке модуля
loadGameSounds();

function autoBalanceLevel(level) {
  console.log(`Автобалансировка уровня ${level.id}...`);
  
  const wordCountByCategory = {};
  const categories = [];
  const wordCards = [];
  
  // Собираем информацию о картах
  (level.cards || []).forEach(card => {
    if (card.type === 'WORD' && card.categoryId) {
      wordCountByCategory[card.categoryId] = (wordCountByCategory[card.categoryId] || 0) + 1;
      wordCards.push(card);
    } else if (card.type === 'CATEGORY') {
      categories.push(card);
    }
  });
  
  const balancedCards = [...level.cards];
  let changes = [];
  
  // Балансируем каждую категорию
  categories.forEach(category => {
    const available = wordCountByCategory[category.id] || 0;
    const needed = category.needed || 0;
    
    if (available > needed) {
      // Удаляем лишние карты
      const excessCount = available - needed;
      const cardsToRemove = wordCards
        .filter(card => card.categoryId === category.id)
        .slice(0, excessCount);
      
      cardsToRemove.forEach(card => {
        const index = balancedCards.findIndex(c => c.id === card.id);
        if (index !== -1) {
          balancedCards.splice(index, 1);
          changes.push(`Удалена лишняя карта "${card.title}" из категории "${category.title}"`);
        }
      });
      
    } else if (available < needed) {
      // Добавляем недостающие карты
      const missingCount = needed - available;
      const existingCards = wordCards.filter(card => card.categoryId === category.id);
      
      for (let i = 0; i < missingCount; i++) {
        // Создаем новую карту на основе существующих или генерируем
        let newCard;
        if (existingCards.length > 0) {
          const template = existingCards[i % existingCards.length];
          newCard = {
            id: `${category.id}_auto_${i + available + 1}`,
            type: 'WORD',
            title: `${template.title} ${i + available + 1}`,
            categoryId: category.id,
            emoji: template.emoji
          };
        } else {
          newCard = {
            id: `${category.id}_auto_${i + 1}`,
            type: 'WORD',
            title: `Карта ${i + 1}`,
            categoryId: category.id
          };
        }
        
        balancedCards.push(newCard);
        changes.push(`Добавлена недостающая карта "${newCard.title}" в категорию "${category.title}"`);
      }
    }
  });
  
  // Обновляем раскладку карт, удаляя несуществующие карты
  const validCardIds = new Set(balancedCards.map(card => card.id));
  
  const updatedInitialPiles = (level.initialPiles || []).map(pile => 
    pile.filter(cardId => validCardIds.has(cardId))
  );
  
  const updatedDeckOrder = (level.deckOrder || []).filter(cardId => validCardIds.has(cardId));
  
  // Добавляем новые карты в колоду
  const usedCardIds = new Set([
    ...updatedInitialPiles.flat(),
    ...updatedDeckOrder
  ]);
  
  const newCards = balancedCards
    .filter(card => !usedCardIds.has(card.id))
    .map(card => card.id);
  
  if (changes.length > 0) {
    console.log(`Уровень ${level.id} автобалансирован:`, changes);
    if (newCards.length > 0) {
      console.log(`Новые карты добавлены в колоду: ${newCards.join(', ')}`);
    }
  } else {
    console.log(`Уровень ${level.id} уже сбалансирован`);
  }
  
  return { 
    ...level, 
    cards: balancedCards,
    initialPiles: updatedInitialPiles,
    deckOrder: [...updatedDeckOrder, ...newCards]
  };
}

function validateAndFixLevel(level) {
  // Автобалансировка
  const balancedLevel = autoBalanceLevel(level);
  
  // Проверяем результат
  const wordCountByCategory = {};
  const categories = [];
  
  balancedLevel.cards.forEach(card => {
    if (card.type === 'WORD' && card.categoryId) {
      wordCountByCategory[card.categoryId] = (wordCountByCategory[card.categoryId] || 0) + 1;
    } else if (card.type === 'CATEGORY') {
      categories.push(card);
    }
  });
  
  // Финальная проверка баланса
  let isBalanced = true;
  categories.forEach(category => {
    const available = wordCountByCategory[category.id] || 0;
    const needed = category.needed || 0;
    if (available !== needed) {
      console.error(`КРИТИЧЕСКАЯ ОШИБКА: Категория "${category.title}" не сбалансирована: ${available}/${needed}`);
      isBalanced = false;
    }
  });
  
  if (isBalanced) {
    console.log(`✅ Уровень ${level.id} успешно сбалансирован и готов к игре`);
  }
  
  return balancedLevel;
}

function prepareCardPool(level) {
  // Сначала автобалансируем уровень
  const balancedLevel = validateAndFixLevel(level);
  
  const cardsById = {};
  const wordCountByCategory = {};

  (balancedLevel.cards || []).forEach(card => {
    cardsById[card.id] = { ...card };
    if (card.type === 'WORD' && card.categoryId) {
      wordCountByCategory[card.categoryId] = (wordCountByCategory[card.categoryId] || 0) + 1;
    }
  });

  Object.values(cardsById).forEach(card => {
    if (card.type === 'CATEGORY') {
      const available = wordCountByCategory[card.id] || 0;
      // После автобалансировки available должно равняться needed
      card.needed = available;
    }
  });

  const definedCardIds = (balancedLevel.cards || []).map(c => c.id);
  const providedOrder = [
    ...(balancedLevel.initialPiles ? balancedLevel.initialPiles.flat() : []),
    ...(balancedLevel.deckOrder || []),
  ];

  const seen = new Set();
  const normalizedOrder = [];

  providedOrder.forEach(id => {
    if (!cardsById[id]) {
      return;
    }
    if (seen.has(id)) {
      return;
    }
    seen.add(id);
    normalizedOrder.push(id);
  });

  const missingIds = definedCardIds.filter(id => !seen.has(id));
  const fullPool = [...normalizedOrder, ...missingIds];

  return { cardsById, fullPool };
}

export const Game = {
  state: {
    levelId: null,
    movesLeft: 0,
    deck: [],
    discard: [],
    piles: [],
    pilesOpenFrom: [],
    categorySlots: [],
    cardsById: {},
    isLevelCompleted: false,
    isLevelFailed: false,
    completedCategories: [],
    openCardsCount: 2,
    jokerBonus: false, // Флаг победы с Джокером (+100 монет)
  },

  undoHistory: [],
  hintCount: 2,
  undoCount: 2,

  getHintCount() {
    return this.hintCount;
  },

  getUndoCount() {
    return this.undoCount;
  },

  useHint() {
    if (this.hintCount > 0) {
      this.hintCount--;
      // Сохраняем в облако асинхронно
      this._saveHintsToCloud();
      return true;
    }
    return false;
  },

  useUndo() {
    if (this.undoCount > 0 && this.undoHistory.length > 0) {
      this.undoCount--;
      // Сохраняем в облако асинхронно
      this._saveHintsToCloud();
      return true;
    }
    return false;
  },

  // Флаг первого запуска (для начальных 2 подсказок)
  _hintsInitialized: false,

  resetHints() {
    // Не сбрасываем подсказки если они уже были загружены из облака
    // Сброс происходит только при первом запуске игры
    if (!this._hintsInitialized) {
      this.hintCount = 3;
      this.undoCount = 3;
      this._hintsInitialized = true;
    }
  },

  // Загрузка подсказок из облака (вызывается из main.js)
  loadHintsFromCloud(hints, undos) {
    if (hints !== undefined) {
      this.hintCount = hints;
    }
    if (undos !== undefined) {
      this.undoCount = undos;
    }
    this._hintsInitialized = true;
    console.log(`Подсказки загружены из облака: hints=${this.hintCount}, undos=${this.undoCount}`);
  },

  // Асинхронное сохранение подсказок в облако
  _saveHintsToCloud() {
    import('./playgama_sdk.js').then(({ savePlayerData, loadPlayerData }) => {
      loadPlayerData().then(currentData => {
        savePlayerData({
          ...currentData,
          hints: this.hintCount,
          undos: this.undoCount
        }).catch(err => {
          console.warn('Ошибка сохранения подсказок в облако:', err);
        });
      });
    });
  },

  buyHint(hintType) {
    const cost = hintType === 'undo' ? 600 : 800;
    const coins = this.spendCoins(cost);
    if (coins !== null) {
      if (hintType === 'hint') {
        this.hintCount++;
      } else if (hintType === 'undo') {
        this.undoCount++;
      }
      // Сохраняем в облако асинхронно
      this._saveHintsToCloud();
      setStatusText(`Куплена подсказка за ${cost} монет`);
      return true;
    } else {
      setStatusText('Недостаточно монет');
      return false;
    }
  },

  getCoins() {
    const stored = localStorage.getItem('gameCoins');
    return stored ? parseInt(stored, 10) : 0;
  },

  addCoins(amount) {
    const current = this.getCoins();
    const newTotal = current + amount;
    localStorage.setItem('gameCoins', newTotal.toString());
    // Сохраняем в облако асинхронно
    this._saveCoinsToCloud(newTotal);
    return newTotal;
  },

  spendCoins(amount) {
    const current = this.getCoins();
    if (current >= amount) {
      const newTotal = current - amount;
      localStorage.setItem('gameCoins', newTotal.toString());
      // Сохраняем в облако асинхронно
      this._saveCoinsToCloud(newTotal);
      return newTotal;
    }
    return null;
  },

  // Асинхронное сохранение монет в облако (не блокирует игру)
  _saveCoinsToCloud(coins) {
    import('./playgama_sdk.js').then(({ savePlayerData, loadPlayerData }) => {
      loadPlayerData().then(currentData => {
        savePlayerData({
          ...currentData,
          coins
        }).catch(err => {
          console.warn('Ошибка сохранения монет в облако:', err);
        });
      });
    });
  },

  // Получить максимальный открытый уровень
  getMaxLevel() {
    const stored = localStorage.getItem('maxLevel');
    return stored ? parseInt(stored, 10) : 1;
  },

  // Сохранить максимальный открытый уровень
  saveMaxLevel(level) {
    const currentMax = this.getMaxLevel();
    if (level > currentMax) {
      localStorage.setItem('maxLevel', level.toString());
      // Сохраняем в облако асинхронно
      this._saveMaxLevelToCloud(level);
    }
  },

  // Асинхронное сохранение максимального уровня в облако
  _saveMaxLevelToCloud(maxLevel) {
    import('./playgama_sdk.js').then(({ savePlayerData, loadPlayerData }) => {
      loadPlayerData().then(currentData => {
        savePlayerData({
          ...currentData,
          maxLevel
        }).catch(err => {
          console.warn('Ошибка сохранения уровня в облако:', err);
        });
      });
    });
  },

  // Загрузка максимального уровня из облака (вызывается из main.js)
  loadMaxLevelFromCloud(maxLevel) {
    if (maxLevel !== undefined && maxLevel > this.getMaxLevel()) {
      localStorage.setItem('maxLevel', maxLevel.toString());
    }
  },

  saveState() {
    const stateCopy = {
      levelId: this.state.levelId,
      movesLeft: this.state.movesLeft,
      deck: [...this.state.deck],
      discard: [...this.state.discard],
      piles: this.state.piles.map(pile => [...pile]),
      pilesOpenFrom: [...this.state.pilesOpenFrom],
      categorySlots: this.state.categorySlots.map(slot => {
        if (slot === null) return null;
        return {
          slotIndex: slot.slotIndex,
          categoryId: slot.categoryId,
          collectedCount: slot.collectedCount,
          needed: slot.needed,
          cards: [...slot.cards],
        };
      }),
      cardsById: JSON.parse(JSON.stringify(this.state.cardsById)),
      isLevelCompleted: this.state.isLevelCompleted,
      isLevelFailed: this.state.isLevelFailed,
      completedCategories: [...this.state.completedCategories],
      openCardsCount: this.state.openCardsCount,
      jokerBonus: this.state.jokerBonus,
    };
    this.undoHistory.push(stateCopy);
    // Ограничиваем историю до 50 ходов для экономии памяти
    if (this.undoHistory.length > 50) {
      this.undoHistory.shift();
    }
  },

  async undo() {
    if (this.undoHistory.length === 0) {
      setStatusText('Нет ходов для отмены');
      return false;
    }

    if (this.state.isLevelCompleted || this.state.isLevelFailed) {
      setStatusText('Нельзя отменить ход после завершения уровня');
      return false;
    }

    const previousState = this.undoHistory.pop();
    
    this.state.levelId = previousState.levelId;
    // Не возвращаем movesLeft - ходы не восстанавливаются
    this.state.deck = previousState.deck;
    this.state.discard = previousState.discard;
    this.state.piles = previousState.piles;
    this.state.pilesOpenFrom = previousState.pilesOpenFrom;
    this.state.categorySlots = previousState.categorySlots;
    this.state.cardsById = previousState.cardsById;
    this.state.isLevelCompleted = previousState.isLevelCompleted;
    this.state.isLevelFailed = previousState.isLevelFailed;
    this.state.completedCategories = previousState.completedCategories;
    this.state.openCardsCount = previousState.openCardsCount;
    this.state.jokerBonus = previousState.jokerBonus;

    await this.checkGameOver();
    renderGameState(this.state);
    setStatusText('Ход отменён');
    return true;
  },

  startLevel(levelId) {
    const level = getLevel(levelId);
    if (!level) {
      setStatusText('Уровень не найден');
      return;
    }

    // resetHints() вызывается только при первом запуске (из main.js через loadHintsFromCloud)
    // Подсказки сохраняются между уровнями
    this.state.levelId = levelId;
    this.state.movesLeft = level.movesLimit;
    this.state.isLevelCompleted = false;
    this.state.isLevelFailed = false;
    this.state.completedCategories = [];
    this.state.jokerBonus = false;
    this.state.openCardsCount = level.openCardsCount || 2;

    const { cardsById, fullPool } = prepareCardPool(level);
    this.state.cardsById = cardsById;

    const shuffledCards = shuffleArray(fullPool);
    
    const pilesCount = level.initialPiles?.length ?? level.pilesCount ?? 0;
    const pilesSizes = level.initialPiles?.map(pile => pile.length) ?? new Array(pilesCount).fill(0);
    this.state.piles = [];
    let currentIndex = 0;
    
    for (let i = 0; i < pilesCount; i++) {
      const remaining = Math.max(0, shuffledCards.length - currentIndex);
      const pileSize = Math.min(pilesSizes[i] ?? 0, remaining);
      this.state.piles.push(shuffledCards.slice(currentIndex, currentIndex + pileSize));
      currentIndex += pileSize;
    }
    
    const openCount = this.state.openCardsCount || 2;
    this.state.pilesOpenFrom = this.state.piles.map(p => Math.max(0, p.length - openCount));
    this.state.deck = shuffledCards.slice(currentIndex);

    this.state.discard = [];

    this.state.categorySlots = [];
    for (let i = 0; i < level.categorySlotsCount; i++) {
      this.state.categorySlots.push(null);
    }

    // Очищаем историю при старте нового уровня
    this.undoHistory = [];

    this.checkGameOver();
    renderGameState(this.state);
    setStatusText(`Уровень ${levelId} начат`);
    
    // Инициализация туториала для первого уровня
    Tutorial.init();
    // Задержка для завершения анимации открытия карт
    setTimeout(() => {
      Tutorial.update();
    }, 300);
  },

  async onDeckClick() {
    if (this.state.isLevelCompleted || this.state.isLevelFailed) return;
    
    // Проверяем, есть ли ходы (movesLeft === -1 означает бесконечные ходы)
    if (this.state.movesLeft === 0) {
      setStatusText('Нет ходов!');
      return;
    }

    // если колода пуста, но есть открытые карты — вернуть их без перемешивания
    if (this.state.deck.length === 0 && this.state.discard.length > 0) {
      playGameSound('koloda');
      this.saveState();
      this.state.deck = [...this.state.discard].reverse();
      this.state.discard = [];
      setStatusText('Колода возвращена');
      renderGameState(this.state);
      return;
    }

    // если вообще пусто
    if (this.state.deck.length === 0 && this.state.discard.length === 0) {
      setStatusText('Колода пуста');
      return;
    }

    playGameSound('koloda');
    this.saveState();
    const cardId = this.state.deck.pop();
    this.state.discard.push(cardId);
    
    // Уменьшаем ходы только если они не бесконечные (movesLeft > 0)
    // movesLeft === -1 означает бесконечные ходы
    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    await this.checkGameOver();
    renderGameState(this.state);
    
    // Уведомляем туториал об открытии колоды
    Tutorial.onDeckOpened();
    // Задержка для завершения анимации открытия карт
    setTimeout(() => {
      Tutorial.update();
    }, 300);
  },

  reshuffleDeck() {
    const cardsToReshuffle = [];

    this.state.piles.forEach(pile => {
      cardsToReshuffle.push(...pile);
    });

    if (this.state.discard.length > 0) {
      cardsToReshuffle.push(...this.state.discard);
    }

    if (cardsToReshuffle.length > 0) {
      this.state.deck = shuffleArray(cardsToReshuffle);
      this.state.piles = this.state.piles.map(() => []);
      this.state.discard = [];
      setStatusText('Колода пересдана');
    }
  },

  onDeckReshuffle() {
    if (this.state.isLevelCompleted || this.state.isLevelFailed) return;
    if (this.state.discard.length === 0) {
      setStatusText('Нечего перемешивать');
      return;
    }
    this.saveState();
    this.state.deck.push(...[...this.state.discard].reverse());
    this.state.discard = [];
    setStatusText('Колода возвращена');
    renderGameState(this.state);
  },

  async onCardClick(cardId, sourceInfo) {
    if (this.state.isLevelCompleted || this.state.isLevelFailed) return;

    const card = this.state.cardsById[cardId];
    if (!card) return;

    this.saveState();
    if (card.type === 'JOKER') {
      // Джокер при клике - ничего не делаем (перетаскивание работает)
      return;
    } else if (card.type === 'CATEGORY') {
      await this.tryMoveCategoryToSlot(cardId, sourceInfo);
    } else if (card.type === 'WORD') {
      await this.tryMoveWordToCategory(cardId, sourceInfo);
    }

    await this.checkGameOver();
    renderGameState(this.state);
    
    // Обновляем туториал после действия с задержкой
    setTimeout(() => {
      Tutorial.update();
    }, 300);
  },

  async tryMoveCategoryToSlot(categoryId, sourceInfo) {
    const emptySlotIndex = this.state.categorySlots.findIndex(slot => slot === null);
    
    if (emptySlotIndex === -1) {
      setStatusText('Нет свободных слотов для категорий');
      return;
    }

    if (!this.canTakeCard(categoryId, sourceInfo)) {
      setStatusText('Нельзя взять эту карту');
      return;
    }

    playGameSound('kart'); // Звук установки категории в слот
    this.removeCardFromSource(categoryId, sourceInfo);

    const category = this.state.cardsById[categoryId];
    this.state.categorySlots[emptySlotIndex] = {
      slotIndex: emptySlotIndex,
      categoryId: categoryId,
      collectedCount: 0,
      needed: category.needed,
      cards: [],
    };
    const slot = this.state.categorySlots[emptySlotIndex];

    setStatusText(`Категория "${category.title}" размещена`);
    
    // Уведомляем туториал о размещении категории
    Tutorial.onCategoryPlaced();

    if (slot.needed === 0) {
      await this.completeCategory(slot);
      await this.checkGameOver();
      // renderGameState вызывается внутри completeCategory после анимации
    } else {
      renderGameState(this.state);
    }
  },

  async tryMoveWordToCategory(wordId, sourceInfo) {
    if (!this.canTakeCard(wordId, sourceInfo)) {
      setStatusText('Нельзя взять эту карту');
      return;
    }

    const word = this.state.cardsById[wordId];
    const targetSlot = this.state.categorySlots.find(
      slot => slot && slot.categoryId === word.categoryId
    );

    if (!targetSlot) {
      setStatusText('Сначала разместите нужную категорию');
      return;
    }

    this.removeCardFromSource(wordId, sourceInfo);

    targetSlot.cards.push(wordId);
    targetSlot.collectedCount++;

    setStatusText(`"${word.title}" добавлено в "${this.state.cardsById[targetSlot.categoryId].title}"`);
    
    // Уведомляем туториал о размещении карты в категории
    Tutorial.onCardPlacedInCategory();

    if (targetSlot.collectedCount >= targetSlot.needed) {
      // Сначала обновляем UI чтобы карта исчезла из источника
      renderGameState(this.state);
      await this.completeCategory(targetSlot);
      await this.checkGameOver();
      // renderGameState вызывается внутри completeCategory после анимации
    } else {
      renderGameState(this.state);
    }
  },

  canTakeCard(cardId, sourceInfo) {
    if (sourceInfo.zone === 'discard') {
      if (this.state.discard.length === 0) return false;
      return this.state.discard[this.state.discard.length - 1] === cardId;
    }

    if (sourceInfo.zone === 'pile') {
      const pile = this.state.piles[sourceInfo.pileIndex];
      if (!pile || pile.length === 0) return false;
      return pile[pile.length - 1] === cardId;
    }

    return false;
  },

  removeCardFromSource(cardId, sourceInfo) {
    if (sourceInfo.zone === 'discard') {
      if (this.state.discard.length > 0 && this.state.discard[this.state.discard.length - 1] === cardId) {
        this.state.discard.pop();
      }
    } else if (sourceInfo.zone === 'pile') {
      const pile = this.state.piles[sourceInfo.pileIndex];
      const index = pile.indexOf(cardId);
      if (index !== -1) {
        pile.splice(index, 1);
      }
      this.updatePileOpenFromAfterRemoval(sourceInfo.pileIndex);
    }
  },

  async completeCategory(slot) {
    const categoryName = this.state.cardsById[slot.categoryId].title;
    setStatusText(`Категория "${categoryName}" завершена!`);

    playGameSound('kat');

    // Запускаем анимацию уничтожения
    import('./ui_layout.js').then(({ animateCategoryDestroy }) => {
      animateCategoryDestroy(slot.slotIndex);
    });

    this.state.completedCategories.push(slot.categoryId);

    // Задержка перед удалением данных чтобы анимация успела проиграться
    setTimeout(() => {
      slot.cards.forEach(cardId => {
        delete this.state.cardsById[cardId];
      });
      delete this.state.cardsById[slot.categoryId];
      this.state.categorySlots[slot.slotIndex] = null;
      renderGameState(this.state);
    }, 700);
  },

  async checkGameOver() {
    // Подсчитываем карты (исключая Джокера из подсчёта "обычных" карт)
    const allCardIds = [
      ...this.state.deck,
      ...this.state.discard,
      ...this.state.piles.flat()
    ];
    
    const nonJokerCards = allCardIds.filter(cardId => {
      const card = this.state.cardsById[cardId];
      return card && card.type !== 'JOKER';
    });
    
    const jokerCards = allCardIds.filter(cardId => {
      const card = this.state.cardsById[cardId];
      return card && card.type === 'JOKER';
    });
    
    const hasNonJokerCards = nonJokerCards.length > 0;
    const hasJokerOnly = jokerCards.length > 0 && !hasNonJokerCards;
    const hasAnyCards = allCardIds.length > 0;

    console.log('checkGameOver:', {
      deck: this.state.deck.length,
      discard: this.state.discard.length,
      piles: this.state.piles.map(p => p.length),
      hasAnyCards,
      hasJokerOnly,
      jokerCards: jokerCards.length
    });

    // Победа с Джокером: остался только Джокер
    if (hasJokerOnly) {
      this.state.isLevelCompleted = true;
      this.state.isLevelFailed = false;
      this.state.jokerBonus = true; // Флаг для бонуса Джокера
      
      // Воспроизводим звук победы с небольшой задержкой
      setTimeout(() => {
        playGameSound('win');
      }, 100);
      
      // Базовый бонус 50 + бонус за Джокера 200 = 250
      let totalBonus = 250;
      
      // Добавляем бонус за оставшиеся ходы (по 2 монеты за ход)
      const remainingMoves = this.state.movesLeft;
      let movesBonus = 0;
      
      if (this.state.levelId > 1 && remainingMoves > 0 && remainingMoves !== -1) {
        movesBonus = remainingMoves * 2;
        totalBonus += movesBonus;
      }
      
      // Начисляем монеты сразу
      this.addCoins(totalBonus);
      
      // Сохраняем прогресс - открываем следующий уровень
      this.saveMaxLevel(this.state.levelId + 1);
      
      setStatusText(`🃏 ДЖОКЕР ПОБЕДА! +${totalBonus} монет`);
      
      setTimeout(() => {
        showVictoryModal(this.state.levelId, totalBonus);
      }, 1000);
      return;
    }

    // Обычная победа: все карты убраны
    if (!hasAnyCards) {
      this.state.isLevelCompleted = true;
      this.state.isLevelFailed = false;
      this.state.jokerBonus = false;
      
      // Базовый бонус 50 монет за прохождение уровня
      let totalBonus = 50;
      
      // Добавляем бонус за оставшиеся ходы (по 2 монеты за ход), но не на 1-м уровне
      const remainingMoves = this.state.movesLeft;
      let movesBonus = 0;
      
      if (this.state.levelId > 1 && remainingMoves > 0 && remainingMoves !== -1) {
        movesBonus = remainingMoves * 2;
        totalBonus += movesBonus;
      }
      
      // Начисляем монеты сразу
      this.addCoins(totalBonus);
      
      // Сохраняем прогресс - открываем следующий уровень
      this.saveMaxLevel(this.state.levelId + 1);
      
      if (movesBonus > 0) {
        setStatusText(`ПОБЕДА! Уровень пройден! +${totalBonus} монет`);
      } else {
        setStatusText(`ПОБЕДА! Уровень пройден! +50 монет`);
      }
      
      // Воспроизводим звук победы с небольшой задержкой
      setTimeout(() => {
        playGameSound('win');
      }, 100);
      
      // Показываем окно выигрыша с задержкой в 1 секунду
      setTimeout(() => {
        showVictoryModal(this.state.levelId, totalBonus);
      }, 1000);
      return;
    }

    // Если ходы закончились, но еще есть карты - показываем окно
    // movesLeft === -1 означает бесконечные ходы, поэтому проверяем только === 0
    if (this.state.movesLeft === 0) {
      this.state.isLevelFailed = true;
      playGameSound('go');
      setStatusText('Поражение. Ходы закончились.');
      // Сбрасываем счётчик побед подряд
      import('./ui_layout.js').then(({ resetConsecutiveWins }) => resetConsecutiveWins());
      return;
    } else {
      // Если ходы появились (например, купили), сбрасываем флаг поражения
      this.state.isLevelFailed = false;
    }
  },

  getCardsToGrab(cardId, sourceInfo) {
    if (this.state.isLevelCompleted || this.state.isLevelFailed) return [];

    if (sourceInfo.zone === 'discard') {
      if (this.state.discard.length === 0) return [];
      const top = this.state.discard[this.state.discard.length - 1];
      return top === cardId ? [cardId] : [];
    }

    if (sourceInfo.zone === 'pile') {
      const pile = this.state.piles[sourceInfo.pileIndex];
      if (!pile || pile.length === 0) return [];

      const cardIndex = pile.indexOf(cardId);
      if (cardIndex === -1) return [];

      const openStartIndex = this.state.pilesOpenFrom[sourceInfo.pileIndex] ?? Math.max(0, pile.length - 2);
      
      if (cardIndex < openStartIndex) {
        return [];
      }

      const cardsAbove = pile.slice(cardIndex);

      if (cardsAbove.length === 1) {
        return cardsAbove;
      }

      const firstCard = this.state.cardsById[cardsAbove[0]];
      
      // Джокер можно перетаскивать только один (как категорию)
      if (firstCard.type === 'JOKER') {
        if (cardIndex === pile.length - 1) {
          return [cardsAbove[0]];
        }
        return [];
      }
      
      if (firstCard.type === 'CATEGORY') {
        if (cardIndex === pile.length - 1) {
          return [cardsAbove[0]];
        }
        return [];
      }

      const firstCategoryId = firstCard.categoryId;
      const validGroup = [];

      for (const cId of cardsAbove) {
        const card = this.state.cardsById[cId];
        // Если встретили Джокера в группе - прерываем (нельзя брать карты из-под Джокера)
        if (card.type === 'JOKER') {
          return [];
        }
        if (card.type === 'WORD' && card.categoryId === firstCategoryId) {
          validGroup.push(cId);
        } else {
          return [];
        }
      }

      return validGroup;
    }

    return [];
  },

  async onCardsDrop(draggedCards, sourceInfo, target) {
    if (this.state.isLevelCompleted || this.state.isLevelFailed) return false;
    if (draggedCards.length === 0) return false;

    const firstCardId = draggedCards[0];
    const firstCard = this.state.cardsById[firstCardId];
    if (sourceInfo.zone === 'pile') {
      const samePileDrop =
        (target.type === 'pile' && target.pileIndex === sourceInfo.pileIndex) ||
        (target.type === 'card' && target.zone === 'pile' && target.pileIndex === sourceInfo.pileIndex);
      if (samePileDrop) {
        return false;
      }
    }
    
    this.saveState();
    let shouldAnimate = false;

    if (firstCard.type === 'JOKER') {
      // Джокер можно класть на пустые стопки и на любые карты (кроме слотов категорий)
      if (target.type === 'slot') {
        showJokerSlotHint();
      } else if (target.type === 'card') {
        await this.dropJokerOnCard(firstCardId, sourceInfo, target);
      } else if (target.type === 'pile') {
        await this.dropJokerToPile(firstCardId, sourceInfo, target.pileIndex);
      }
    } else if (firstCard.type === 'CATEGORY') {
      if (target.type === 'slot') {
        await this.dropCategoryToSlot(firstCardId, sourceInfo, target.slotIndex);
      } else if (target.type === 'card') {
        shouldAnimate = await this.dropCategoryOnCard(firstCardId, sourceInfo, target);
      } else if (target.type === 'pile') {
        await this.dropCategoryToPile(firstCardId, sourceInfo, target.pileIndex);
      }
    } else if (firstCard.type === 'WORD') {
      if (target.type === 'card') {
        shouldAnimate = await this.dropWordsOnCard(draggedCards, sourceInfo, target);
      } else if (target.type === 'pile') {
        await this.dropWordsOnPile(draggedCards, sourceInfo, target.pileIndex);
      } else if (target.type === 'slot') {
        shouldAnimate = await this.dropWordsOnSlot(draggedCards, sourceInfo, target.slotIndex);
      }
    }

    if (!shouldAnimate) {
      await this.checkGameOver();
      renderGameState(this.state);
    }
    return shouldAnimate;
  },

  async dropCategoryToSlot(categoryId, sourceInfo, slotIndex) {
    if (this.state.categorySlots[slotIndex] !== null) {
      return;
    }

    // Уменьшаем ходы при перемещении категории (кроме бесконечных ходов)
    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    playGameSound('kart'); // Звук установки категории в слот
    this.removeCardFromSource(categoryId, sourceInfo);

    const category = this.state.cardsById[categoryId];
    this.state.categorySlots[slotIndex] = {
      slotIndex: slotIndex,
      categoryId: categoryId,
      collectedCount: 0,
      needed: category.needed,
      cards: [],
    };
    const slot = this.state.categorySlots[slotIndex];

    setStatusText(`Категория "${category.title}" размещена`);

    if (slot.needed === 0) {
      await this.completeCategory(slot);
      await this.checkGameOver();
      // renderGameState вызывается внутри completeCategory после анимации
    } else {
      renderGameState(this.state);
    }
  },

  async dropCategoryToPile(categoryId, sourceInfo, pileIndex) {
    const pile = this.state.piles[pileIndex];
    if (!pile || pile.length > 0) return;

    // Уменьшаем ходы при перемещении категории (кроме бесконечных ходов)
    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    playGameSound('kart');
    this.removeCardFromSource(categoryId, sourceInfo);
    pile.push(categoryId);
    this.state.pilesOpenFrom[pileIndex] = 0;

    const category = this.state.cardsById[categoryId];
    setStatusText(`Категория "${category.title}" размещена в стопке`);
  },

  // Джокер на пустую стопку
  async dropJokerToPile(jokerId, sourceInfo, pileIndex) {
    const pile = this.state.piles[pileIndex];
    if (!pile || pile.length > 0) return;

    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    playGameSound('kart');
    this.removeCardFromSource(jokerId, sourceInfo);
    pile.push(jokerId);
    this.state.pilesOpenFrom[pileIndex] = 0;

    setStatusText('🃏 Джокер перемещён');
  },

  // Джокер на любую карту
  async dropJokerOnCard(jokerId, sourceInfo, target) {
    const targetCard = this.state.cardsById[target.cardId];
    if (!targetCard || target.zone !== 'pile') return;
    
    // Нельзя класть Джокера на другого Джокера
    if (targetCard.type === 'JOKER') {
      setStatusText('🃏 Нельзя класть Джокера на Джокера!');
      return;
    }

    const pileIndex = target.pileIndex;
    const pile = this.state.piles[pileIndex];
    if (!pile || pile[pile.length - 1] !== target.cardId) return;

    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    playGameSound('kart');
    this.removeCardFromSource(jokerId, sourceInfo);
    pile.push(jokerId);

    const prevOpenFrom = this.state.pilesOpenFrom[pileIndex] ?? Math.max(0, pile.length - 2);
    const newOpenFrom = Math.min(prevOpenFrom, pile.length - 1);
    this.state.pilesOpenFrom[pileIndex] = newOpenFrom;

    setStatusText('🃏 Джокер перемещён');
  },

  async dropCategoryOnCard(categoryId, sourceInfo, target) {
    const targetCard = this.state.cardsById[target.cardId];
    if (!targetCard || target.zone !== 'pile') return false;
    // Нельзя класть на Джокера
    if (targetCard.type === 'JOKER') {
      setStatusText('🃏 На Джокера нельзя класть карты!');
      return false;
    }
    if (targetCard.type !== 'WORD') return false;
    const category = this.state.cardsById[categoryId];
    if (!category) return false;
    if (targetCard.categoryId !== categoryId) return false;

    const pileIndex = target.pileIndex;
    const pile = this.state.piles[pileIndex];
    if (!pile || pile[pile.length - 1] !== target.cardId) return false; // только на верхнюю карту

    // Уменьшаем ходы при перемещении категории (кроме бесконечных ходов)
    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    playGameSound('kart');
    this.removeCardFromSource(categoryId, sourceInfo);
    pile.push(categoryId);

    const prevOpenFrom = this.state.pilesOpenFrom[pileIndex] ?? Math.max(0, pile.length - 2);
    const newOpenFrom = Math.min(prevOpenFrom, pile.length - 1);
    this.state.pilesOpenFrom[pileIndex] = newOpenFrom;

    setStatusText(`Категория "${category.title}" размещена на свою стопку`);
    return false;
  },

  async dropWordsOnCard(draggedCards, sourceInfo, target) {
    const targetCard = this.state.cardsById[target.cardId];
    if (!targetCard) return false;

    const firstDraggedCard = this.state.cardsById[draggedCards[0]];
    if (firstDraggedCard.type !== 'WORD') return false;

    // Нельзя класть карты на Джокера
    if (targetCard.type === 'JOKER') {
      setStatusText('🃏 На Джокера нельзя класть карты!');
      return false;
    }

    if (targetCard.type === 'CATEGORY') {
      const slot = this.state.categorySlots.find(s => s && s.categoryId === target.cardId);
      if (slot) {
        return await this.dropWordsOnSlotByCategory(draggedCards, sourceInfo, slot);
      }
      // Карта категории не размещена в слоте
      showCategoryNotInSlotHint();
      return false;
    }

    if (targetCard.type === 'WORD') {
      if (targetCard.categoryId === firstDraggedCard.categoryId) {
        if (target.zone === 'pile') {
          await this.stackWordsOnPile(draggedCards, sourceInfo, target.pileIndex);
        }
      } else {
        // Карты разных категорий
        showWrongCategoryHint();
      }
    }
    return false;
  },

  async dropWordsOnPile(draggedCards, sourceInfo, targetPileIndex) {
    const targetPile = this.state.piles[targetPileIndex];
    if (!targetPile) return;

    if (targetPile.length === 0) {
      // Уменьшаем ходы только если они не бесконечные (movesLeft > 0)
      if (sourceInfo.zone === 'pile' && this.state.movesLeft > 0) {
        this.state.movesLeft--;
      }
      
      // Определяем открытое состояние ДО удаления карт из исходной стопки
      let shouldOpenAll = false;
      if (sourceInfo.zone === 'pile') {
        const sourcePile = this.state.piles[sourceInfo.pileIndex];
        if (sourcePile) {
          const firstCardIndex = sourcePile.indexOf(draggedCards[0]);
          if (firstCardIndex !== -1) {
            const sourceOpenFrom = this.state.pilesOpenFrom[sourceInfo.pileIndex] ?? Math.max(0, sourcePile.length - 1);
            // Если первая карта была открыта, то все карты в draggedCards были открыты
            shouldOpenAll = firstCardIndex >= sourceOpenFrom;
          }
        }
      } else if (sourceInfo.zone === 'discard') {
        // Карты из discard всегда открыты
        shouldOpenAll = true;
      }
      
      playGameSound('kart');
      this.removeCardsFromSource(draggedCards, sourceInfo);
      targetPile.push(...draggedCards);
      
      // Сохраняем открытое состояние всех перемещаемых карт
      if (shouldOpenAll) {
        // Все перемещаемые карты были открыты - открываем все в новой стопке
        this.state.pilesOpenFrom[targetPileIndex] = 0;
      } else {
        // Первая карта была закрыта - открываем только верхнюю
        this.state.pilesOpenFrom[targetPileIndex] = Math.max(0, targetPile.length - 1);
      }
      
      setStatusText('Карты перемещены');
      return;
    }

    const topCard = this.state.cardsById[targetPile[targetPile.length - 1]];
    const firstDraggedCard = this.state.cardsById[draggedCards[0]];

    // Нельзя класть карты на Джокера
    if (topCard.type === 'JOKER') {
      setStatusText('🃏 На Джокера нельзя класть карты!');
      return;
    }

    if (topCard.type === 'WORD' && firstDraggedCard.type === 'WORD' && 
        topCard.categoryId === firstDraggedCard.categoryId) {
      await this.stackWordsOnPile(draggedCards, sourceInfo, targetPileIndex);
    }
  },

  async dropWordsOnSlot(draggedCards, sourceInfo, slotIndex) {
    const slot = this.state.categorySlots[slotIndex];
    if (!slot) {
      // Пытаемся положить обычную карту в пустой слот категории
      showCategorySlotHint();
      return false;
    }

    return await this.dropWordsOnSlotByCategory(draggedCards, sourceInfo, slot);
  },

  async dropWordsOnSlotByCategory(draggedCards, sourceInfo, slot) {
    const firstCard = this.state.cardsById[draggedCards[0]];
    if (firstCard.type !== 'WORD') return false;

    const allMatch = draggedCards.every(cardId => {
      const card = this.state.cardsById[cardId];
      return card && card.type === 'WORD' && card.categoryId === slot.categoryId;
    });

    if (!allMatch) {
      showDifferentCategoryHint();
      return false;
    }

    // Уменьшаем ходы при перемещении карт в категорию (кроме бесконечных ходов)
    if (this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }

    playGameSound('good');
    
    // Немедленно удаляем карты из источника и добавляем в категорию
    this.removeCardsFromSource(draggedCards, sourceInfo);

    draggedCards.forEach(cardId => {
      slot.cards.push(cardId);
      slot.collectedCount++;
    });

    const category = this.state.cardsById[slot.categoryId];
    setStatusText(`${draggedCards.length} карт добавлено в "${category.title}"`);

    if (slot.collectedCount >= slot.needed) {
      // Сначала обновляем UI чтобы карты исчезли из источника
      renderGameState(this.state);
      await this.completeCategory(slot);
      await this.checkGameOver();
      // renderGameState вызывается внутри completeCategory после анимации
    } else {
      await this.checkGameOver();
      renderGameState(this.state);
    }

    return true;
  },

  async stackWordsOnPile(draggedCards, sourceInfo, targetPileIndex) {
    // Уменьшаем ходы только если они не бесконечные (movesLeft > 0)
    if (sourceInfo.zone === 'pile' && sourceInfo.pileIndex !== targetPileIndex && this.state.movesLeft > 0) {
      this.state.movesLeft--;
    }
    
    // Определяем открытое состояние ДО удаления карт из исходной стопки
    let draggedCardsWereOpen = false;
    if (sourceInfo.zone === 'pile') {
      const sourcePile = this.state.piles[sourceInfo.pileIndex];
      if (sourcePile) {
        const firstCardIndex = sourcePile.indexOf(draggedCards[0]);
        if (firstCardIndex !== -1) {
          const sourceOpenFrom = this.state.pilesOpenFrom[sourceInfo.pileIndex] ?? Math.max(0, sourcePile.length - 1);
          draggedCardsWereOpen = firstCardIndex >= sourceOpenFrom;
        }
      }
    } else if (sourceInfo.zone === 'discard') {
      draggedCardsWereOpen = true;
    }
    
    playGameSound('kart');
    this.removeCardsFromSource(draggedCards, sourceInfo);
    this.state.piles[targetPileIndex].push(...draggedCards);
    const newLen = this.state.piles[targetPileIndex].length;
    const prevOpenFrom = this.state.pilesOpenFrom[targetPileIndex] ?? Math.max(0, newLen - 1);
    
    if (draggedCardsWereOpen) {
      // Если перемещаемые карты были открыты, сохраняем их открытыми
      // Устанавливаем openFrom так, чтобы все перемещаемые карты остались открытыми
      const draggedCardsStartIndex = newLen - draggedCards.length;
      this.state.pilesOpenFrom[targetPileIndex] = Math.min(prevOpenFrom, draggedCardsStartIndex);
    } else {
      // Если перемещаемые карты были закрыты, сохраняем текущее состояние целевой стопки
      const maxOpenFrom = Math.max(0, newLen - 1);
      this.state.pilesOpenFrom[targetPileIndex] = Math.min(prevOpenFrom, maxOpenFrom);
    }
    
    setStatusText('Карты объединены');
    
    // Уведомляем туториал о складывании карт
    Tutorial.onCardsStacked();
  },

  removeCardsFromSource(cardIds, sourceInfo) {
    if (sourceInfo.zone === 'discard') {
      if (this.state.discard.length > 0 && cardIds.includes(this.state.discard[this.state.discard.length - 1])) {
        this.state.discard.pop();
      }
    } else if (sourceInfo.zone === 'pile') {
      const pile = this.state.piles[sourceInfo.pileIndex];
      cardIds.forEach(cardId => {
        const index = pile.indexOf(cardId);
        if (index !== -1) {
          pile.splice(index, 1);
        }
      });
      this.updatePileOpenFromAfterRemoval(sourceInfo.pileIndex);
    }
  },

  updatePileOpenFromAfterRemoval(pileIndex) {
    const pile = this.state.piles[pileIndex];
    if (!pile) return;
    if (pile.length === 0) {
      this.state.pilesOpenFrom[pileIndex] = 0;
      return;
    }
    const prevOpenFrom = this.state.pilesOpenFrom[pileIndex] ?? Math.max(0, pile.length - 1);
    
    // Если prevOpenFrom >= pile.length, значит все открытые карты были удалены
    // В этом случае открываем следующую закрытую карту (если она есть)
    if (prevOpenFrom >= pile.length) {
      // Открываем только одну карту (верхнюю закрытую)
      this.state.pilesOpenFrom[pileIndex] = Math.max(0, pile.length - 1);
    } else {
      // Если остались открытые карты, просто сохраняем индекс (но не меньше текущей длины)
      // Это гарантирует, что мы не откроем лишние карты
      this.state.pilesOpenFrom[pileIndex] = prevOpenFrom;
    }
  },

  reset() {
    // Не сбрасываем подсказки при перезапуске уровня
    if (this.state.levelId) {
      this.startLevel(this.state.levelId);
    }
  },

  findAvailableMoves() {
    const moves = [];
    const emptyPiles = [];

    // Сначала находим пустые столбцы
    this.state.piles.forEach((pile, pileIndex) => {
      if (pile.length === 0) {
        emptyPiles.push(pileIndex);
      }
    });

    // Проверяем открытые карты в стопках
    this.state.piles.forEach((pile, pileIndex) => {
      if (pile.length === 0) return;
      const openFrom = this.state.pilesOpenFrom[pileIndex] ?? Math.max(0, pile.length - 1);
      const topCardId = pile[pile.length - 1];
      const topCard = this.state.cardsById[topCardId];
      if (!topCard) return;

      const sourceInfo = { zone: 'pile', pileIndex };
      if (this.canTakeCard(topCardId, sourceInfo)) {
        const target = this.findTargetForCard(topCardId, sourceInfo);
        if (target) {
          moves.push({
            cardId: topCardId,
            sourceInfo,
            target,
            priority: 1, // Высокий приоритет - прямой ход к категории
          });
        } else if (emptyPiles.length > 0 && pile.length > 1) {
          // Если нет прямого хода, но есть пустые столбцы и под картой есть другие карты
          // Проверяем, есть ли под этой картой закрытые карты, которые можно освободить
          const openFrom = this.state.pilesOpenFrom[pileIndex] ?? Math.max(0, pile.length - 1);
          // Если есть закрытые карты под открытыми (openFrom > 0), то можно переместить верхнюю карту
          if (openFrom > 0) {
            moves.push({
              cardId: topCardId,
              sourceInfo,
              target: { type: 'pile', pileIndex: emptyPiles[0] },
              priority: 2, // Низкий приоритет - ход для освобождения карты
            });
          }
        }
      }
    });

    // Проверяем карты в discard
    if (this.state.discard.length > 0) {
      const topDiscardCardId = this.state.discard[this.state.discard.length - 1];
      const topDiscardCard = this.state.cardsById[topDiscardCardId];
      if (topDiscardCard) {
        const sourceInfo = { zone: 'discard', pileIndex: -1 };
        const target = this.findTargetForCard(topDiscardCardId, sourceInfo);
        if (target) {
          moves.push({
            cardId: topDiscardCardId,
            sourceInfo,
            target,
            priority: 1,
          });
        } else if (emptyPiles.length > 0) {
          // Если нет прямого хода, но есть пустые столбцы - можно переместить туда
          moves.push({
            cardId: topDiscardCardId,
            sourceInfo,
            target: { type: 'pile', pileIndex: emptyPiles[0] },
            priority: 2,
          });
        }
      }
    }

    // Сортируем по приоритету (сначала прямые ходы, потом ходы в пустые столбцы)
    moves.sort((a, b) => (a.priority || 1) - (b.priority || 1));

    return moves;
  },

  findTargetForCard(cardId, sourceInfo) {
    const card = this.state.cardsById[cardId];
    if (!card) return null;

    if (card.type === 'CATEGORY') {
      // Ищем пустой слот
      const emptySlotIndex = this.state.categorySlots.findIndex(slot => slot === null);
      if (emptySlotIndex !== -1) {
        return { type: 'slot', slotIndex: emptySlotIndex };
      }
      // Ищем карту WORD той же категории в стопке (категория может быть размещена на свою стопку)
      for (let pileIndex = 0; pileIndex < this.state.piles.length; pileIndex++) {
        const pile = this.state.piles[pileIndex];
        if (pile.length === 0) continue;
        const topCardId = pile[pile.length - 1];
        const topCard = this.state.cardsById[topCardId];
        if (topCard && topCard.type === 'WORD' && topCard.categoryId === cardId) {
          // Проверяем что это не та же стопка
          if (sourceInfo.zone === 'pile' && sourceInfo.pileIndex === pileIndex) {
            continue;
          }
          return { type: 'card', cardId: topCardId, zone: 'pile', pileIndex };
        }
      }
      // Ищем пустую стопку
      const emptyPileIndex = this.state.piles.findIndex(pile => pile.length === 0);
      if (emptyPileIndex !== -1) {
        return { type: 'pile', pileIndex: emptyPileIndex };
      }
    } else if (card.type === 'WORD') {
      // Ищем категорию в слоте
      const targetSlot = this.state.categorySlots.find(
        slot => slot && slot.categoryId === card.categoryId
      );
      if (targetSlot) {
        return { type: 'slot', slotIndex: targetSlot.slotIndex };
      }
      // Ищем карту WORD той же категории в стопке
      for (let pileIndex = 0; pileIndex < this.state.piles.length; pileIndex++) {
        const pile = this.state.piles[pileIndex];
        if (pile.length === 0) continue;
        const topCardId = pile[pile.length - 1];
        const topCard = this.state.cardsById[topCardId];
        if (topCard && topCard.type === 'WORD' && topCard.categoryId === card.categoryId) {
          // Проверяем что это не та же стопка
          if (sourceInfo.zone === 'pile' && sourceInfo.pileIndex === pileIndex) {
            continue;
          }
          return { type: 'card', cardId: topCardId, zone: 'pile', pileIndex };
        }
      }
    }

    return null;
  },

  onPointerDown(x, y, event) {
  },

  onPointerMove(x, y, event) {
  },

  onPointerUp(x, y, event) {
  },

  buyExtraMoves(amount = 10, cost = 1500) {
    // Нельзя покупать ходы если они бесконечные
    if (this.state.movesLeft === -1) {
      setStatusText('У вас уже бесконечные ходы!');
      return false;
    }
    
    const coins = this.spendCoins(cost);
    if (coins !== null) {
      this.state.movesLeft += amount;
      this.state.isLevelFailed = false;
      renderGameState(this.state);
      setStatusText(`Куплено ${amount} ходов за ${cost} монет`);
      return true;
    } else {
      setStatusText('Недостаточно монет');
      return false;
    }
  },

  async watchAdForMoves(amount = 10) {
    // Нельзя получать ходы если они бесконечные
    if (this.state.movesLeft === -1) {
      setStatusText('У вас уже бесконечные ходы!');
      return false;
    }
    
    // Показываем rewarded рекламу
    const { showRewardedAd } = await import('./playgama_sdk.js');
    const result = await showRewardedAd('extra_moves');
    
    if (result.rewarded) {
      this.state.movesLeft += amount;
      this.state.isLevelFailed = false;
      renderGameState(this.state);
      setStatusText(`Получено ${amount} ходов за просмотр рекламы`);
      return true;
    } else {
      setStatusText('Реклама не просмотрена');
      return false;
    }
  },
};
