import { t, translateCardTitle } from './localization.js';

let previousState = null;

// Функция обновления всех локализованных текстов
export function updateLocalization() {
  // Ходы
  const movesTitle = document.querySelector('.moves-title');
  if (movesTitle) movesTitle.textContent = t('MOVES');
  
  // Уровень
  const levelTitle = document.getElementById('level-title');
  if (levelTitle) {
    const levelNum = levelTitle.textContent.match(/\d+/)?.[0] || '1';
    levelTitle.textContent = `${t('LEVEL')} ${levelNum}`;
  }
  
  // Модальное окно поражения
  const modalTitle = document.querySelector('#game-over-modal .modal-title');
  if (modalTitle) modalTitle.textContent = t('MOVES_ENDED');
  
  const modalSubtitle = document.querySelector('#game-over-modal .modal-subtitle');
  if (modalSubtitle) modalSubtitle.textContent = t('ADD_MOVES');
  
  const restartText = document.querySelector('#btn-restart-level .btn-restart-text');
  if (restartText) restartText.textContent = t('RESTART_LEVEL');
  
  // Модальное окно победы
  const victoryLevelText = document.querySelector('.victory-level-text');
  if (victoryLevelText) {
    const levelNum = document.getElementById('victory-level-number')?.textContent || '1';
    victoryLevelText.innerHTML = `${t('LEVEL')} <span id="victory-level-number">${levelNum}</span>`;
  }
  
  const excellent = document.querySelector('.victory-excellent');
  if (excellent) excellent.textContent = t('EXCELLENT');
  
  const continueText = document.querySelector('.btn-continue-text');
  if (continueText) continueText.textContent = t('CONTINUE');
  
  // Настройки
  const settingsTitle = document.querySelector('.settings-title');
  if (settingsTitle) settingsTitle.textContent = t('MENU');
  
  const soundLabel = document.querySelector('.settings-label');
  if (soundLabel) soundLabel.textContent = t('SOUND');
  
  const restartMenuText = document.querySelector('.btn-restart-menu .btn-restart-text');
  if (restartMenuText) restartMenuText.textContent = t('RESTART');
  const buyHintTitle = document.querySelector('.buy-hint-title');
  if (buyHintTitle) buyHintTitle.textContent = t('BUY_HINT');
  
  const buyHintText = document.querySelector('.btn-buy-hint-text');
  if (buyHintText) buyHintText.textContent = t('BUY');
  
  // Окно рекламы за монеты
  const adCoinsTitle = document.querySelector('#ad-coins-modal .buy-hint-title');
  if (adCoinsTitle) adCoinsTitle.textContent = t('GET_COINS');
  
  const watchAdCoinsText = document.querySelector('#btn-watch-ad-coins .ad-text');
  if (watchAdCoinsText) watchAdCoinsText.textContent = t('WATCH_AD');
  
  // Магазин
  const shopTitle = document.querySelector('.shop-title');
  if (shopTitle) shopTitle.textContent = t('SHOP');
  
  const premiumName = document.querySelector('.shop-item-premium .shop-item-name');
  if (premiumName) premiumName.textContent = t('PREMIUM_SET');
  
  const premiumDesc = document.querySelector('.shop-item-premium .shop-item-desc');
  if (premiumDesc) premiumDesc.textContent = t('PREMIUM_DESC');
  
  const noAdsName = document.querySelector('.shop-item-noads .shop-item-name');
  if (noAdsName) noAdsName.textContent = t('NO_ADS');
  
  const coinsSectionTitle = document.querySelector('.shop-section-title');
  if (coinsSectionTitle) coinsSectionTitle.textContent = t('COINS');
  
  const forAdPrice = document.querySelector('.shop-coin-item[data-product="coins_reward_ad"] .shop-coin-price');
  if (forAdPrice) forAdPrice.textContent = t('FOR_AD');
  
  // Кнопка рекламы за ходы
  const watchAdText = document.querySelector('#btn-watch-ad .btn-text');
  if (watchAdText) watchAdText.innerHTML = `<span class="btn-ad-icon">📺 AD</span> ${t('AD_MOVES')}`;
}

// Переменные для отслеживания побед подряд
let consecutiveWins = 0;
let lastWinLevel = 0;

// Сброс счётчика побед при проигрыше (вызывается из game_logic)
export function resetConsecutiveWins() {
  consecutiveWins = 0;
}

// Функция для воспроизведения звука кнопки
function playButtonSound() {
  // Используем общую систему звуков из game_logic.js
  import('./game_logic.js').then(({ playGameSound }) => {
    playGameSound('kliiik');
  }).catch(() => {});
}

function updateCoinsDisplay() {
  import('./game_logic.js').then(({ Game }) => {
    const coinsValue = document.getElementById('coins-value');
    if (coinsValue) {
      coinsValue.textContent = Game.getCoins();
    }
  });
}

function isEmojiSupported(emoji) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillText(emoji, 0, 0);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return data[0] !== 0 || data[1] !== 0 || data[2] !== 0 || data[3] !== 0;
}

