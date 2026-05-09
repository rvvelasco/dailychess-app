/**
 * useChessGame.js — con sistema de pre-moves
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from './useStockfish';
import { playSound } from '../utils/sounds';
import { GAME_STATUS } from '../utils/constants';

export function useChessGame() {
  const [game, setGame]               = useState(new Chess());
  const [fen, setFen]                 = useState('start');
  const [gameStatus, setGameStatus]   = useState(GAME_STATUS.PLAYING);
  const [playerColor, setPlayerColor] = useState('white');
  const [difficulty, setDifficulty]   = useState('medium');
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [optionSquares, setOptionSquares]   = useState({});
  const [lastMoveSquares, setLastMoveSquares] = useState({});
  const [checkSquare, setCheckSquare] = useState(null);
  const [gameResult, setGameResult]   = useState(null);

  // ─── Pre-move state ───────────────────────────────────────────────────
  // Un pre-move es un movimiento que el jugador hace DURANTE el turno de la IA.
  // Se ejecuta automáticamente cuando llega el turno del jugador.
  const [preMove, setPreMove]           = useState(null);   // { from, to }
  const [preMoveSquares, setPreMoveSqs] = useState({});     // highlight violeta

  const gameRef    = useRef(game);
  const colorRef   = useRef(playerColor);
  const diffRef    = useRef(difficulty);
  const preMoveRef = useRef(preMove);

  const { isReady: stockfishReady, isThinking, stockfishAvailable,
          getBestMove, newGame: resetStockfish, stopSearch } = useStockfish();

  useEffect(() => { gameRef.current  = game;        }, [game]);
  useEffect(() => { colorRef.current = playerColor; }, [playerColor]);
  useEffect(() => { diffRef.current  = difficulty;  }, [difficulty]);
  useEffect(() => { preMoveRef.current = preMove;   }, [preMove]);

  // ─── Detectar estado ──────────────────────────────────────────────────
  const detectGameStatus = useCallback((chess) => {
    if (chess.isCheckmate()) {
      playSound('gameEnd');
      const playerWon = (chess.turn() === 'w' && colorRef.current === 'black') ||
                        (chess.turn() === 'b' && colorRef.current === 'white');
      setGameResult({ type:'checkmate', playerWon });
      return GAME_STATUS.CHECKMATE;
    }
    if (chess.isStalemate()) { playSound('gameEnd'); setGameResult({ type:'stalemate' }); return GAME_STATUS.STALEMATE; }
    if (chess.isDraw())      { playSound('gameEnd'); setGameResult({ type:'draw'      }); return GAME_STATUS.DRAW; }
    if (chess.isCheck()) {
      const board = chess.board();
      const turn  = chess.turn();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === turn) {
            setCheckSquare(`${'abcdefgh'[c]}${8 - r}`);
          }
        }
      }
      playSound('check');
      return GAME_STATUS.CHECK;
    }
    setCheckSquare(null);
    return GAME_STATUS.PLAYING;
  }, []);

  // ─── Actualizar estado visual ─────────────────────────────────────────
  const updateGameState = useCallback((newGame, move) => {
    const newFen = newGame.fen();
    setFen(newFen);
    setGame(new Chess(newFen));
    if (move) {
      setLastMoveSquares({
        [move.from]: { background:'rgba(42,191,170,0.3)' },
        [move.to]:   { background:'rgba(42,191,170,0.3)' },
      });
    }
    setMoveHistory(newGame.history({ verbose:false }));
    const status = detectGameStatus(newGame);
    setGameStatus(status);
    setSelectedSquare(null);
    setOptionSquares({});
    return status;
  }, [detectGameStatus]);

  // ─── Movimiento de IA ─────────────────────────────────────────────────
  const makeAIMove = useCallback((currentGame, diff) => {
    if (currentGame.isGameOver()) return;
    getBestMove(currentGame.fen(), diff, (bestMove) => {
      let moveStr = bestMove;
      if (!moveStr) {
        const moves = currentGame.moves({ verbose:true });
        if (!moves.length) return;
        const m = moves[Math.floor(Math.random() * moves.length)];
        moveStr = m.from + m.to + (m.promotion || '');
      }
      const copy = new Chess(currentGame.fen());
      try {
        const from = moveStr.slice(0,2), to = moveStr.slice(2,4);
        const promo = moveStr[4] || 'q';
        const mv = copy.move({ from, to, promotion: promo });
        if (mv) {
          if (mv.flags.includes('c') || mv.flags.includes('e')) playSound('move', true);
          else if (mv.flags.includes('k') || mv.flags.includes('q')) playSound('castle');
          else playSound('move', false);
          updateGameState(copy, mv);

          // ─── Ejecutar pre-move si existe ──────────────────────────────
          const pm = preMoveRef.current;
          if (pm) {
            setPreMove(null);
            setPreMoveSqs({});
            setTimeout(() => {
              const afterAI = new Chess(copy.fen());
              try {
                const pmv = afterAI.move({ from: pm.from, to: pm.to, promotion:'q' });
                if (pmv) {
                  if (pmv.flags.includes('c') || pmv.flags.includes('e')) playSound('move', true);
                  else playSound('move', false);
                  updateGameState(afterAI, pmv);
                }
              } catch(e) {
                // Pre-move se volvió ilegal — se cancela silenciosamente
              }
            }, 120);
          }
        }
      } catch(e) { console.warn('AI move error:', e); }
    });
  }, [getBestMove, updateGameState]);

  // ─── Trigger turno IA ─────────────────────────────────────────────────
  useEffect(() => {
    if ([GAME_STATUS.CHECKMATE, GAME_STATUS.STALEMATE, GAME_STATUS.DRAW].includes(gameStatus)) return;
    const isAITurn = (game.turn() === 'w' && playerColor === 'black') ||
                     (game.turn() === 'b' && playerColor === 'white');
    if (isAITurn && !isThinking) {
      const t = setTimeout(() => makeAIMove(game, difficulty), 300);
      return () => clearTimeout(t);
    }
  }, [fen, playerColor, difficulty, gameStatus]);

  // ─── Movimientos legales (highlights) ────────────────────────────────
  const getMoveOptions = useCallback((square) => {
    const g = gameRef.current;
    const moves = g.moves({ square, verbose:true });
    if (!moves.length) { setOptionSquares({}); return false; }
    const sq = {};
    moves.forEach(m => {
      const isCapture = g.get(m.to)?.color !== g.turn();
      sq[m.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(212,74,74,0.45) 58%, transparent 60%)'
          : 'radial-gradient(circle, rgba(42,191,170,0.35) 28%, transparent 30%)',
        borderRadius:'50%',
      };
    });
    sq[square] = { background:'rgba(42,191,170,0.4)' };
    setOptionSquares(sq);
    return true;
  }, []);

  // ─── Click en casilla ─────────────────────────────────────────────────
  const onSquareClick = useCallback((square) => {
    const g = gameRef.current;
    if (g.isGameOver()) return;

    const isPlayerTurn = (g.turn() === 'w' && colorRef.current === 'white') ||
                         (g.turn() === 'b' && colorRef.current === 'black');

    // ── Durante turno de IA: registrar pre-move ───────────────────────
    if (!isPlayerTurn) {
      if (preMoveRef.current?.from === square) {
        // Cancelar pre-move al hacer clic en la misma pieza
        setPreMove(null);
        setPreMoveSqs({});
        setSelectedSquare(null);
        return;
      }
      if (selectedSquare) {
        // Confirmar pre-move
        const piece = g.get(selectedSquare);
        if (piece && (piece.color === 'w') === (colorRef.current === 'white')) {
          setPreMove({ from: selectedSquare, to: square });
          setPreMoveSqs({
            [selectedSquare]: { background:'rgba(139,92,246,0.45)' },
            [square]:         { background:'rgba(139,92,246,0.35)' },
          });
          setSelectedSquare(null);
          setOptionSquares({});
          return;
        }
      }
      // Seleccionar pieza propia para pre-move
      const piece = g.get(square);
      if (piece && (piece.color === 'w') === (colorRef.current === 'white')) {
        setSelectedSquare(square);
        // Mostrar en morado las casillas destino posibles
        const fakeGame = new Chess(g.fen().replace(/ [wb] /, ` ${g.turn() === 'w' ? 'b' : 'w'} `));
        // Simplificado: solo highlight de la casilla seleccionada
        setOptionSquares({ [square]: { background:'rgba(139,92,246,0.4)' } });
      }
      return;
    }

    // ── Turno normal del jugador ──────────────────────────────────────
    if (selectedSquare) {
      const copy = new Chess(g.fen());
      try {
        const mv = copy.move({ from: selectedSquare, to: square, promotion:'q' });
        if (mv) {
          if (mv.flags.includes('c') || mv.flags.includes('e')) playSound('move', true);
          else if (mv.flags.includes('k') || mv.flags.includes('q')) playSound('castle');
          else playSound('move', false);
          updateGameState(copy, mv);
          return;
        }
      } catch(e) {}
    }

    const piece = g.get(square);
    if (piece && piece.color === g.turn()) {
      setSelectedSquare(square);
      getMoveOptions(square);
    } else {
      setSelectedSquare(null);
      setOptionSquares({});
    }
  }, [selectedSquare, getMoveOptions, updateGameState]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────
  const onPieceDragBegin = useCallback((_piece, sourceSquare) => {
    const g = gameRef.current;
    if (g.isGameOver()) return false;
    const isPlayerTurn = (g.turn() === 'w' && colorRef.current === 'white') ||
                         (g.turn() === 'b' && colorRef.current === 'black');
    if (!isPlayerTurn) {
      // Seleccionar para pre-move
      const piece = g.get(sourceSquare);
      if (piece && (piece.color === 'w') === (colorRef.current === 'white')) {
        setSelectedSquare(sourceSquare);
        setOptionSquares({ [sourceSquare]: { background:'rgba(139,92,246,0.4)' } });
      }
      return false; // no drag durante turno IA — se usa click
    }
    setSelectedSquare(sourceSquare);
    getMoveOptions(sourceSquare);
    return true;
  }, [getMoveOptions]);

  const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
    const g = gameRef.current;
    const copy = new Chess(g.fen());
    try {
      const mv = copy.move({ from: sourceSquare, to: targetSquare, promotion:'q' });
      if (mv) {
        if (mv.flags.includes('c') || mv.flags.includes('e')) playSound('move', true);
        else if (mv.flags.includes('k') || mv.flags.includes('q')) playSound('castle');
        else playSound('move', false);
        updateGameState(copy, mv);
        setSelectedSquare(null);
        setOptionSquares({});
        return true;
      }
    } catch(e) {}
    setSelectedSquare(null);
    setOptionSquares({});
    return false;
  }, [updateGameState]);

  // ─── Nueva partida ────────────────────────────────────────────────────
  const startNewGame = useCallback((newColor = playerColor, newDiff = difficulty) => {
    stopSearch();
    resetStockfish();
    const ng = new Chess();
    setGame(ng); setFen('start');
    setGameStatus(GAME_STATUS.PLAYING);
    setMoveHistory([]);
    setSelectedSquare(null); setOptionSquares({});
    setLastMoveSquares({}); setCheckSquare(null); setGameResult(null);
    setPreMove(null); setPreMoveSqs({});
    setPlayerColor(newColor); setDifficulty(newDiff);
    colorRef.current = newColor; diffRef.current = newDiff;
    if (newColor === 'black') {
      setTimeout(() => makeAIMove(ng, newDiff), 500);
    }
  }, [playerColor, difficulty, stopSearch, resetStockfish, makeAIMove]);

  const changeDifficulty = useCallback((d) => setDifficulty(d), []);

  const currentTurn   = game.turn() === 'w' ? 'white' : 'black';
  const isPlayerTurn  = currentTurn === playerColor;

  // Combinar highlights: pre-move en morado encima de todo
  const combinedOptionSquares = { ...optionSquares, ...preMoveSquares };

  return {
    fen, game, gameStatus, gameResult, playerColor, difficulty, moveHistory,
    selectedSquare, optionSquares: combinedOptionSquares,
    lastMoveSquares, checkSquare, currentTurn, isPlayerTurn,
    isThinking, stockfishAvailable, stockfishReady,
    preMove, preMoveSquares,
    onSquareClick, onPieceDragBegin, onPieceDrop, startNewGame, changeDifficulty,
  };
}
