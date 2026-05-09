/**
 * stockfish.worker.js
 * Motor de ajedrez con fallback inteligente.
 * - Intenta cargar /stockfish.js si existe
 * - Si no, usa motor JavaScript embebido con evaluación real
 */

// ─── Estado global ────────────────────────────────────────────────────────
var stockfishEngine = null;
var engineReady = false;
var messageQueue = [];
var currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
var skillLevel = 10;
var currentMovetime = 1000;
var isThinking = false;

// ─── Intentar cargar Stockfish real ──────────────────────────────────────
function tryLoadStockfish() {
  try {
    importScripts('/stockfish.js');
    var engine = null;
    if (typeof Stockfish === 'function') engine = Stockfish();
    else if (typeof STOCKFISH === 'function') engine = STOCKFISH();

    if (engine) {
      engine.onmessage = function(event) {
        var line = typeof event === 'string' ? event : (event.data || '');
        handleLine(line);
      };
      engine.postMessage('uci');
      engine.postMessage('isready');
      stockfishEngine = engine;
      return true;
    }
  } catch(e) {}
  return false;
}

function handleLine(line) {
  if (!line) return;
  if (line === 'readyok' || line.indexOf('readyok') !== -1) {
    engineReady = true;
    postMessage({ type: 'ready' });
    flushQueue();
  } else if (line.startsWith('bestmove')) {
    var parts = line.split(' ');
    var move = parts[1];
    isThinking = false;
    if (move && move !== '(none)' && move !== '0000') {
      postMessage({ type: 'bestmove', move: move });
    } else {
      postMessage({ type: 'bestmove', move: null });
    }
  }
}

function flushQueue() {
  while (messageQueue.length > 0) {
    stockfishEngine.postMessage(messageQueue.shift());
  }
}

function sendCmd(cmd) {
  if (stockfishEngine && typeof stockfishEngine.postMessage === 'function') {
    if (engineReady) stockfishEngine.postMessage(cmd);
    else messageQueue.push(cmd);
  }
}

// ─── Motor fallback embebido ──────────────────────────────────────────────
// Generador y evaluador de movimientos en JavaScript puro

var FILES = 'abcdefgh';
var PIECE_VALUES = { p:100, n:320, b:330, r:500, q:900, k:20000 };

// Tablas de bonificación posicional
var PST = {
  p: [ 0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
       5,  5, 10, 25, 25, 10,  5,  5,
       0,  0,  0, 20, 20,  0,  0,  0,
       5, -5,-10,  0,  0,-10, -5,  5,
       5, 10, 10,-20,-20, 10, 10,  5,
       0,  0,  0,  0,  0,  0,  0,  0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20],
  r: [ 0,  0,  0,  0,  0,  0,  0,  0,
       5, 10, 10, 10, 10, 10, 10,  5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
       0,  0,  0,  5,  5,  0,  0,  0],
  q: [-20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
       -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20,
       20, 30, 10,  0,  0, 10, 30, 20]
};

function parseFen(fen) {
  var parts = fen.split(' ');
  var board = new Array(64).fill(null);
  var rows = parts[0].split('/');
  for (var r = 0; r < 8; r++) {
    var col = 0;
    for (var i = 0; i < rows[r].length; i++) {
      var c = rows[r][i];
      if (c >= '1' && c <= '8') col += parseInt(c);
      else { board[r * 8 + col] = c; col++; }
    }
  }
  return { board: board, turn: parts[1] || 'w' };
}

