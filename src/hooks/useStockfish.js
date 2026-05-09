/**
 * useStockfish.js
 * Hook personalizado para gestionar la comunicación con Stockfish via Web Worker
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { DIFFICULTY_LEVELS } from '../utils/constants';

export function useStockfish() {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [stockfishAvailable, setStockfishAvailable] = useState(true);
  const callbackRef = useRef(null);

  // ─── Inicializar el Web Worker ─────────────────────────────────────────
  useEffect(() => {
    try {
      // Cargar el worker desde /public/stockfish.worker.js
      workerRef.current = new Worker('/stockfish.worker.js');

      workerRef.current.onmessage = (event) => {
        const { type, move, message } = event.data;

        switch (type) {
          case 'ready':
            setIsReady(true);
            break;

          case 'bestmove':
            setIsThinking(false);
            // Invocar el callback con el mejor movimiento
            if (callbackRef.current && move) {
              callbackRef.current(move);
              callbackRef.current = null;
            }
            break;

          case 'error':
            // Solo loguear, el motor fallback sigue funcionando
            console.warn('Motor info:', message);
            break;

          default:
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.warn('Stockfish worker error:', error);
        // No marcar como no disponible: el worker tiene motor embebido de fallback
        setIsThinking(false);
      };

    } catch (error) {
      console.warn('No se pudo inicializar Stockfish worker:', error);
      setStockfishAvailable(false);
    }

    // Limpiar el worker al desmontar
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // ─── Configurar nivel de dificultad ───────────────────────────────────
  const setDifficulty = useCallback((difficultyKey) => {
    if (!workerRef.current || !isReady) return;
    const config = DIFFICULTY_LEVELS[difficultyKey];
    if (!config) return;

    workerRef.current.postMessage({
      type: 'setSkillLevel',
      payload: { level: config.skill },
    });
  }, [isReady]);

  // ─── Solicitar el mejor movimiento ────────────────────────────────────
  const getBestMove = useCallback((fen, difficultyKey, onMove) => {
    if (!workerRef.current) {
      // Fallback: si Stockfish no está disponible, hacer un movimiento aleatorio
      onMove(null);
      return;
    }

    const config = DIFFICULTY_LEVELS[difficultyKey] || DIFFICULTY_LEVELS.medium;

    // Guardar el callback para cuando llegue la respuesta
    callbackRef.current = onMove;
    setIsThinking(true);

    // Enviar posición actual
    workerRef.current.postMessage({
      type: 'setPosition',
      payload: { fen },
    });

    // Configurar nivel de habilidad
    workerRef.current.postMessage({
      type: 'setSkillLevel',
      payload: { level: config.skill },
    });

    // Iniciar búsqueda
    workerRef.current.postMessage({
      type: 'search',
      payload: {
        movetime: config.movetime,
        depth: config.depth,
      },
    });
  }, []);

  // ─── Nueva partida ────────────────────────────────────────────────────
  const newGame = useCallback(() => {
    if (!workerRef.current) return;
    setIsThinking(false);
    callbackRef.current = null;
    workerRef.current.postMessage({ type: 'newGame' });
  }, []);

  // ─── Detener búsqueda ─────────────────────────────────────────────────
  const stopSearch = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'stop' });
    setIsThinking(false);
    callbackRef.current = null;
  }, []);

  return {
    isReady,
    isThinking,
    stockfishAvailable,
    getBestMove,
    newGame,
    stopSearch,
    setDifficulty,
  };
}