export function initLayout(root) {
  root.innerHTML = `
    <div id="bg"></div>
    
    <!-- Независимые рамки слева -->
    <div id="coins-box" class="clickable-box">
      <img src="./monet.png" alt="монеты" class="coins-icon">
      <div id="coins-value">0</div>
      <div class="coins-plus">+</div>
    </div>
    
    <div id="moves-box">
      <div class="moves-title">Ходы</div>
      <div id="moves-value">0</div>
    </div>
    
    <!-- VK кнопки (показываются только на платформе VK) -->
    <button id="vk-share-btn" class="vk-social-btn vk-share-btn" style="display: none;" title="Поделиться">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
      </svg>
    </button>
    
    <button id="vk-group-btn" class="vk-social-btn vk-group-btn" style="display: none;" title="Группа VK">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </button>
    
    <div id="game-container">
      <div id="top-bar">
        <div id="level-title">Уровень 1</div>
        <div id="deck-area">
          <div id="deck-discard" class="deck-pile deck-pile--discard"></div>
          <div id="deck" class="deck-pile"></div>
        </div>
        <button id="btn-menu" class="btn-menu">
          <span class="menu-dot"></span>
          <span class="menu-dot"></span>
          <span class="menu-dot"></span>
        </button>
      </div>
      
      <div id="category-slots-container">
        <div id="category-slots"></div>
      </div>
      
      <div id="piles-container">
        <div id="piles"></div>
      </div>
      
      <div id="bottom-bar">
        <button id="btn-hint" class="btn-image btn-with-counter">
          <img src="./podsk1.png" alt="подсказка">
          <span id="hint-counter" class="hint-counter">2</span>
        </button>
        <button id="btn-undo" class="btn-image btn-with-counter">
          <img src="./podsk2.png" alt="отмена">
          <span id="undo-counter" class="hint-counter">2</span>
        </button>
      </div>
    </div>
    
    <div id="game-over-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-title">Ходы закончились</div>
        <div class="modal-subtitle">Можно добавить +10 ходов</div>
        <div class="modal-buttons">
          <button id="btn-buy-moves" class="btn-buy-moves btn-image">
            <img src="./zel_knp.png" alt="купить ходы">
            <span class="btn-text"><img src="./monet.png" alt="монета" class="btn-coin-icon">1500</span>
          </button>
          <button id="btn-watch-ad" class="btn-watch-ad btn-image">
            <img src="./org_knp.png" alt="реклама">
            <span class="btn-text"><span class="btn-ad-icon">📺 AD</span> +10 ходов</span>
          </button>
        </div>
        <button id="btn-restart-level" class="btn-restart-level btn-image">
          <img src="./bel_knp.png" alt="начать заново">
          <span class="btn-restart-text">Начать заново</span>
        </button>
      </div>
    </div>
    
    <div id="victory-modal" class="modal-overlay victory-overlay" style="display: none;">
      <div class="victory-content">
        <div class="victory-garlands">
          <div class="garland garland-1">🎉</div>
          <div class="garland garland-2">🎊</div>
          <div class="garland garland-3">🎈</div>
          <div class="garland garland-4">🎁</div>
          <div class="garland garland-5">⭐</div>
        </div>
        <div class="victory-level-text">Уровень <span id="victory-level-number">1</span></div>
        <div class="victory-excellent">Отлично!</div>
        <div class="victory-cards-container">
          <div class="victory-card victory-card-image victory-card-center">
            <img src="./win0.png" alt="победа" class="victory-card-img">
            <div class="card-light-rays"></div>
            <div class="card-glow"></div>
            <div class="card-stars"></div>
            <div class="card-coins-text">+50</div>
          </div>
        </div>
        <div class="victory-buttons">
          <button id="btn-triple-reward" class="btn-triple-reward btn-image">
            <img src="./org_knp.png" alt="+100">
            <span class="btn-triple-text">+100 📺 AD</span>
          </button>
          <button id="btn-continue" class="btn-continue btn-image">
            <img src="./zel_knp.png" alt="продолжить">
            <span class="btn-continue-text">Продолжить</span>
          </button>
        </div>
      </div>
    </div>
    
    <div id="settings-modal" class="modal-overlay" style="display: none;">
      <div class="settings-content settings-content-expanded">
        <button id="btn-close-settings" class="btn-close-settings">✕</button>
        <div class="settings-title">Настройки</div>
        <div class="settings-sound">
          <span class="settings-label">Звук</span>
          <label class="sound-toggle">
            <input type="checkbox" id="sound-toggle" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <button id="btn-restart-from-menu" class="btn-restart-menu btn-image">
          <img src="./org_knp.png" alt="начать заново">
          <span class="btn-restart-text">Начать заново</span>
        </button>
      </div>
    </div>
    
    <div id="buy-hint-modal" class="modal-overlay" style="display: none;">
      <div class="buy-hint-content">
        <button id="btn-close-buy-hint" class="btn-close-settings">✕</button>
        <div class="buy-hint-title">Купить подсказку?</div>
        <div class="buy-hint-cost">
          <img src="./monet.png" alt="монета" class="buy-hint-coin">
          <span class="buy-hint-price">800</span>
        </div>
        <button id="btn-confirm-buy-hint" class="btn-buy-hint-confirm btn-image">
          <img src="./zel_knp.png" alt="купить">
          <span class="btn-buy-hint-text">Купить</span>
        </button>
      </div>
    </div>
    
    <div id="ad-coins-modal" class="modal-overlay" style="display: none;">
      <div class="buy-hint-content">
        <button id="btn-close-ad-coins" class="btn-close-settings">✕</button>
        <div class="buy-hint-title">Получить монеты?</div>
        <div class="buy-hint-cost">
          <img src="./monet.png" alt="монета" class="buy-hint-coin">
          <span class="buy-hint-price">+300</span>
        </div>
        <div id="ad-cooldown-timer" class="ad-cooldown-timer" style="display: none;">
          <span class="cooldown-text">Доступно через</span>
          <span class="cooldown-time">0:00</span>
        </div>
        <button id="btn-watch-ad-coins" class="btn-buy-hint-confirm btn-image">
          <img src="./org_knp.png" alt="реклама">
          <span class="ad-text">Смотреть рекламу</span>
        </button>
      </div>
    </div>
    
    <div id="shop-modal" class="modal-overlay" style="display: none;">
      <div class="shop-content">
        <button id="btn-close-shop" class="btn-close-settings">✕</button>
        <div class="shop-title">Магазин</div>
        
        <button class="shop-item shop-item-premium" data-product="prem">
          <img src="./m7.png" alt="" class="premium-sprite">
          <div class="shop-item-info">
            <div class="shop-item-name">Премиум набор</div>
            <div class="shop-item-desc">Без рекламы + 9000 монет + по 5 подсказок</div>
          </div>
          <div class="shop-item-price-btn">
            <img src="./zel_knp.png" alt="" class="shop-price-bg">
            <span class="shop-price-text" data-price-id="prem">159 ЯН</span>
          </div>
        </button>
        
        <button class="shop-item shop-item-noads" data-product="bez_rek">
          <div class="shop-item-info">
            <div class="shop-item-name">Без межстраничной рекламы</div>
          </div>
          <div class="shop-item-price-btn">
            <img src="./zel_knp.png" alt="" class="shop-price-bg">
            <span class="shop-price-text" data-price-id="bez_rek">79 ЯН</span>
          </div>
        </button>
        
        <div class="shop-section-title">Монеты</div>
        
        <div class="shop-coins-grid">
          <button class="shop-coin-item" data-product="coins_reward_ad">
            <img src="./m1.png" alt="" class="shop-coin-img">
            <div class="shop-coin-amount">+300</div>
            <div class="shop-coin-price">За рекламу</div>
          </button>
          <button class="shop-coin-item" data-product="kup1500">
            <img src="./m2.png" alt="" class="shop-coin-img">
            <div class="shop-coin-amount">+1500</div>
            <div class="shop-coin-price" data-price-id="kup1500">30 ЯН</div>
          </button>
          <button class="shop-coin-item" data-product="kup7500">
            <img src="./m3.png" alt="" class="shop-coin-img">
            <div class="shop-coin-amount">+7500</div>
            <div class="shop-coin-price" data-price-id="kup7500">69 ЯН</div>
          </button>
          <button class="shop-coin-item" data-product="kup25000">
            <img src="./m4.png" alt="" class="shop-coin-img">
            <div class="shop-coin-amount">+25000</div>
            <div class="shop-coin-price" data-price-id="kup25000">239 ЯН</div>
          </button>
          <button class="shop-coin-item" data-product="kup50000">
            <img src="./m5.png" alt="" class="shop-coin-img">
            <div class="shop-coin-amount">+50000</div>
            <div class="shop-coin-price" data-price-id="kup50000">449 ЯН</div>
          </button>
          <button class="shop-coin-item" data-product="kup100000">
            <img src="./m6.png" alt="" class="shop-coin-img">
            <div class="shop-coin-amount">+100000</div>
            <div class="shop-coin-price" data-price-id="kup100000">809 ЯН</div>
          </button>
        </div>
      </div>
    </div>
    
    <div id="ad-countdown-overlay" class="ad-countdown-overlay" style="display: none;">
      <div class="ad-countdown-content">
        <div class="ad-countdown-text">Реклама через</div>
        <div class="ad-countdown-number">2</div>
      </div>
    </div>
  `;

  // Применяем локализацию после создания DOM
  updateLocalization();

  document.getElementById('btn-hint').addEventListener('click', () => {
    playButtonSound();
    import('./game_logic.js').then(({ Game }) => {
      if (Game.getHintCount() > 0) {
        if (Game.useHint()) {
          showHint(Game);
          updateHintCounters();
        }
      } else {
        // Если подсказок нет - проверяем хватает ли монет (800 для подсказки)
        if (Game.getCoins() >= 800) {
          showBuyHintModal('hint');
        } else {
          showAdCoinsModal();
        }
      }
    });
  });

  document.getElementById('btn-undo').addEventListener('click', () => {
    playButtonSound();
    import('./game_logic.js').then(async ({ Game }) => {
      if (Game.getUndoCount() > 0) {
        if (Game.useUndo()) {
          await Game.undo();
          updateHintCounters();
        }
      } else {
        // Если отмен нет - проверяем хватает ли монет (600 для отмены)
        if (Game.getCoins() >= 600) {
          showBuyHintModal('undo');
        } else {
          showAdCoinsModal();
        }
      }
    });
  });
  
  // Обработчик для кнопки меню
  document.getElementById('btn-menu').addEventListener('click', () => {
    playButtonSound();
    showSettingsModal();
  });
  
  // Обработчик для закрытия меню настроек
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    playButtonSound();
    hideSettingsModal();
  });
  
  // Обработчик для перезапуска из меню
  document.getElementById('btn-restart-from-menu').addEventListener('click', async () => {
    playButtonSound();
    hideSettingsModal();
    // Показываем межстраничную рекламу (с кулдауном 90 сек)
    const { showInterstitialAd } = await import('./playgama_sdk.js');
    await showInterstitialAd('restart_from_menu');
    const { Game } = await import('./game_logic.js');
    Game.reset();
  });
  
  // Обработчик для переключателя звука
  const soundToggle = document.getElementById('sound-toggle');
  
  // Инициализация состояния чекбокса из config
  import('./config.js').then(({ AUDIO_ENABLED_BY_DEFAULT }) => {
    soundToggle.checked = AUDIO_ENABLED_BY_DEFAULT;
  });
  
  soundToggle.addEventListener('change', (e) => {
    import('./audio.js').then((audio) => {
      if (audio.setSoundEnabled) {
        audio.setSoundEnabled(e.target.checked);
      }
    });
  });
  
  // Обработчики для модального окна покупки подсказки
  document.getElementById('btn-close-buy-hint').addEventListener('click', () => {
    hideBuyHintModal();
  });
  
  document.getElementById('btn-confirm-buy-hint').addEventListener('click', () => {
    import('./game_logic.js').then(({ Game }) => {
      const hintType = document.getElementById('buy-hint-modal').dataset.hintType;
      if (Game.buyHint(hintType)) {
        hideBuyHintModal();
        updateHintCounters();
        updateCoinsDisplay();
      }
    });
  });
  
  // Инициализируем счётчики подсказок
  updateHintCounters();
  
  // Обработчик для открытия окна рекламы за монеты
  document.getElementById('coins-box').addEventListener('click', () => {
    showAdCoinsModal();
  });
  
  // Обработчик для закрытия окна рекламы за монеты
  document.getElementById('btn-close-ad-coins').addEventListener('click', () => {
    hideAdCoinsModal();
  });
  
  // Обработчик для просмотра рекламы за монеты
  document.getElementById('btn-watch-ad-coins').addEventListener('click', async () => {
    playButtonSound();
    const { showShopRewardedAd, getShopRewardedCooldown } = await import('./playgama_sdk.js');
    const cooldown = getShopRewardedCooldown();
    if (cooldown > 0) {
      // Кулдаун активен - ничего не делаем, таймер уже показан
      return;
    }
    const result = await showShopRewardedAd();
    if (result.rewarded) {
      const { Game } = await import('./game_logic.js');
      Game.addCoins(300);
      updateCoinsDisplay();
      hideAdCoinsModal();
    }
  });
  
  // Обработчик для закрытия магазина
  document.getElementById('btn-close-shop').addEventListener('click', () => {
    hideShopModal();
  });
  
  // Обработчики для покупок в магазине (заглушки)
  document.querySelectorAll('.shop-item, .shop-coin-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.dataset.product;
      handleShopPurchase(product);
    });
  });

  // Обработчики для окна конца игры
  document.getElementById('btn-buy-moves').addEventListener('click', () => {
    import('./game_logic.js').then(({ Game }) => {
      if (Game.buyExtraMoves(10, 1500)) {
        hideGameOverModal();
        // updateCoinsDisplay вызывается автоматически в renderGameState
      } else {
        // Если не хватает монет, обновляем счетчик чтобы показать актуальное значение
        updateCoinsDisplay();
      }
    });
  });

  document.getElementById('btn-watch-ad').addEventListener('click', () => {
    import('./game_logic.js').then(({ Game }) => {
      Game.watchAdForMoves(10);
      hideGameOverModal();
    });
  });

  document.getElementById('btn-restart-level').addEventListener('click', async () => {
    hideGameOverModal();
    // Показываем межстраничную рекламу (с кулдауном 90 сек)
    const { showInterstitialAd } = await import('./playgama_sdk.js');
    await showInterstitialAd('restart_level');
    const { Game } = await import('./game_logic.js');
    Game.reset();
  });

  // Инициализируем счетчик монет при загрузке
  updateCoinsDisplay();

  // Обработчик для кнопки "+100" (бонус за рекламу)
  document.getElementById('btn-triple-reward').addEventListener('click', async () => {
    playButtonSound();
    const { showRewardedAd } = await import('./playgama_sdk.js');
    const result = await showRewardedAd('bonus_reward');
    if (result.rewarded) {
      const { Game } = await import('./game_logic.js');
      // Начисляем +100 монет сразу
      Game.addCoins(100);
      // Обновляем отображаемую сумму на карточке
      const coinsText = document.querySelector('.card-coins-text');
      if (coinsText) {
        const currentValue = parseInt(coinsText.textContent.replace('+', '')) || 50;
        coinsText.textContent = `+${currentValue + 100}`;
      }
      updateCoinsDisplay();
      // Скрываем кнопку
      const btn = document.getElementById('btn-triple-reward');
      if (btn) btn.style.display = 'none';
    }
  });

  // Обработчик для кнопки "Продолжить" в окне выигрыша
  document.getElementById('btn-continue').addEventListener('click', async () => {
    playButtonSound();
    const { Game } = await import('./game_logic.js');
    const currentLevel = Game.state.levelId;
    
    hideVictoryModal();
    
    // Показываем межстраничную рекламу (с кулдауном 90 сек)
    const { showInterstitialAd } = await import('./playgama_sdk.js');
    await showInterstitialAd('next_level');
    
    // Переход на следующий уровень
    if (currentLevel) {
      Game.startLevel(currentLevel + 1);
    }
  });

  // Инициализация VK кнопок (только для платформы VK)
  initVKButtons();

}

