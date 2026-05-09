import React from 'react';

export default function Header() {
  return (
    <header style={{
      background: 'rgba(13,31,36,0.96)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      height: 64,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* ── Logo + nombre ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
        {/* Ícono caballero SVG inline (estilo DailyChess teal) */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="34" height="34" rx="8" fill="rgba(42,191,170,0.12)"/>
          {/* Silueta de caballo de ajedrez simplificada */}
          <path
            d="M10 27h14v-2H10v2zm1-3h2v-4l-2-1v5zm3 0h2l1-3-1-1-2 1v3zm3 0h2v-3l-2-1-1 1 1 3zm-5-5l1-2 2 1-1 2-2-1zm1-3l2-3 2 1-2 3-2-1zm2-3l1-3h3l1 2-3 1-2 0z"
            fill="#2abfaa"
            fillRule="evenodd"
          />
          {/* Versión más limpia: texto ♞ */}
        </svg>

        {/* Nombre con el estilo del HTML original */}
        <div>
          <div style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--text)',
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}>
            DailyChess<span style={{ color:'var(--teal)' }}>.app</span>
          </div>
          <div style={{
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: 3,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Powered by IA
          </div>
        </div>
      </div>

      {/* ── Badges derecha ── */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--teal)',
          border: '1px solid var(--teal-dim)',
          background: 'rgba(42,191,170,0.08)',
          padding: '4px 12px',
          borderRadius: 100,
          fontFamily: 'JetBrains Mono, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--teal)',
            display: 'inline-block',
            boxShadow: '0 0 6px var(--teal)',
          }} />
          Motor activo
        </span>
      </div>
    </header>
  );
}
