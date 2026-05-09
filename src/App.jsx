import React from 'react';
import { useChessGame } from './hooks/useChessGame';
import { GAME_STATUS } from './utils/constants';

import Header from './components/Header';
import ChessBoard from './components/ChessBoard';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import MoveHistory from './components/MoveHistory';
import PlayerCard from './components/PlayerCard';

export default function App() {
  const {
    fen, game, gameStatus, gameResult, playerColor, difficulty, moveHistory,
    optionSquares, lastMoveSquares, checkSquare, currentTurn, isPlayerTurn,
    isThinking, stockfishReady, preMove,
    onSquareClick, onPieceDragBegin, onPieceDrop, startNewGame, changeDifficulty,
  } = useChessGame();

  const isGameOver = [GAME_STATUS.CHECKMATE, GAME_STATUS.STALEMATE, GAME_STATUS.DRAW].includes(gameStatus);
  const aiColor = playerColor === 'white' ? 'black' : 'white';

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)' }}>

      {/* Fondo decorativo */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
        <div style={{
          position:'absolute', top:'-10%', left:'30%',
          width:600, height:600,
          background:'radial-gradient(ellipse, rgba(42,191,170,0.04) 0%, transparent 65%)',
        }} />
        <div style={{
          position:'absolute', bottom:'-10%', right:'20%',
          width:400, height:400,
          background:'radial-gradient(ellipse, rgba(42,107,98,0.05) 0%, transparent 65%)',
        }} />
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(42,191,170,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(42,191,170,0.025) 1px,transparent 1px)',
          backgroundSize:'60px 60px',
          maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 100%)',
        }} />
      </div>

      <Header />

      <main style={{
        flex:1, display:'flex', gap:24, padding:'28px 24px',
        maxWidth:1200, margin:'0 auto', width:'100%',
        position:'relative', zIndex:1, flexWrap:'wrap',
        alignItems:'flex-start',
      }}>

        {/* ── Tablero ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1, alignItems:'center', minWidth:300 }}>

          <div style={{ width:'100%', maxWidth:564 }}>
            <PlayerCard isAI={true} color={aiColor} difficulty={difficulty}
              isActive={currentTurn === aiColor}
              isThinking={isThinking && currentTurn === aiColor} />
          </div>

          <div style={{ width:'100%', maxWidth:564, marginTop:6, marginBottom:40 }}>
            <ChessBoard
              fen={fen} playerColor={playerColor}
              onSquareClick={onSquareClick}
              onPieceDragBegin={onPieceDragBegin}
              onPieceDrop={onPieceDrop}
              optionSquares={optionSquares}
              lastMoveSquares={lastMoveSquares}
              checkSquare={checkSquare}
              gameStatus={gameStatus}
              isThinking={isThinking}
              preMove={preMove}
            />
          </div>

          <div style={{ width:'100%', maxWidth:564 }}>
            <PlayerCard isAI={false} color={playerColor} difficulty={difficulty}
              isActive={currentTurn === playerColor} isThinking={false} />
          </div>
        </div>

        {/* ── Panel lateral ── */}
        <div style={{ width:316, display:'flex', flexDirection:'column', gap:12, flexShrink:0 }}>

          <GameStatus
            gameStatus={gameStatus} gameResult={gameResult}
            currentTurn={currentTurn} playerColor={playerColor}
            isThinking={isThinking} isPlayerTurn={isPlayerTurn} />

          {/* Banner pre-move */}
          {preMove && (
            <div style={{
              padding:'10px 14px', borderRadius:10,
              border:'1px solid rgba(139,92,246,0.4)',
              background:'rgba(139,92,246,0.08)',
              display:'flex', alignItems:'center', gap:10,
            }}>
              <span style={{ fontSize:16 }}>⚡</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#a78bfa' }}>
                  Pre-move registrado
                </div>
                <div style={{ fontSize:11, color:'var(--muted)', fontFamily:'JetBrains Mono,monospace' }}>
                  {preMove.from} → {preMove.to} · se ejecuta automáticamente
                </div>
              </div>
            </div>
          )}

          <MoveHistory moves={moveHistory} />

          <GameControls
            difficulty={difficulty} playerColor={playerColor}
            onNewGame={startNewGame} onChangeDifficulty={changeDifficulty}
            isThinking={isThinking} gameOver={isGameOver} />

          {/* Estado motor */}
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 2px' }}>
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background: stockfishReady ? 'var(--green)' : 'var(--amber)',
              boxShadow: stockfishReady ? '0 0 6px var(--green)' : '0 0 6px var(--amber)',
            }} />
            <span style={{ fontSize:11, color:'var(--muted)', fontFamily:'JetBrains Mono,monospace' }}>
              {stockfishReady ? 'Motor IA conectado' : 'Iniciando motor...'}
            </span>
          </div>
        </div>
      </main>

      <footer style={{
        borderTop:'1px solid var(--border)', padding:'12px 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'relative', zIndex:1,
      }}>
        <span style={{ fontFamily:'Playfair Display,serif', fontSize:14, color:'var(--muted)' }}>
          DailyChess<span style={{ color:'var(--teal)' }}>.app</span>
        </span>
        <span style={{ fontSize:11, color:'var(--faint)', fontFamily:'JetBrains Mono,monospace' }}>
          {moveHistory.length} movimientos · {difficulty}
        </span>
      </footer>
    </div>
  );
}