// Инициализация VK кнопок
async function initVKButtons() {
  const { isVKPlatform, openVKGroup, shareVK } = await import('./playgama_sdk.js');
  
  console.log('initVKButtons: isVKPlatform =', isVKPlatform());
  
  if (!isVKPlatform()) {
    return; // Не VK платформа - кнопки остаются скрытыми
  }
  
  console.log('VK platform detected, showing buttons');
  
  // Показываем кнопки
  const shareBtn = document.getElementById('vk-share-btn');
  const groupBtn = document.getElementById('vk-group-btn');
  
  if (shareBtn) {
    shareBtn.style.display = 'flex';
    shareBtn.addEventListener('click', async () => {
      console.log('VK share button clicked');
      playButtonSound();
      await shareVK();
    });
  }
  
  if (groupBtn) {
    groupBtn.style.display = 'flex';
    groupBtn.addEventListener('click', () => {
      console.log('VK group button clicked');
      playButtonSound();
      openVKGroup();
    });
  }
}

export function showGameOverModal() {
  removeAllPhantoms();
  const modal = document.getElementById('game-over-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Сообщаем платформе об остановке геймплея
    import('./playgama_sdk.js').then(({ gameplayStop }) => gameplayStop());
  }
}

export function hideGameOverModal() {
  const modal = document.getElementById('game-over-modal');
  if (modal) {
    modal.style.display = 'none';
    // Сообщаем платформе о возобновлении геймплея
    import('./playgama_sdk.js').then(({ gameplayStart }) => gameplayStart());
  }
}

export function showSettingsModal() {
  removeAllPhantoms();
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'flex';
    import('./playgama_sdk.js').then(({ gameplayStop }) => gameplayStop());
  }
}

export function hideSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'none';
    import('./playgama_sdk.js').then(({ gameplayStart }) => gameplayStart());
  }
}

export function showBuyHintModal(hintType) {
  removeAllPhantoms();
  const modal = document.getElementById('buy-hint-modal');
  if (modal) {
    modal.dataset.hintType = hintType;
    const priceElement = modal.querySelector('.buy-hint-price');
    if (priceElement) {
      priceElement.textContent = hintType === 'undo' ? '600' : '800';
    }
    modal.style.display = 'flex';
    import('./playgama_sdk.js').then(({ gameplayStop }) => gameplayStop());
  }
}

export function hideBuyHintModal() {
  const modal = document.getElementById('buy-hint-modal');
  if (modal) {
    modal.style.display = 'none';
    import('./playgama_sdk.js').then(({ gameplayStart }) => gameplayStart());
  }
}

export function showAdCoinsModal() {
  removeAllPhantoms();
  const modal = document.getElementById('ad-coins-modal');
  if (modal) {
    modal.style.display = 'flex';
    import('./playgama_sdk.js').then(({ gameplayStop }) => gameplayStop());
    // Запускаем обновление таймера кулдауна
    updateAdCooldownTimer();
  }
}

// Интервал для обновления таймера
let adCooldownInterval = null;

// Обновление таймера кулдауна рекламы
async function updateAdCooldownTimer() {
  const timerEl = document.getElementById('ad-cooldown-timer');
  const btnWatch = document.getElementById('btn-watch-ad-coins');
  if (!timerEl || !btnWatch) return;
  
  // Очищаем предыдущий интервал
  if (adCooldownInterval) {
    clearInterval(adCooldownInterval);
    adCooldownInterval = null;
  }
  
  const { getShopRewardedCooldown } = await import('./playgama_sdk.js');
  
  const updateTimer = () => {
    const cooldown = getShopRewardedCooldown();
    if (cooldown > 0) {
      const minutes = Math.floor(cooldown / 60);
      const seconds = cooldown % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      timerEl.querySelector('.cooldown-time').textContent = timeStr;
      timerEl.style.display = 'flex';
      btnWatch.style.opacity = '0.5';
      btnWatch.style.pointerEvents = 'none';
    } else {
      timerEl.style.display = 'none';
      btnWatch.style.opacity = '1';
      btnWatch.style.pointerEvents = 'auto';
      if (adCooldownInterval) {
        clearInterval(adCooldownInterval);
        adCooldownInterval = null;
      }
    }
  };
  
  updateTimer();
  // Обновляем каждую секунду
  adCooldownInterval = setInterval(updateTimer, 1000);
}

