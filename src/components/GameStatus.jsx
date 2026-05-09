import React from 'react';
import { GAME_STATUS } from '../utils/constants';

function ThinkingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ position:'relative', width:14, height:14 }}>
        <div style={{
          position:'absolute', inset:0, borderRadius:'50%',
          background:'var(--teal)', animation:'ping 1s ease-in-out infinite', opacity:0.3,
        }} />
        <div style={{ position:'absolute', inset:3, borderRadius:'50%', background:'var(--teal)' }} />
      </div>
      <span style={{ fontWeight:500, fontSize:14, color:'var(--teal)' }}>
        IA pensando<span className="thinking-dots"><span>.</span><span>.</span><span>.</span></span>
      </span>
    </div>
  );
}

export default function GameStatus({ gameStatus, gameResult, currentTurn, playerColor, isThinking, isPlayerTurn }) {
  const isGameOver = [GAME_STATUS.CHECKMATE, GAME_STATUS.STALEMATE, GAME_STATUS.DRAW].includes(gameStatus);

  if (isGameOver && gameResult) {
    const { type, playerWon } = gameResult;
    const configs = {
      checkmate: { icon: playerWon?'🏆':'💀', title: playerWon?'¡Ganaste!':'¡Perdiste!', sub:'Jaque Mate', color: playerWon?'var(--green)':'var(--red)' },
      stalemate: { icon:'🤝', title:'Tablas', sub:'Rey Ahogado', color:'var(--amber)' },
      draw:      { icon:'🤝', title:'Tablas', sub:'Empate',     color:'var(--amber)' },
    };
    const c = configs[type] || configs.draw;
    return (
      <div className="glass-card game-status-badge" style={{
        padding:16, border:`1px solid ${c.color}33`, background:`${c.color}08`,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:28 }}>{c.icon}</span>
          <div>
            <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:18, color:c.color }}>{c.title}</div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>{c.sub}</div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === GAME_STATUS.CHECK) {
    return (
      <div className="glass-card check-glow" style={{ padding:16, border:'1px solid rgba(212,74,74,0.4)', background:'rgba(212,74,74,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight:600, color:'var(--red)', fontSize:15 }}>¡Jaque!</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>El rey {currentTurn==='white'?'blanco':'negro'} está en jaque</div>
          </div>
        </div>
      </div>
    );
  }

  if (isThinking) {
    return (
      <div className="glass-card" style={{ padding:16 }}>
        <ThinkingIndicator />
        <div style={{ fontSize:12, color:'var(--muted)', marginTop:8 }}>Calculando el mejor movimiento...</div>
        <div style={{ marginTop:12, height:2, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:2,
            background:`linear-gradient(90deg, var(--teal-dim), var(--teal))`,
            animation:'shimmer 1.5s ease-in-out infinite',
            width:'60%',
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:12, height:12, borderRadius:'50%',
            background: currentTurn==='white' ? '#fff' : 'var(--bg)',
            border: currentTurn==='white' ? '2px solid rgba(255,255,255,0.4)' : '2px solid var(--muted)',
            boxShadow: currentTurn==='white' ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
          }} />
          <div>
            <div style={{ fontWeight:500, fontSize:14, color:'var(--text)' }}>
              {isPlayerTurn ? 'Tu turno' : 'Turno de la IA'}
            </div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>
              {currentTurn==='white'?'Blancas':'Negras'} mueven
            </div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, color:'var(--muted)' }}>Juegas como</div>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--teal)', marginTop:2 }}>
            {playerColor==='white'?'♔ Blancas':'♚ Negras'}
          </div>
        </div>
      </div>
    </div>
  );
}
