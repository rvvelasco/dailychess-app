import React, { useState } from 'react';
import { DIFFICULTY_LEVELS } from '../utils/constants';

export default function GameControls({ difficulty, playerColor, onNewGame, onChangeDifficulty, isThinking, gameOver }) {
  const [pendingColor, setPendingColor] = useState(playerColor);
  const [pendingDiff, setPendingDiff]   = useState(difficulty);

  const handleNewGame = () => {
    onChangeDifficulty(pendingDiff);
    onNewGame(pendingColor, pendingDiff);
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-5 animate-fade-in">
      {/* Título */}
      <div className="flex items-center gap-2">
        <div style={{ width:3, height:18, background:'var(--teal)', borderRadius:2 }} />
        <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:15, color:'var(--text)' }}>
          Nueva Partida
        </h2>
      </div>

      {/* Color */}
      <div>
        <label style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:8 }}>
          Jugar como
        </label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[{ value:'white', label:'Blancas', icon:'♔' },{ value:'black', label:'Negras', icon:'♚' }].map(({ value, label, icon }) => (
            <button key={value} onClick={() => setPendingColor(value)} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'10px 12px', borderRadius:8, cursor:'pointer', fontWeight:500, fontSize:13,
              transition:'all 0.2s',
              background: pendingColor === value ? 'var(--surface2)' : 'transparent',
              border: pendingColor === value ? '1px solid var(--teal)' : '1px solid var(--border)',
              color: pendingColor === value ? 'var(--text)' : 'var(--muted)',
              boxShadow: pendingColor === value ? '0 0 12px rgba(42,191,170,0.15)' : 'none',
            }}>
              <span style={{ fontSize:18, color: value === 'white' ? '#fff' : 'var(--muted)' }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dificultad */}
      <div>
        <label style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', display:'block', marginBottom:8 }}>
          Dificultad
        </label>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
            <button key={key} onClick={() => setPendingDiff(key)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 14px', borderRadius:8, cursor:'pointer',
              transition:'all 0.2s',
              background: pendingDiff === key ? 'var(--surface2)' : 'transparent',
              border: pendingDiff === key ? '1px solid var(--teal-dim)' : '1px solid var(--border)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:16 }}>{config.emoji}</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontWeight:500, fontSize:13, color: pendingDiff === key ? 'var(--text)' : 'var(--muted)' }}>
                    {config.label}
                  </div>
                  <div style={{ fontSize:11, color:'var(--faint)' }}>{config.description}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:3 }}>
                {['easy','medium','hard'].map((lvl, i) => {
                  const isActive = ['easy','medium','hard'].indexOf(key) >= i;
                  return (
                    <div key={i} style={{
                      width:4, height:16, borderRadius:2,
                      background: isActive ? config.color : 'var(--border)',
                      opacity: pendingDiff === key ? 1 : 0.5,
                    }} />
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botón */}
      <button onClick={handleNewGame} disabled={isThinking} style={{
        width:'100%', padding:'12px 24px', borderRadius:8, fontWeight:600, fontSize:14,
        background: isThinking ? 'var(--faint)' : 'var(--teal)',
        color: '#0d1f24', border:'none', cursor: isThinking ? 'not-allowed' : 'pointer',
        transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transform: isThinking ? 'none' : undefined,
        opacity: isThinking ? 0.5 : 1,
      }}
        onMouseEnter={e => { if(!isThinking) e.currentTarget.style.background='#35d4bc'; }}
        onMouseLeave={e => { if(!isThinking) e.currentTarget.style.background='var(--teal)'; }}
      >
        <span style={{ fontSize:16 }}>♟</span>
        {gameOver ? 'Revancha' : 'Nueva Partida'}
      </button>
    </div>
  );
}