export function hideAdCoinsModal() {
  const modal = document.getElementById('ad-coins-modal');
  if (modal) {
    modal.style.display = 'none';
    import('./playgama_sdk.js').then(({ gameplayStart }) => gameplayStart());
  }
  // Очищаем интервал таймера
  if (adCooldownInterval) {
    clearInterval(adCooldownInterval);
    adCooldownInterval = null;
  }
}

export function showShopModal() {
  removeAllPhantoms();
  const modal = document.getElementById('shop-modal');
  if (modal) {
    modal.style.display = 'flex';
    import('./playgama_sdk.js').then(({ gameplayStop }) => gameplayStop());
    // Обновляем цены из SDK при открытии магазина
    updateShopPrices();
    // Обновляем состояние кнопки "Без рекламы"
    updateNoAdsButton();
    // Обновляем состояние кнопки рекламы за монеты
    updateShopAdCooldown();
  }
}

// Интервал для обновления таймера в магазине
let shopAdCooldownInterval = null;

// Обновление кнопки рекламы за монеты в магазине
async function updateShopAdCooldown() {
  const adBtn = document.querySelector('.shop-coin-item[data-product="coins_reward_ad"]');
  if (!adBtn) return;
  
  const priceEl = adBtn.querySelector('.shop-coin-price');
  if (!priceEl) return;
  
  // Очищаем предыдущий интервал
  if (shopAdCooldownInterval) {
    clearInterval(shopAdCooldownInterval);
    shopAdCooldownInterval = null;
  }
  
  const { getShopRewardedCooldown } = await import('./playgama_sdk.js');
  
  const updateTimer = () => {
    const cooldown = getShopRewardedCooldown();
    if (cooldown > 0) {
      const minutes = Math.floor(cooldown / 60);
      const seconds = cooldown % 60;
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      priceEl.textContent = timeStr;
      priceEl.classList.add('cooldown-active');
      adBtn.style.opacity = '0.6';
    } else {
      priceEl.textContent = t('FOR_AD');
      priceEl.classList.remove('cooldown-active');
      adBtn.style.opacity = '1';
      if (shopAdCooldownInterval) {
        clearInterval(shopAdCooldownInterval);
        shopAdCooldownInterval = null;
      }
    }
  };
  
  updateTimer();
  // Обновляем каждую секунду
  shopAdCooldownInterval = setInterval(updateTimer, 1000);
}

export function hideShopModal() {
  const modal = document.getElementById('shop-modal');
  if (modal) {
    modal.style.display = 'none';
    import('./playgama_sdk.js').then(({ gameplayStart }) => gameplayStart());
  }
  // Очищаем интервал таймера
  if (shopAdCooldownInterval) {
    clearInterval(shopAdCooldownInterval);
    shopAdCooldownInterval = null;
  }
}

async function handleShopPurchase(productId) {
  console.log('Покупка:', productId);
  
  const { Game } = await import('./game_logic.js');
  
  // Реклама за монеты - особый случай
  if (productId === 'coins_reward_ad') {
    const { showShopRewardedAd, getShopRewardedCooldown } = await import('./playgama_sdk.js');
    const cooldown = getShopRewardedCooldown();
    if (cooldown > 0) {
      // Кулдаун активен - обновляем отображение на кнопке
      updateShopAdCooldown();
      return;
    }
    const result = await showShopRewardedAd();
    if (result.rewarded) {
      Game.addCoins(300);
      updateCoinsDisplay();
    }
    return;
  }
  
  // IAP покупки через SDK
  const { makePurchase } = await import('./playgama_sdk.js');
  const purchaseResult = await makePurchase(productId);
  
  if (purchaseResult.success) {
    // Обновляем UI после успешной покупки
    updateCoinsDisplay();
    updateHintCounters();
    
    // Закрываем магазин после успешной покупки
    hideShopModal();
  } else if (purchaseResult.error) {
    console.log('Покупка отменена или ошибка:', purchaseResult.error);
  }
}

// Обновление цен в магазине из SDK
async function updateShopPrices() {
  try {
    const { getAllProductPrices } = await import('./playgama_sdk.js');
    const prices = getAllProductPrices();
    
    if (Object.keys(prices).length === 0) {
      console.log('Каталог товаров пуст, используем цены по умолчанию');
      return;
    }
    
    // Обновляем все элементы с data-price-id
    document.querySelectorAll('[data-price-id]').forEach(el => {
      const priceId = el.dataset.priceId;
      const priceData = prices[priceId];
      
      if (priceData && priceData.price) {
        // Используем цену из SDK (уже включает валюту)
        el.textContent = priceData.price;
      }
    });
    
    console.log('Цены в магазине обновлены из SDK');
  } catch (error) {
    console.warn('Ошибка обновления цен:', error);
  }
}

// Обновление состояния кнопки "Без рекламы" в магазине
async function updateNoAdsButton() {
  try {
    const { isAdsDisabledByPurchase } = await import('./playgama_sdk.js');
    const noAdsBtn = document.querySelector('.shop-item-noads');
    
    if (noAdsBtn && isAdsDisabledByPurchase()) {
      noAdsBtn.style.opacity = '0.5';
      noAdsBtn.style.pointerEvents = 'none';
      noAdsBtn.style.cursor = 'default';
      const nameEl = noAdsBtn.querySelector('.shop-item-name');
      if (nameEl) {
        nameEl.textContent = t('NO_ADS') + ' ✓';
      }
    }
  } catch (error) {
    console.warn('Ошибка обновления кнопки без рекламы:', error);
  }
}

export function updateHintCounters() {
  import('./game_logic.js').then(({ Game }) => {
    const hintCounter = document.getElementById('hint-counter');
    const undoCounter = document.getElementById('undo-counter');
    
    if (hintCounter) {
      const hintCount = Game.getHintCount();
      hintCounter.className = 'hint-counter';
      hintCounter.innerHTML = hintCount;
      hintCounter.style.display = hintCount > 0 ? 'flex' : 'none';
    }
    
    if (undoCounter) {
      const undoCount = Game.getUndoCount();
      undoCounter.className = 'hint-counter';
      undoCounter.innerHTML = undoCount;
      undoCounter.style.display = undoCount > 0 ? 'flex' : 'none';
    }
  });
}

export function showVictoryModal(levelId, coinsEarned = 50) {
  removeAllPhantoms();
  const modal = document.getElementById('victory-modal');
  const levelNumber = document.getElementById('victory-level-number');
  const coinsText = document.querySelector('.card-coins-text');
  const tripleBtn = document.getElementById('btn-triple-reward');
  
  // Воспроизводим звук победы
  import('./game_logic.js').then(({ playGameSound }) => {
    playGameSound('win');
  });
  
  if (modal) {
    if (levelNumber) {
      levelNumber.textContent = levelId;
    }
    if (coinsText) {
      coinsText.textContent = `+${coinsEarned}`;
    }
    // Показываем кнопку +100 (сбрасываем состояние)
    if (tripleBtn) {
      tripleBtn.style.display = '';
    }
    modal.style.display = 'flex';
    
    // Сообщаем платформе об остановке геймплея
    import('./playgama_sdk.js').then(({ gameplayStop }) => gameplayStop());
    
    const victoryContent = document.querySelector('.victory-content');
    if (victoryContent) {
      startConfettiAnimation(victoryContent);
    }
    
    const cardImage = document.querySelector('.victory-card-image');
    if (cardImage) {
      animateStarsFromCard(cardImage);
    }
    
  }
}

export function hideVictoryModal() {
  const modal = document.getElementById('victory-modal');
  if (modal) {
    modal.style.display = 'none';
    // gameplayStart вызовется после показа рекламы в обработчике btn-continue
  }
}

function startConfettiAnimation(victoryContent) {
  let confettiContainer = victoryContent.querySelector('.confetti-container');
  if (!confettiContainer) {
    confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    victoryContent.insertBefore(confettiContainer, victoryContent.firstChild);
  }
  
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8e6cf', '#ffd93d', '#6bcf7f'];
  const confettiCount = 60;
  const baseDuration = 4000;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.backgroundColor = color;
      confetti.style.left = `${Math.random() * 100}%`;
      
      const duration = baseDuration + Math.random() * 2000;
      confetti.style.animationDuration = `${duration}ms`;
      confetti.style.animationDelay = `${Math.random() * 300}ms`;
      
      const driftX = (Math.random() - 0.5) * 100;
      confetti.style.setProperty('--drift-x', driftX);
      
      confettiContainer.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, duration + 1000);
    }, i * 40);
  }
}

