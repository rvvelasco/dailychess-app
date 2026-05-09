/**
 * StockfishBanner.jsx
 * Banner informativo mostrado cuando Stockfish no está disponible
 * Instruye al usuario cómo descargar e instalar stockfish.js
 */

import React, { useState } from 'react';

export default function StockfishBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="glass-card border border-[#f5a623]/30 bg-[#f5a623]/5 p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[#f5a623] text-sm mb-1">
            Stockfish no encontrado
          </h4>
          <p className="text-xs text-[#7d8590] leading-relaxed mb-3">
            Para jugar contra la IA, necesitas el archivo{' '}
            <code className="font-mono bg-[#0d1117] px-1 py-0.5 rounded text-[#58a6ff]">
              stockfish.js
            </code>{' '}
            en la carpeta <code className="font-mono bg-[#0d1117] px-1 py-0.5 rounded text-[#58a6ff]">/public/</code>.
            Mientras tanto, puedes jugar con movimientos aleatorios.
          </p>

          {/* Pasos */}
          <div className="space-y-2 mb-3">
            {[
              {
                step: '1',
                text: 'Descarga stockfish.js desde GitHub',
                link: 'https://github.com/nmrugg/stockfish.js/releases',
                linkText: 'nmrugg/stockfish.js →',
              },
              {
                step: '2',
                text: 'Copia el archivo a',
                code: '/public/stockfish.js',
              },
              {
                step: '3',
                text: 'Reinicia el servidor de desarrollo',
                code: 'npm run dev',
              },
            ].map(({ step, text, link, linkText, code }) => (
              <div key={step} className="flex items-start gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-[#f5a623]/20 border border-[#f5a623]/40 text-[#f5a623] flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                  {step}
                </span>
                <span className="text-[#8892b0] leading-relaxed">
                  {text}{' '}
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#58a6ff] hover:text-[#79b8ff] underline underline-offset-2"
                    >
                      {linkText}
                    </a>
                  )}
                  {code && (
                    <code className="font-mono bg-[#0d1117] px-1 py-0.5 rounded text-[#58a6ff] ml-1">
                      {code}
                    </code>
                  )}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-[#7d8590] hover:text-white transition-colors"
          >
            Entendido, continuar sin Stockfish →
          </button>
        </div>
      </div>
    </div>
  );
}
