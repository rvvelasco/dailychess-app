import React from 'react';
import { DIFFICULTY_LEVELS } from '../utils/constants';

export default function PlayerCard({ isAI, color, difficulty, isActive, isThinking }) {
  const diffConfig = DIFFICULTY_LEVELS[difficulty];

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'10px 16px', borderRadius:12,
      background: isActive ? 'var(--surface)' : 'transparent',
      border: isActive ? '1px solid var(--border)' : '1px solid transparent',
      transition:'all 0.3s', opacity: isActive ? 1 : 0.55,
    }}>
      {/* Avatar */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
          background: color==='white' ? 'rgba(200,221,216,0.15)' : 'rgba(42,107,98,0.3)',
          border: `2px solid ${isActive ? 'var(--teal)' : 'var(--border)'}`,
          boxShadow: isActive ? '0 0 12px rgba(42,191,170,0.2)' : 'none',
          transition:'all 0.3s',
        }}>
          {isAI ? '🤖' : '👤'}
        </div>
        {isActive && (
          <div style={{
            position:'absolute', bottom:-1, right:-1,
            width:12, height:12, borderRadius:'50%',
            background: isThinking ? 'var(--amber)' : 'var(--green)',
            border:'2px solid var(--bg)',
            animation: isThinking ? 'ping 1s ease-in-out infinite' : 'none',
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontWeight:500, fontSize:14, color:'var(--text)' }}>
            {isAI ? 'Motor IA' : 'Tú'}
          </span>
          {isAI && diffConfig && (
            <span style={{
              fontSize:10, padding:'2px 8px', borderRadius:100,
              border:`1px solid ${diffConfig.color}50`,
              color: diffConfig.color,
              background: `${diffConfig.color}15`,
              letterSpacing:'0.08em', textTransform:'uppercase',
            }}>
              {diffConfig.label}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
          <div style={{
            width:8, height:8, borderRadius:2,
            background: color==='white' ? 'var(--sq-light)' : 'var(--sq-dark)',
            border: '1px solid rgba(255,255,255,0.1)',
          }} />
          <span style={{ fontSize:11, color:'var(--muted)' }}>
            {color==='white'?'Blancas':'Negras'}
          </span>
        </div>
      </div>

      {isThinking && isAI && (
        <div className="thinking-dots" style={{ color:'var(--teal)', fontSize:14 }}>
          <span>.</span><span>.</span><span>.</span>
        </div>
      )}
    </div>
  );
}