function generateMoves(board, turn) {
  var moves = [];
  var isWhite = turn === 'w';

  for (var sq = 0; sq < 64; sq++) {
    var piece = board[sq];
    if (!piece) continue;
    var pieceIsWhite = piece === piece.toUpperCase();
    if (pieceIsWhite !== isWhite) continue;

    var r = Math.floor(sq / 8), f = sq % 8;
    var pt = piece.toLowerCase();
    var from = FILES[f] + (8 - r);

    if (pt === 'p') {
      var dir = isWhite ? -1 : 1;
      var startR = isWhite ? 6 : 1;
      var nr = r + dir;
      if (nr >= 0 && nr < 8) {
        if (!board[nr * 8 + f]) {
          addPawnMove(moves, from, nr, f, isWhite);
          if (r === startR && !board[(nr + dir) * 8 + f]) {
            addPawnMove(moves, from, nr + dir, f, isWhite);
          }
        }
        [-1, 1].forEach(function(df) {
          var nf = f + df;
          if (nf >= 0 && nf < 8) {
            var cap = board[nr * 8 + nf];
            if (cap && (cap === cap.toUpperCase()) !== isWhite) {
              addPawnMove(moves, from, nr, nf, isWhite);
            }
          }
        });
      }
    } else if (pt === 'n') {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function(d) {
        var nr2 = r + d[0], nf2 = f + d[1];
        if (nr2 >= 0 && nr2 < 8 && nf2 >= 0 && nf2 < 8) {
          var t = board[nr2 * 8 + nf2];
          if (!t || (t === t.toUpperCase()) !== isWhite)
            moves.push(from + FILES[nf2] + (8 - nr2));
        }
      });
    } else if (pt === 'k') {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(function(d) {
        var nr2 = r + d[0], nf2 = f + d[1];
        if (nr2 >= 0 && nr2 < 8 && nf2 >= 0 && nf2 < 8) {
          var t = board[nr2 * 8 + nf2];
          if (!t || (t === t.toUpperCase()) !== isWhite)
            moves.push(from + FILES[nf2] + (8 - nr2));
        }
      });
    } else {
      var dirs = [];
      if (pt === 'r' || pt === 'q') dirs = dirs.concat([[-1,0],[1,0],[0,-1],[0,1]]);
      if (pt === 'b' || pt === 'q') dirs = dirs.concat([[-1,-1],[-1,1],[1,-1],[1,1]]);
      dirs.forEach(function(d) {
        var nr2 = r + d[0], nf2 = f + d[1];
        while (nr2 >= 0 && nr2 < 8 && nf2 >= 0 && nf2 < 8) {
          var t = board[nr2 * 8 + nf2];
          if (!t) { moves.push(from + FILES[nf2] + (8 - nr2)); }
          else {
            if ((t === t.toUpperCase()) !== isWhite) moves.push(from + FILES[nf2] + (8 - nr2));
            break;
          }
          nr2 += d[0]; nf2 += d[1];
        }
      });
    }
  }
  return moves;
}

function addPawnMove(moves, from, nr, nf, isWhite) {
  var to = FILES[nf] + (8 - nr);
  if (nr === 0 || nr === 7) {
    ['q','r','b','n'].forEach(function(p) { moves.push(from + to + p); });
  } else {
    moves.push(from + to);
  }
}

function evaluateBoard(board, turn) {
  var score = 0;
  for (var sq = 0; sq < 64; sq++) {
    var piece = board[sq];
    if (!piece) continue;
    var isWhite = piece === piece.toUpperCase();
    var pt = piece.toLowerCase();
    var val = PIECE_VALUES[pt] || 0;
    var pst = PST[pt];
    var pstIdx = isWhite ? sq : (56 - Math.floor(sq/8)*8 + sq%8);
    if (pstIdx >= 64) pstIdx = sq;
    var bonus = pst ? (pst[pstIdx] || 0) : 0;
    score += isWhite ? (val + bonus) : -(val + bonus);
  }
  return turn === 'w' ? score : -score;
}

function applyMove(board, move) {
  var newBoard = board.slice();
  var fFile = move.charCodeAt(0) - 97;
  var fRank = 8 - parseInt(move[1]);
  var tFile = move.charCodeAt(2) - 97;
  var tRank = 8 - parseInt(move[3]);
  var promo = move[4];
  var fromSq = fRank * 8 + fFile;
  var toSq = tRank * 8 + tFile;
  var piece = newBoard[fromSq];
  newBoard[toSq] = promo ? (piece === piece.toUpperCase() ? promo.toUpperCase() : promo) : piece;
  newBoard[fromSq] = null;
  return newBoard;
}

