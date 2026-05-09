import React, { useMemo, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { GAME_STATUS } from '../utils/constants';

export default function ChessBoard({
  fen, playerColor, onSquareClick, onPieceDragBegin, onPieceDrop,
  optionSquares, lastMoveSquares, checkSquare, gameStatus, isThinking, preMove,
}) {
  const boardOrientation = playerColor === 'black' ? 'black' : 'white';
  const wrapperRef = useRef(null);

  // Fix drag: forzar position:relative en el contenedor del tablero
  // para que las piezas arrastradas no salgan volando
  useEffect(() => {
    if (!wrapperRef.current) return;
    const board = wrapperRef.current.querySelector('[data-testid="chessboard"]') ||
                  wrapperRef.current.querySelector('div > div');
    if (board) {
      board.style.position = 'relative';
      board.style.overflow = 'visible';
    }
  });

  const customSquareStyles = useMemo(() => {
    const styles = { ...lastMoveSquares, ...optionSquares };
    if (checkSquare) {
      styles[checkSquare] = {
        background:'radial-gradient(circle, rgba(212,74,74,0.7) 0%, rgba(212,74,74,0.2) 70%, transparent 100%)',
      };
    }
    return styles;
  }, [optionSquares, lastMoveSquares, checkSquare]);

  const isGameOver = gameStatus === GAME_STATUS.CHECKMATE ||
                     gameStatus === GAME_STATUS.STALEMATE ||
                     gameStatus === GAME_STATUS.DRAW;

  return (
    <div style={{ position:'relative', width:'100%' }}>
      {/* Borde teal decorativo */}
      <div style={{
        position:'absolute', inset:-1, borderRadius:6, zIndex:0,
        background:'linear-gradient(135deg, var(--teal-dim) 0%, var(--border) 50%, var(--teal-dim) 100%)',
      }} />

      {/* Overlay IA pensando */}
      {isThinking && (
        <div style={{
          position:'absolute', inset:1, zIndex:10,
          borderRadius:4, pointerEvents:'none',
          boxShadow:'inset 0 0 30px rgba(42,191,170,0.08)',
        }} />
      )}

      {/* Tablero */}
      <div
        ref={wrapperRef}
        className="board-wrapper"
        style={{ position:'relative', zIndex:1 }}
      >
        <Chessboard
          id="main-board"
          position={fen}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDrop={onPieceDrop}
          boardOrientation={boardOrientation}
          customSquareStyles={customSquareStyles}
          customBoardStyle={{ borderRadius:4, boxShadow:'none' }}
          customDarkSquareStyle={{ backgroundColor:'#2a6b62' }}
          customLightSquareStyle={{ backgroundColor:'#c8ddd8' }}
          animationDuration={150}
          arePiecesDraggable={!isGameOver}
          showBoardNotation={true}
          snapToCursor={true}
        />
      </div>

      {/* Indicador de pre-move */}
      {preMove && (
        <div style={{
          position:'absolute', bottom:-32, left:0, right:0,
          display:'flex', justifyContent:'center', alignItems:'center', gap:8,
          zIndex:20,
        }}>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.4)',
            borderRadius:100, padding:'4px 12px',
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#a78bfa' }} />
            <span style={{ fontSize:11, color:'#a78bfa', fontFamily:'JetBrains Mono,monospace' }}>
              Pre-move: {preMove.from} → {preMove.to}
            </span>
            <span style={{ fontSize:11, color:'rgba(167,139,250,0.6)', cursor:'pointer' }}>
              (clic para cancelar)
            </span>
          </div>
        </div>
      )}

      {/* Indicador pensando */}
      {isThinking && !preMove && (
        <div style={{
          position:'absolute', bottom:-28, left:0, right:0,
          display:'flex', justifyContent:'center', alignItems:'center', gap:6,
          zIndex:20,
        }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--teal)',
            animation:'ping 1s ease-in-out infinite', opacity:0.7 }} />
          <span style={{ fontSize:11, color:'var(--teal)', fontFamily:'JetBrains Mono,monospace' }}>
            analizando...
          </span>
        </div>
      )}
    </div>
  );
}