function animateStarsFromCard(cardElement) {
  const cardRect = cardElement.getBoundingClientRect();
  const centerX = cardRect.left + cardRect.width / 2;
  const centerY = cardRect.top + cardRect.height / 2;
  
  const starsContainer = cardElement.querySelector('.card-stars');
  if (!starsContainer) return;
  
  const starCount = 12;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star-particle';
    star.textContent = '⭐';
    star.style.left = `${centerX}px`;
    star.style.top = `${centerY}px`;
    
    const angle = (Math.PI * 2 * i) / starCount;
    const distance = 150 + Math.random() * 50;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    star.style.setProperty('--star-x', `${x}px`);
    star.style.setProperty('--star-y', `${y}px`);
    star.style.position = 'fixed';
    star.style.transformOrigin = 'center';
    
    document.body.appendChild(star);
    
    setTimeout(() => {
      star.remove();
    }, 1500);
  }
}

function animateCoinsToCounter(amount) {
  const coinsBox = document.getElementById('coins-box');
  if (!coinsBox) return;

  const coinsBoxRect = coinsBox.getBoundingClientRect();
  const targetX = coinsBoxRect.left + coinsBoxRect.width / 2;
  const targetY = coinsBoxRect.top + coinsBoxRect.height / 2;

  // Монетки за оставшиеся ходы вылетают из рамки ходов
  const movesBox = document.getElementById('moves-box');
  if (!movesBox) return;
  
  const movesBoxRect = movesBox.getBoundingClientRect();
  const sourceX = movesBoxRect.left + movesBoxRect.width / 2;
  const sourceY = movesBoxRect.top + movesBoxRect.height / 2;
  const sourceWidth = movesBoxRect.width;
  const sourceHeight = movesBoxRect.height;
  
  const coinCount = Math.min(amount / 10, 15);
  
  for (let i = 0; i < coinCount; i++) {
    const randomOffsetX = (Math.random() - 0.5) * sourceWidth * 0.6;
    const randomOffsetY = (Math.random() - 0.5) * sourceHeight * 0.6;
    const startX = sourceX + randomOffsetX;
    const startY = sourceY + randomOffsetY;
    
    setTimeout(() => {
      createFlyingCoinWithSparks(startX, startY, targetX, targetY, i);
    }, 300 + i * 30);
  }

  setTimeout(() => {
    updateCoinsDisplay();
  }, 300 + coinCount * 30 + 1000);
}

function createFlyingCoinWithSparks(startX, startY, targetX, targetY, index) {
  const coin = document.createElement('img');
  coin.className = 'flying-coin';
  coin.src = './monet.png';
  coin.alt = 'монета';
  coin.style.position = 'fixed';
  coin.style.left = `${startX}px`;
  coin.style.top = `${startY}px`;
  coin.style.width = '40px';
  coin.style.height = '40px';
  coin.style.zIndex = '20000';
  coin.style.pointerEvents = 'none';
  coin.style.transform = 'translate(-50%, -50%)';
  coin.style.opacity = '1';

  document.body.appendChild(coin);

  setTimeout(() => {
    requestAnimationFrame(() => {
      coin.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      coin.style.left = `${targetX}px`;
      coin.style.top = `${targetY}px`;
      coin.style.transform = 'translate(-50%, -50%) scale(0.5)';
      coin.style.opacity = '0.9';
    });
  }, 100);

  setTimeout(() => {
    createSparks(targetX, targetY);
    coin.remove();
  }, 2100);
}

function createSparks(x, y) {
  const sparkCount = 8;
  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement('div');
    spark.className = 'spark-particle';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.position = 'fixed';
    
    const angle = (Math.PI * 2 * i) / sparkCount;
    const distance = 20 + Math.random() * 15;
    const sparkX = Math.cos(angle) * distance;
    const sparkY = Math.sin(angle) * distance;
    
    spark.style.transform = `translate(${sparkX}px, ${sparkY}px)`;
    
    document.body.appendChild(spark);
    
    setTimeout(() => {
      spark.remove();
    }, 500);
  }
}

export function renderGameState(state) {
  const levelTitle = document.getElementById('level-title');
  const movesValue = document.getElementById('moves-value');
  
  if (levelTitle) levelTitle.textContent = `${t('LEVEL')} ${state.levelId}`;
  if (movesValue) {
    movesValue.textContent = state.movesLeft === -1 ? '∞' : state.movesLeft;
    // Меняем цвет в зависимости от количества ходов
    movesValue.classList.remove('low-moves', 'critical-moves');
    if (state.movesLeft !== -1 && state.movesLeft <= 5 && state.movesLeft > 1) {
      movesValue.classList.add('low-moves');
    } else if (state.movesLeft !== -1 && state.movesLeft <= 1) {
      movesValue.classList.add('critical-moves');
    }
  }

  // Адаптивное масштабирование для мобильных: устанавливаем data-slots на body
  // в зависимости от количества слотов категорий (максимум 6)
  const slotsCount = state.categorySlots ? state.categorySlots.length : 0;
  if (slotsCount === 6) {
    document.body.setAttribute('data-slots', '6');
  } else {
    document.body.removeAttribute('data-slots');
  }

  // Обновляем счетчик монет и подсказок
  updateCoinsDisplay();
  updateHintCounters();

  // Окно выигрыша показывается из game_logic.js с правильной суммой монет
  // Здесь НЕ вызываем showVictoryModal чтобы избежать двойного показа
  
  // Показываем окно конца игры если закончились ходы
  // movesLeft === -1 означает бесконечные ходы, поэтому проверяем только === 0
  if (state.isLevelFailed || (state.movesLeft === 0 && !state.isLevelCompleted)) {
    showGameOverModal();
  } else {
    hideGameOverModal();
  }

  renderCategorySlots(state);
  renderDeckArea(state, previousState);
  renderPiles(state, previousState);
  
  previousState = JSON.parse(JSON.stringify(state));
  
  // Обновляем туториал после рендера с задержкой
  // Задержка нужна чтобы карты успели открыться (анимация flip)
  import('./tutorial.js').then(({ Tutorial }) => {
    setTimeout(() => {
      Tutorial.update();
    }, 300); // Задержка 300мс для завершения анимации открытия карт
  }).catch(() => {
    // Игнорируем ошибки если туториал не загружен
  });
}

export function animateCategoryDestroy(slotIndex) {
  const container = document.getElementById('category-slots');
  if (!container) return;
  
  const slots = container.querySelectorAll('.category-slot');
  const slotEl = slots[slotIndex];
  if (!slotEl) return;
  
  const card = slotEl.querySelector('.card--category');
  if (!card) return;
  
  // Добавляем класс анимации
  card.classList.add('category-destroying');
  
  // Создаём частицы-звёзды
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const particles = ['⭐', '✨', '💫', '🌟'];
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'category-destroy-particle';
    particle.textContent = particles[i % particles.length];
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 60 + Math.random() * 40;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    particle.style.setProperty('--particle-x', `${x}px`);
    particle.style.setProperty('--particle-y', `${y}px`);
    particle.style.animation = `categoryStars 0.8s ease-out forwards`;
    particle.style.transform = `translate(${x}px, ${y}px)`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 800);
  }
}

function renderCategorySlots(state) {
  const container = document.getElementById('category-slots');
  if (!container) return;

  container.innerHTML = '';

  state.categorySlots.forEach((slot, index) => {
    const slotEl = document.createElement('div');
    slotEl.className = 'category-slot';

    if (slot === null) {
      slotEl.innerHTML = '<div class="empty-slot"><img src="./koron.png" alt="корона" class="koron-img"></div>';
    } else {
      const category = state.cardsById[slot.categoryId];
      if (category) {
        const emoji = category.emoji ? `<div class="card-emoji">${category.emoji}</div>` : '';
        const translatedTitle = translateCardTitle(category.title);
        const title = category.emoji ? '' : `<div class="card-title">${translatedTitle}</div>`;
        slotEl.innerHTML = `
          <div class="card card--category card--in-slot" data-card-id="${slot.categoryId}">
            ${title}
            ${emoji}
            <div class="card-progress">${slot.collectedCount} / ${slot.needed}</div>
          </div>
        `;
        // Применяем масштабирование для коротких слов в категориях слотов
        if (!emoji) {
          const titleEl = slotEl.querySelector('.card-title');
          applySlotCategoryScaling(titleEl);
        }
      }
    }

    container.appendChild(slotEl);
  });
}

