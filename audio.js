import { AUDIO_ENABLED_BY_DEFAULT } from './config.js';

let audioContext = null;
let masterGain = null;
let isAudioEnabled = AUDIO_ENABLED_BY_DEFAULT;
let isMuted = false;
let wasPlayingBeforeHidden = false;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = isAudioEnabled ? 1 : 0;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (audioContext && audioContext.state === 'running') {
        wasPlayingBeforeHidden = true;
        audioContext.suspend();
      }
    } else {
      if (audioContext && wasPlayingBeforeHidden && !isMuted) {
        audioContext.resume();
      }
    }
  });

  window.addEventListener('blur', () => {
    if (audioContext && audioContext.state === 'running') {
      wasPlayingBeforeHidden = true;
      audioContext.suspend();
    }
  });

  window.addEventListener('focus', () => {
    if (audioContext && wasPlayingBeforeHidden && !isMuted && !document.hidden) {
      audioContext.resume();
      wasPlayingBeforeHidden = false;
    }
  });
}

export function muteAudio() {
  isMuted = true;
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

export function unmuteAudio() {
  isMuted = false;
  // Восстанавливаем звук только если пользователь не отключил его в настройках
  if (isAudioEnabled && audioContext && audioContext.state === 'suspended' && !document.hidden) {
    audioContext.resume();
  }
}

export function toggleAudio() {
  isAudioEnabled = !isAudioEnabled;
  if (masterGain) {
    masterGain.gain.value = isAudioEnabled ? 1 : 0;
  }
  return isAudioEnabled;
}

export function setSoundEnabled(enabled) {
  isAudioEnabled = enabled;
  if (masterGain) {
    masterGain.gain.value = isAudioEnabled ? 1 : 0;
  }
  console.log('Звук', isAudioEnabled ? 'включен' : 'выключен');
}

export async function playSound(buffer) {
  console.log('playSound called:', { 
    hasContext: !!audioContext, 
    hasGain: !!masterGain, 
    isEnabled: isAudioEnabled,
    hasBuffer: !!buffer,
    contextState: audioContext?.state,
    gainValue: masterGain?.gain?.value
  });
  
  if (!audioContext || !masterGain || !isAudioEnabled) {
    console.warn('playSound: условия не выполнены');
    return;
  }

  // Дожидаемся возобновления контекста если он приостановлен
  if (audioContext.state === 'suspended') {
    try {
      console.log('playSound: resuming audioContext...');
      await audioContext.resume();
      console.log('playSound: audioContext resumed, state:', audioContext.state);
    } catch (e) {
      console.warn('Не удалось возобновить audioContext:', e);
      return;
    }
  }

  try {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start(0);
    console.log('playSound: звук запущен');
  } catch (e) {
    console.error('playSound: ошибка воспроизведения:', e);
  }
}

export async function loadSound(url) {
  if (!audioContext) {
    initAudio();
  }

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