function minimax(board, turn, depth, alpha, beta) {
  if (depth === 0) return evaluateBoard(board, turn);
  var moves = generateMoves(board, turn);
  if (moves.length === 0) return -20000;
  var nextTurn = turn === 'w' ? 'b' : 'w';
  var best = -Infinity;
  for (var i = 0; i < moves.length; i++) {
    var nb = applyMove(board, moves[i]);
    var score = -minimax(nb, nextTurn, depth - 1, -beta, -alpha);
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

function getFallbackMove(fen, skill) {
  var parsed = parseFen(fen);
  var board = parsed.board;
  var turn = parsed.turn;
  var moves = generateMoves(board, turn);
  if (!moves || moves.length === 0) return null;

  // Profundidad según skill
  var depth = skill <= 3 ? 1 : skill <= 8 ? 2 : skill <= 14 ? 3 : 4;
  var randomChance = Math.max(0, (12 - skill) / 20);

  // A veces hacer movimiento aleatorio según dificultad
  if (Math.random() < randomChance) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  var best = null, bestScore = -Infinity;
  var nextTurn = turn === 'w' ? 'b' : 'w';

  // Ordenar: capturas primero
  moves.sort(function(a, b) {
    var ta = board[(8 - parseInt(a[3])) * 8 + (a.charCodeAt(2) - 97)];
    var tb = board[(8 - parseInt(b[3])) * 8 + (b.charCodeAt(2) - 97)];
    return (tb ? PIECE_VALUES[tb.toLowerCase()] || 0 : 0) -
           (ta ? PIECE_VALUES[ta.toLowerCase()] || 0 : 0);
  });

  for (var i = 0; i < moves.length; i++) {
    var nb = applyMove(board, moves[i]);
    var score = -minimax(nb, nextTurn, depth - 1, -Infinity, Infinity);
    score += (Math.random() - 0.5) * (20 - skill) * 5;
    if (score > bestScore) { bestScore = score; best = moves[i]; }
  }
  return best;
}

function startFallbackEngine() {
  engineReady = true;
  postMessage({ type: 'ready' });

  stockfishEngine = {
    postMessage: function(cmd) {
      if (cmd.startsWith('position fen')) {
        currentFen = cmd.replace('position fen ', '').split(' moves')[0];
      } else if (cmd.startsWith('setoption name Skill Level value')) {
        skillLevel = parseInt(cmd.split('value ')[1]) || 10;
      } else if (cmd.startsWith('go')) {
        var mtMatch = cmd.match(/movetime (\d+)/);
        if (mtMatch) currentMovetime = parseInt(mtMatch[1]);
        if (!isThinking) {
          isThinking = true;
          var delay = Math.min(currentMovetime * 0.6, 1200);
          setTimeout(function() {
            var move = null;
            try { move = getFallbackMove(currentFen, skillLevel); } catch(e) {}
            isThinking = false;
            postMessage({ type: 'bestmove', move: move });
          }, delay);
        }
      } else if (cmd === 'stop') {
        isThinking = false;
      } else if (cmd === 'ucinewgame') {
        currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        isThinking = false;
      } else if (cmd === 'isready') {
        postMessage({ type: 'ready' });
      }
    }
  };
}

// ─── Inicializar ──────────────────────────────────────────────────────────
var loaded = tryLoadStockfish();
if (!loaded) {
  startFallbackEngine();
}

// ─── Recibir comandos del hilo principal ──────────────────────────────────
self.onmessage = function(event) {
  var data = event.data;
  var type = data.type;
  var payload = data.payload || {};

  switch (type) {
    case 'setPosition':
      currentFen = payload.fen;
      sendCmd('position fen ' + payload.fen);
      break;
    case 'search':
      if (payload.movetime) {
        currentMovetime = payload.movetime;
        sendCmd('go movetime ' + payload.movetime);
      } else if (payload.depth) {
        sendCmd('go depth ' + payload.depth);
      } else {
        sendCmd('go movetime 1000');
      }
      break;
    case 'setSkillLevel':
      skillLevel = payload.level;
      sendCmd('setoption name Skill Level value ' + payload.level);
      break;
    case 'stop':
      isThinking = false;
      sendCmd('stop');
      break;
    case 'newGame':
      currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      isThinking = false;
      sendCmd('ucinewgame');
      sendCmd('isready');
      break;
    default:
      break;
  }
};