function renderDeckArea(state, prevState) {
  const deck = document.getElementById('deck');
  const discard = document.getElementById('deck-discard');
  // Размеры управляются через CSS, не задаём их здесь
  let topDiscardCard = null;
  
  if (deck) {
    deck.innerHTML = '';
    // Убираем inline стили размеров - они задаются в CSS
    deck.style.width = '';
    deck.style.height = '';
    if (state.deck.length > 0) {
      const deckCard = document.createElement('div');
      deckCard.className = 'card card--deck card--face-down';
      deckCard.innerHTML = `<div class="card-back">🎴</div>`;
      deck.appendChild(deckCard);
    } else {
      const reshuffleBtn = document.createElement('button');
      reshuffleBtn.className = 'btn-reshuffle-deck btn-image';
      reshuffleBtn.innerHTML = '<img src="./nov.png" alt="перетасовать">';
      // Защита от случайного нажатия на мобильных - кнопка неактивна первые 300мс
      reshuffleBtn.style.pointerEvents = 'none';
      reshuffleBtn.style.opacity = '0.5';
      setTimeout(() => {
        reshuffleBtn.style.pointerEvents = '';
        reshuffleBtn.style.opacity = '';
      }, 300);
      reshuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем всплытие к deck
        import('./game_logic.js').then(({ Game }) => Game.onDeckReshuffle());
      });
      deck.appendChild(reshuffleBtn);
    }
  }

  if (discard) {
    discard.innerHTML = '';
    // Убираем inline стили размеров - они задаются в CSS
    discard.style.width = '';
    discard.style.height = '';
    if (state.discard && state.discard.length > 0) {
      const maxShown = 3;
      const start = Math.max(0, state.discard.length - maxShown);
      const slice = state.discard.slice(start);
      const discardOffset = 20;
      slice.forEach((cardId, idx) => {
        const card = state.cardsById[cardId];
        if (card) {
          const isTopCard = idx === slice.length - 1;
          // Передаём null для размеров - они будут из CSS
          const cardEl = createCardElement(card, 'discard', -1, true, null, null, isTopCard);
          cardEl.style.position = 'absolute';
          cardEl.style.right = `${idx * discardOffset}px`;
          cardEl.style.top = '0px';
          cardEl.style.zIndex = `${100 + idx}`;
          if (isTopCard) {
            topDiscardCard = cardEl;
          }
          discard.appendChild(cardEl);
        }
      });
    }
  }

  const needAnim = shouldAnimateDeckToDiscard(prevState, state);
  if (needAnim && deck && topDiscardCard) {
    animateDeckToDiscard(deck, topDiscardCard);
  }
}

function renderPiles(state, prevState) {
  const container = document.getElementById('piles');
  if (!container) return;

  container.innerHTML = '';

  // Размеры управляются через CSS
  const offsetY = 26;

  state.piles.forEach((pile, pileIndex) => {
    const pileEl = document.createElement('div');
    pileEl.className = 'pile';
    // Убираем inline стили - размеры из CSS
    pileEl.dataset.pileIndex = pileIndex;

    if (pile.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'empty-pile';
      pileEl.appendChild(emptyEl);
    } else {
      pile.forEach((cardId, cardIndex) => {
        const card = state.cardsById[cardId];
        if (card) {
          const openFrom = state.pilesOpenFrom ? state.pilesOpenFrom[pileIndex] ?? 0 : 0;
          const isOpen = cardIndex >= openFrom;
          const isTopCard = cardIndex === pile.length - 1;
          
          let wasOpen = true;
          let shouldFlip = false;
          if (prevState && prevState.piles[pileIndex]) {
            const prevPile = prevState.piles[pileIndex];
            const prevIndex = prevPile.indexOf(cardId);
            if (prevIndex !== -1) {
              const prevOpenFrom = prevState.pilesOpenFrom ? prevState.pilesOpenFrom[pileIndex] ?? 0 : 0;
              wasOpen = prevIndex >= prevOpenFrom;
              if (!wasOpen && isOpen) {
                shouldFlip = true;
              }
            }
          }
          
          // Размеры карт из CSS
          const cardEl = createCardElement(card, 'pile', pileIndex, isOpen, null, null, isTopCard);
          cardEl.style.top = `${cardIndex * offsetY}px`;
          
          if (shouldFlip) {
            cardEl.classList.add('card--will-flip');
            cardEl.style.visibility = 'hidden';
            setTimeout(() => {
              cardEl.style.visibility = 'visible';
              cardEl.classList.remove('card--will-flip');
              cardEl.classList.add('card--flip');
            }, 10);
          }
          
          pileEl.appendChild(cardEl);
        }
      });
    }

    container.appendChild(pileEl);
  });
}

// Функция для увеличения коротких слов
function applyShortWordScaling(titleElement, isCovered = false) {
  if (!titleElement) return;
  
  const text = titleElement.textContent.trim();
  // Считаем только буквы (без пробелов и спецсимволов)
  const letterCount = text.replace(/[^a-zа-яё]/gi, '').length;
  
  const baseSize = 11; // 10.5 * 1.05
  
  if (letterCount > 0 && letterCount < 6) {
    // Слова менее 6 букв - увеличиваем на 60.5% (50% + 7%)
    const newSize = baseSize * 1.605;
    titleElement.style.fontSize = `${newSize}px`;
  } else if (letterCount >= 6 && letterCount < 8) {
    // Слова 6-7 букв - увеличиваем на 33.75% (25% + 7%)
    const newSize = baseSize * 1.3375;
    titleElement.style.fontSize = `${newSize}px`;
  }
}

// Функция для увеличения текста категорий в слотах на мобильных (менее 7 букв - на 30%)
function applySlotCategoryScaling(titleElement) {
  if (!titleElement) return;
  
  // Проверяем, мобильный ли это в портретной ориентации
  const isMobilePortrait = document.body.classList.contains('mobile-portrait');
  if (!isMobilePortrait) return;
  
  const text = titleElement.textContent.trim();
  // Считаем только буквы (без пробелов и спецсимволов)
  const letterCount = text.replace(/[^a-zа-яё]/gi, '').length;
  
  if (letterCount > 0 && letterCount < 7) {
    // Слова менее 7 букв - увеличиваем на 30% от увеличенного базового размера для мобильных
    // Базовый размер на мобильных: 11 * 1.44 (увеличение карт) = 15.84
    // Увеличиваем ещё на 30%: 15.84 * 1.3 = 20.6
    const newSize = 20.6;
    titleElement.style.fontSize = `${newSize}px`;
  }
}

function createCardElement(card, zone, pileIndex, isOpen = true, width = null, height = null, isTopCard = true) {
  const cardEl = document.createElement('div');
  cardEl.className = `card card--${card.type.toLowerCase()}`;
  cardEl.dataset.cardId = card.id;
  cardEl.dataset.zone = zone;
  cardEl.dataset.pileIndex = pileIndex;
  // Устанавливаем размеры только если они явно переданы
  if (width !== null) {
    cardEl.style.width = `${width}px`;
  }
  if (height !== null) {
    cardEl.style.height = `${height}px`;
  }

  if (isOpen) {
    cardEl.classList.add('card--face-up');
    
    if ((zone === 'pile' || zone === 'discard') && !isTopCard) {
      cardEl.classList.add('card--covered');
    }
    
    if (card.type === 'JOKER') {
      // Джокер - особая карта с изображением
      cardEl.innerHTML = `
        <div class="card-joker-image"></div>
      `;
    } else if (card.type === 'CATEGORY') {
      const hasValidEmoji = card.emoji && card.emoji.trim() !== '';
      const emoji = hasValidEmoji ? `<div class="card-emoji">${card.emoji}</div>` : '';
      const translatedTitle = translateCardTitle(card.title);
      const title = hasValidEmoji ? '' : `<div class="card-title">${translatedTitle}</div>`;
      // Счётчик вместимости категории (0/сколько карт нужно собрать)
      const capacityBadge = card.needed ? `<div class="card-capacity-badge">0/${card.needed}</div>` : '';
      cardEl.innerHTML = `
        ${capacityBadge}
        ${title}
        ${emoji}
      `;
      // Применяем масштабирование для коротких слов
      if (!hasValidEmoji) {
        const titleEl = cardEl.querySelector('.card-title');
        applyShortWordScaling(titleEl, false);
      }
    } else {
      const hasValidEmoji = card.emoji && card.emoji.trim() !== '';
      if (hasValidEmoji) {
        cardEl.innerHTML = `
          <div class="card-emoji">${card.emoji}</div>
        `;
      } else {
        const translatedTitle = translateCardTitle(card.title);
        cardEl.innerHTML = `
          <div class="card-title">${translatedTitle}</div>
        `;
        // Применяем масштабирование для коротких слов
        const titleEl = cardEl.querySelector('.card-title');
        applyShortWordScaling(titleEl, false);
      }
    }
  } else {
    cardEl.classList.add('card--face-down');
    cardEl.innerHTML = `
      <div class="card-back">🎴</div>
    `;
  }

  return cardEl;
}

