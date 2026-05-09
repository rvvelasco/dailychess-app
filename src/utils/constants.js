export const DIFFICULTY_LEVELS = {
  easy: {
    label: 'Fácil', emoji: '🌱', description: 'Principiante',
    skill: 1, depth: 3, movetime: 500, color: '#4caf7c',
  },
  medium: {
    label: 'Medio', emoji: '⚔️', description: 'Aficionado',
    skill: 10, depth: 8, movetime: 1500, color: '#c9a84c',
  },
  hard: {
    label: 'Difícil', emoji: '💀', description: 'Experto',
    skill: 20, depth: 20, movetime: 3000, color: '#d44a4a',
  },
};

export const GAME_STATUS = {
  WAITING:   'waiting',
  PLAYING:   'playing',
  CHECK:     'check',
  CHECKMATE: 'checkmate',
  STALEMATE: 'stalemate',
  DRAW:      'draw',
  THINKING:  'thinking',
};

export const BOARD_COLORS = {
  LIGHT_SQUARE: '#c8ddd8',
  DARK_SQUARE:  '#2a6b62',
  SELECTED:     'rgba(42,191,170,0.5)',
  LAST_MOVE:    'rgba(42,191,170,0.25)',
  LEGAL_MOVE:   'rgba(0,0,0,0.18)',
  CHECK:        'rgba(212,74,74,0.5)',
};

export const SOUND_TYPES = {
  MOVE: 'move', CAPTURE: 'capture', CHECK: 'check',
  GAME_END: 'gameEnd', CASTLE: 'castle',
};
