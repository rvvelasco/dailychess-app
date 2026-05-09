import React, { useEffect, useRef } from 'react';

export default function MoveHistory({ moves }) {
  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [moves]);

  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({ number: Math.floor(i/2)+1, white: moves[i], black: moves[i+1]||null });
  }

  return (
    <div className="glass-card" style={{ padding:16, display:'flex', flexDirection:'column', gap:12, flex:1, minHeight:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:3, height:16, background:'var(--teal)', borderRadius:2 }} />
          <h3 style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>
            Movimientos
          </h3>
        </div>
        <span style={{
          fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'var(--muted)',
          background:'var(--bg)', padding:'2px 8px', borderRadius:100,
          border:'1px solid var(--border)',
        }}>
          {moves.length}
        </span>
      </div>

      <div ref={listRef} className="move-history" style={{ overflowY:'auto', maxHeight:200, display:'flex', flexDirection:'column', gap:2 }}>
        {movePairs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'24px 0', color:'var(--faint)', fontSize:13 }}>
            <div style={{ fontSize:24, marginBottom:4 }}>♟</div>
            Los movimientos aparecerán aquí
          </div>
        ) : movePairs.map((pair, idx) => {
          const isLast = idx === movePairs.length - 1;
          return (
            <div key={pair.number} className={isLast ? 'animate-slide-in' : ''} style={{
              display:'flex', alignItems:'center', gap:4, fontSize:13,
              fontFamily:'JetBrains Mono,monospace',
            }}>
              <span style={{ width:28, color:'var(--faint)', fontSize:11, textAlign:'right', flexShrink:0 }}>
                {pair.number}.
              </span>
              <span style={{
                flex:1, padding:'2px 8px', borderRadius:6, textAlign:'center',
                background: isLast && moves.length%2!==0 ? 'var(--surface2)' : 'transparent',
                color: isLast && moves.length%2!==0 ? 'var(--text)' : 'var(--muted)',
                fontWeight: isLast && moves.length%2!==0 ? 500 : 400,
              }}>
                {pair.white}
              </span>
              <span style={{
                flex:1, padding:'2px 8px', borderRadius:6, textAlign:'center',
                background: isLast && pair.black && moves.length%2===0 ? 'var(--surface2)' : 'transparent',
                color: isLast && pair.black && moves.length%2===0 ? 'var(--text)' : 'var(--muted)',
                fontWeight: isLast && pair.black && moves.length%2===0 ? 500 : 400,
                visibility: pair.black ? 'visible' : 'hidden',
              }}>
                {pair.black || '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