function shouldAnimateDeckToDiscard(prevState, state) {
  if (!prevState) return false;
  if (!Array.isArray(prevState.deck) || !Array.isArray(prevState.discard)) return false;
  const deckDiff = prevState.deck.length - state.deck.length;
  const discardDiff = state.discard.length - prevState.discard.length;
  if (deckDiff !== 1 || discardDiff !== 1) return false;
  if (prevState.deck.length === 0 || state.discard.length === 0) return false;
  const movedCardId = state.discard[state.discard.length - 1];
  const prevTopDeck = prevState.deck[prevState.deck.length - 1];
  return movedCardId === prevTopDeck;
}

function animateDeckToDiscard(deckEl, cardEl) {
  const deckRect = deckEl.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const dx = deckRect.left + deckRect.width / 2 - (cardRect.left + cardRect.width / 2);
  const dy = deckRect.top + deckRect.height / 2 - (cardRect.top + cardRect.height / 2);
  const prevZ = cardEl.style.zIndex;
  cardEl.classList.add('card--flight');
  cardEl.style.transition = 'none';
  cardEl.style.transform = `translate(${dx}px, ${dy}px) scale(0.92) rotate(8deg)`;
  cardEl.style.opacity = '0.95';
  cardEl.style.zIndex = '200';
  requestAnimationFrame(() => {
    cardEl.style.transition = 'transform 0.45s ease, opacity 0.45s ease';
    cardEl.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
    cardEl.style.opacity = '1';
    setTimeout(() => {
      cardEl.classList.remove('card--flight');
      cardEl.style.transition = '';
      cardEl.style.transform = '';
      cardEl.style.zIndex = prevZ || '';
      cardEl.style.opacity = '';
    }, 470);
  });
}

export function setStatusText(text) {
  console.log('Status:', text);
}

let hintState = {
  isActive: false,
  phantomElement: null,
  animationInterval: null,
  touchHandler: null,
  deckElement: null,
};

export function showHint(Game) {
  // Останавливаем предыдущую подсказку если она активна
  stopHint();

  if (Game.state.isLevelCompleted || Game.state.isLevelFailed) {
    setStatusText(t('GAME_OVER'));
    return;
  }

  const moves = Game.findAvailableMoves();

  if (moves.length === 0) {
    // Нет доступных карт на поле - проверяем discard
    if (Game.state.discard.length > 0) {
      const topDiscardCardId = Game.state.discard[Game.state.discard.length - 1];
      const topDiscardCard = Game.state.cardsById[topDiscardCardId];
      if (topDiscardCard) {
        const sourceInfo = { zone: 'discard', pileIndex: -1 };
        const target = Game.findTargetForCard(topDiscardCardId, sourceInfo);
        if (target) {
          // Показываем фантом из discard
          startHintAnimation(topDiscardCardId, sourceInfo, target, Game);
          return;
        }
      }
    }

    // Нет доступных ходов - показываем сообщение и подсвечиваем колоду
    setStatusText(t('NO_CARDS'));
    const deckEl = document.getElementById('deck');
    if (deckEl && Game.state.deck.length > 0) {
      deckEl.classList.add('hint-highlight');
      // Пульсация будет продолжаться пока подсказка активна
      hintState.deckElement = deckEl;
      hintState.isActive = true;
      
      // Обработчик касаний для скрытия подсветки колоды
      hintState.touchHandler = (e) => {
        // Не скрываем если кликнули по кнопкам
        if (e.target.closest('#bottom-bar')) {
          return;
        }
        stopHint();
      };
      
      document.addEventListener('pointerdown', hintState.touchHandler, { once: false });
      document.addEventListener('touchstart', hintState.touchHandler, { once: false });
    } else {
      // Если колода пуста, но есть discard - показываем что можно вернуть колоду
      if (Game.state.discard.length > 0) {
        setStatusText(t('CLICK_DECK'));
      }
    }
    return;
  }

  // Берем первый доступный ход
  const move = moves[0];
  startHintAnimation(move.cardId, move.sourceInfo, move.target, Game);
}

