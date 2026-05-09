/**
 * sounds.js
 * Sistema de sonidos generados con Web Audio API
 * No requiere archivos de audio externos
 */

let audioContext = null;

// Inicializar o reutilizar el AudioContext (debe inicializarse tras interacción del usuario)
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Reanudar si está suspendido (política autoplay de navegadores)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Crea y reproduce un sonido sintético
 * @param {Object} options - Opciones del oscilador
 */
function playTone({ frequency, type = 'sine', duration = 0.1, volume = 0.3, decay = 0.1, delay = 0 }) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration + decay);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + decay + 0.05);
  } catch (e) {
    // Fallo silencioso si el audio no está disponible
  }
}

// ─── Sonidos del juego ────────────────────────────────────────────────────

/**
 * Sonido de movimiento normal
 */
export function playMoveSound() {
  playTone({ frequency: 440, type: 'triangle', duration: 0.08, volume: 0.25, decay: 0.06 });
}

/**
 * Sonido de captura (más agresivo)
 */
export function playCaptureSound() {
  playTone({ frequency: 300, type: 'sawtooth', duration: 0.05, volume: 0.3, decay: 0.15 });
  playTone({ frequency: 200, type: 'sine', duration: 0.1, volume: 0.2, decay: 0.2, delay: 0.05 });
}

/**
 * Sonido de jaque (alerta)
 */
export function playCheckSound() {
  playTone({ frequency: 880, type: 'square', duration: 0.05, volume: 0.2, decay: 0.1 });
  playTone({ frequency: 660, type: 'square', duration: 0.08, volume: 0.15, decay: 0.1, delay: 0.08 });
}

/**
 * Sonido de enroque
 */
export function playCastleSound() {
  playTone({ frequency: 523, type: 'triangle', duration: 0.06, volume: 0.25, decay: 0.08 });
  playTone({ frequency: 659, type: 'triangle', duration: 0.08, volume: 0.2, decay: 0.1, delay: 0.08 });
}

/**
 * Sonido de fin de partida
 */
export function playGameEndSound(isWin = false) {
  if (isWin) {
    // Fanfarria de victoria
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone({ frequency: freq, type: 'triangle', duration: 0.15, volume: 0.25, decay: 0.1, delay: i * 0.12 });
    });
  } else {
    // Derrota o tablas
    const notes = [440, 392, 349, 330];
    notes.forEach((freq, i) => {
      playTone({ frequency: freq, type: 'sine', duration: 0.2, volume: 0.2, decay: 0.15, delay: i * 0.1 });
    });
  }
}

/**
 * Reproduce el sonido apropiado según el tipo de movimiento
 */
export function playSound(type, isCapture = false) {
  switch (type) {
    case 'move':
      if (isCapture) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
      break;
    case 'check':
      playCheckSound();
      break;
    case 'castle':
      playCastleSound();
      break;
    case 'gameEnd':
      playGameEndSound(false);
      break;
    case 'win':
      playGameEndSound(true);
      break;
    default:
      playMoveSound();
  }
}