function startHintAnimation(cardId, sourceInfo, target, Game) {
  hintState.isActive = true;

  // Находим исходный элемент карты
  let sourceElement = null;
  if (sourceInfo.zone === 'discard') {
    const discardEl = document.getElementById('deck-discard');
    if (discardEl) {
      // Ищем верхнюю карту в discard (она может быть последней в списке дочерних элементов)
      const cards = discardEl.querySelectorAll('.card');
      if (cards.length > 0) {
        sourceElement = cards[cards.length - 1];
        // Проверяем что это правильная карта
        if (sourceElement.dataset.cardId !== cardId) {
          sourceElement = Array.from(cards).find(card => card.dataset.cardId === cardId);
        }
      }
    }
  } else if (sourceInfo.zone === 'pile') {
    sourceElement = document.querySelector(
      `.card[data-card-id="${cardId}"][data-zone="pile"][data-pile-index="${sourceInfo.pileIndex}"]`
    );
  }

  if (!sourceElement) {
    hintState.isActive = false;
    return;
  }

  // Находим целевой элемент
  let targetElement = null;

  if (target.type === 'slot') {
    const slotEl = document.querySelectorAll('#category-slots .category-slot')[target.slotIndex];
    if (slotEl) {
      const cardInSlot = slotEl.querySelector('.card');
      if (cardInSlot) {
        targetElement = cardInSlot;
      } else {
        targetElement = slotEl.querySelector('.empty-slot') || slotEl;
      }
    }
  } else if (target.type === 'card') {
    targetElement = document.querySelector(`.card[data-card-id="${target.cardId}"]`);
  } else if (target.type === 'pile') {
    const pileEl = document.querySelector(`.pile[data-pile-index="${target.pileIndex}"]`);
    if (pileEl) {
      const emptyPile = pileEl.querySelector('.empty-pile');
      targetElement = emptyPile || pileEl;
    }
  }

  if (!targetElement) {
    hintState.isActive = false;
    return;
  }

  // Создаем фантом карты
  const sourceRect = sourceElement.getBoundingClientRect();
  const phantom = sourceElement.cloneNode(true);
  
  // Удаляем все анимационные классы и добавляем класс фантома
  phantom.classList.remove('card--flip', 'card--will-flip', 'card--dissolve', 'card--flight');
  phantom.classList.add('card--hint-phantom');
  
  // Используем cssText для установки стилей с !important чтобы переопределить CSS правила mobile-portrait
  phantom.style.cssText = `
    position: fixed !important;
    left: ${sourceRect.left}px !important;
    top: ${sourceRect.top}px !important;
    width: ${sourceRect.width}px !important;
    height: ${sourceRect.height}px !important;
    opacity: 0.6 !important;
    pointer-events: none !important;
    z-index: 5000 !important;
    transition: none;
    transform: translate(0, 0);
    margin: 0 !important;
    animation: none !important;
    visibility: visible !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  `;
  
  // Вычисляем коэффициент масштабирования внутренних элементов
  // Фантом получает визуальные размеры карты (sourceRect.width/height)
  // Внутренние элементы должны масштабироваться пропорционально
  // На мобильных в портретной ориентации emoji увеличены ещё на 50% (кроме закрытых карт)
  const BASE_CARD_WIDTH = 77;
  const BASE_EMOJI_SIZE = 47.25;  // 30 * 1.05 * 1.5 (увеличено на 50% для mobile-portrait)
  const BASE_EMOJI_COVERED_SIZE = 18.9;  // 18 * 1.05 (БЕЗ увеличения на 50% для видимости в стопках)
  const BASE_TITLE_SIZE = 11;  // 10.5 * 1.05
  const BASE_ICON_SIZE = 24.15;  // 23 * 1.05
  const BASE_ICON_COVERED_SIZE = 15.75;  // 15 * 1.05
  const BASE_PROGRESS_SIZE = 18.9;  // 9.45 * 2 (увеличено в 2 раза для мобильных)
  const BASE_CROWN_SIZE = 15.75;  // 15 * 1.05
  
  const scaleRatio = sourceRect.width / BASE_CARD_WIDTH;
  const isCovered = sourceElement.classList.contains('card--covered');
  
  const phantomEmoji = phantom.querySelector('.card-emoji');
  if (phantomEmoji) {
    const baseSize = isCovered ? BASE_EMOJI_COVERED_SIZE : BASE_EMOJI_SIZE;
    phantomEmoji.style.cssText += `font-size: ${baseSize * scaleRatio}px !important;`;
  }
  
  const phantomTitle = phantom.querySelector('.card-title');
  if (phantomTitle) {
    phantomTitle.style.cssText += `font-size: ${BASE_TITLE_SIZE * scaleRatio}px !important;`;
  }
  
  const phantomIcon = phantom.querySelector('.card-icon');
  if (phantomIcon) {
    const baseSize = isCovered ? BASE_ICON_COVERED_SIZE : BASE_ICON_SIZE;
    phantomIcon.style.cssText += `font-size: ${baseSize * scaleRatio}px !important;`;
  }
  
  const phantomProgress = phantom.querySelector('.card-progress');
  if (phantomProgress) {
    phantomProgress.style.cssText += `font-size: ${BASE_PROGRESS_SIZE * scaleRatio}px !important;`;
  }
  
  const phantomCrown = phantom.querySelector('.card-crown');
  if (phantomCrown) {
    phantomCrown.style.cssText += `font-size: ${BASE_CROWN_SIZE * scaleRatio}px !important;`;
  }
  
  const phantomJokerImg = phantom.querySelector('.card-joker-image');
  if (phantomJokerImg) {
    phantomJokerImg.style.cssText += `width: ${60 * scaleRatio}px !important; height: ${60 * scaleRatio}px !important;`;
  }
  
  // Счётчик вместимости категории
  const phantomCapacityBadge = phantom.querySelector('.card-capacity-badge');
  if (phantomCapacityBadge) {
    const badgeSize = 12 * scaleRatio;
    phantomCapacityBadge.style.cssText += `font-size: ${badgeSize}px !important;`;
  }
  
  document.body.appendChild(phantom);

  hintState.phantomElement = phantom;

  // Функция анимации полета
  function animateFlight() {
    if (!hintState.isActive || !phantom || !targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const sourceRectCurrent = sourceElement.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2 - sourceRectCurrent.width / 2;
    const targetY = targetRect.top + targetRect.height / 2 - sourceRectCurrent.height / 2;

    // Обновляем позицию фантома на случай если исходный элемент сдвинулся
    phantom.style.left = `${sourceRectCurrent.left}px`;
    phantom.style.top = `${sourceRectCurrent.top}px`;

    // Летим к цели
    phantom.style.transition = 'transform 1s ease-in-out';
    const dx = targetX - sourceRectCurrent.left;
    const dy = targetY - sourceRectCurrent.top;
    phantom.style.transform = `translate(${dx}px, ${dy}px)`;

    setTimeout(() => {
      if (!hintState.isActive || !phantom || !sourceElement) return;
      // Возвращаемся обратно
      const currentSourceRect = sourceElement.getBoundingClientRect();
      phantom.style.left = `${currentSourceRect.left}px`;
      phantom.style.top = `${currentSourceRect.top}px`;
      phantom.style.transition = 'transform 0.8s ease-in-out';
      phantom.style.transform = 'translate(0, 0)';
    }, 1000);
  }

  // Запускаем первую анимацию с небольшой задержкой
  setTimeout(() => {
    if (hintState.isActive) {
      animateFlight();
    }
  }, 100);

  // Повторяем анимацию каждые 2.2 секунды (1s туда + 0.8s обратно + 0.4s пауза)
  hintState.animationInterval = setInterval(() => {
    if (!hintState.isActive) return;
    animateFlight();
  }, 2200);

  // Обработчик касаний для скрытия фантома
  hintState.touchHandler = (e) => {
    // Не скрываем если кликнули по кнопкам
    if (e.target.closest('#bottom-bar')) {
      return;
    }
    stopHint();
  };

  document.addEventListener('pointerdown', hintState.touchHandler, { once: false });
  document.addEventListener('touchstart', hintState.touchHandler, { once: false });
}

function stopHint() {
  hintState.isActive = false;

  if (hintState.animationInterval) {
    clearInterval(hintState.animationInterval);
    hintState.animationInterval = null;
  }

  if (hintState.phantomElement) {
    hintState.phantomElement.remove();
    hintState.phantomElement = null;
  }

  if (hintState.touchHandler) {
    document.removeEventListener('pointerdown', hintState.touchHandler);
    document.removeEventListener('touchstart', hintState.touchHandler);
    hintState.touchHandler = null;
  }

  // Убираем подсветку колоды
  if (hintState.deckElement) {
    hintState.deckElement.classList.remove('hint-highlight');
    hintState.deckElement = null;
  }
}

// Функция для удаления всех фантомов (обучения и подсказок)
function removeAllPhantoms() {
  // Останавливаем анимацию подсказки
  stopHint();
  
  // Удаляем фантомы обучения
  import('./tutorial.js').then(({ Tutorial }) => {
    if (Tutorial.removePhantom) {
      Tutorial.removePhantom();
    }
  }).catch(() => {});
  
  // Удаляем фантомы подсказок (на всякий случай, если остались)
  document.querySelectorAll('.card--hint-phantom').forEach(el => el.remove());
  document.querySelectorAll('.tutorial-phantom').forEach(el => el.remove());
}

// Система подсказок для игрока
let currentHintMessage = null;
let hintTimeout = null;

export function showGameHint(message) {
  let wasForciblyClosed = false;
  
  // Принудительно закрываем предыдущее сообщение без анимации
  if (currentHintMessage) {
    wasForciblyClosed = true;
    
    // Отменяем таймаут
    if (hintTimeout) {
      clearTimeout(hintTimeout);
      hintTimeout = null;
    }
    
    // Удаляем элемент сразу без анимации
    if (currentHintMessage.parentNode) {
      currentHintMessage.parentNode.removeChild(currentHintMessage);
    }
    currentHintMessage = null;
  }
  
  // Сразу показываем новое сообщение
  createNewHintMessage(message, wasForciblyClosed);
}

function createNewHintMessage(message, instantShow = false) {
  // Создаем новое сообщение
  const hintElement = document.createElement('div');
  hintElement.className = instantShow ? 'game-hint-message instant-show' : 'game-hint-message';
  hintElement.textContent = message;
  
  document.body.appendChild(hintElement);
  currentHintMessage = hintElement;
  
  // Автоматически скрываем через 3 секунды
  hintTimeout = setTimeout(() => {
    hideGameHint();
  }, 3000);
}

export function hideGameHint() {
  if (hintTimeout) {
    clearTimeout(hintTimeout);
    hintTimeout = null;
  }
  
  if (currentHintMessage) {
    currentHintMessage.classList.add('fade-out');
    setTimeout(() => {
      if (currentHintMessage && currentHintMessage.parentNode) {
        currentHintMessage.parentNode.removeChild(currentHintMessage);
      }
      currentHintMessage = null;
    }, 300);
  }
}

// Функции для различных типов ошибок
export function showWrongCategoryHint() {
  showGameHint(t('HINT_WRONG_CATEGORY'));
}

export function showCategorySlotHint() {
  showGameHint(t('HINT_CATEGORY_SLOT'));
}

export function showDifferentCategoryHint() {
  showGameHint(t('HINT_DIFFERENT_CATEGORY'));
}

export function showCategoryNotInSlotHint() {
  showGameHint(t('HINT_CATEGORY_NOT_IN_SLOT'));
}

export function showJokerSlotHint() {
  showGameHint(t('HINT_JOKER_SLOT'));
}


/**
 * Показ обратного отсчета перед рекламой
 */
export function showAdCountdown(seconds) {
  const overlay = document.getElementById('ad-countdown-overlay');
  const textEl = overlay?.querySelector('.ad-countdown-text');
  const numberEl = overlay?.querySelector('.ad-countdown-number');
  
  if (overlay && textEl && numberEl) {
    textEl.textContent = t('AD_COUNTDOWN');
    numberEl.textContent = seconds;
    overlay.style.display = 'flex';
    
    // Добавляем анимацию пульсации
    numberEl.style.animation = 'none';
    setTimeout(() => {
      numberEl.style.animation = 'countdownPulse 1s ease-in-out';
    }, 10);
  }
}

/**
 * Скрытие обратного отсчета
 */
export function hideAdCountdown() {
  const overlay = document.getElementById('ad-countdown-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}
