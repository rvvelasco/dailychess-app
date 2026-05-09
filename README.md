# ♛ Chess AI — Juega contra Stockfish

Aplicación web de ajedrez profesional construida con React + Vite, con integración de Stockfish como motor de IA.

---

## 📁 Estructura del Proyecto

```
chess-app/
├── public/
│   ├── chess-icon.svg          # Ícono de la app
│   ├── stockfish.worker.js     # Web Worker para Stockfish
│   └── stockfish.js            # ⚠️ DEBES DESCARGAR ESTE ARCHIVO (ver instrucciones)
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Barra superior con logo
│   │   ├── ChessBoard.jsx      # Tablero interactivo (react-chessboard)
│   │   ├── GameControls.jsx    # Controles: dificultad, color, nueva partida
│   │   ├── GameStatus.jsx      # Estado: turno, jaque, resultado
│   │   ├── MoveHistory.jsx     # Historial de movimientos en SAN
│   │   ├── PlayerCard.jsx      # Tarjetas de jugador/IA
│   │   └── StockfishBanner.jsx # Banner cuando Stockfish no está disponible
│   ├── hooks/
│   │   ├── useChessGame.js     # Hook principal del juego
│   │   └── useStockfish.js     # Hook para comunicación con Stockfish
│   ├── utils/
│   │   ├── constants.js        # Configuración centralizada
│   │   └── sounds.js           # Sistema de sonidos (Web Audio API)
│   ├── App.jsx                 # Componente raíz
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales + Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd chess-app
npm install
```

### 2. ⚠️ Descargar Stockfish (OBLIGATORIO para jugar contra IA)

Stockfish es el motor de ajedrez. Debes descargarlo y colocarlo manualmente:

#### Opción A — Descarga directa (recomendado)
1. Ve a: https://github.com/nmrugg/stockfish.js/releases
2. Descarga el archivo `stockfish.js`
3. Cópialo a: `chess-app/public/stockfish.js`

#### Opción B — Con npm
```bash
npm install stockfish
cp node_modules/stockfish/stockfish.js public/stockfish.js
```

#### Opción C — Sin Stockfish (movimientos aleatorios)
La app funciona sin Stockfish, pero la IA hará movimientos aleatorios.
Aparecerá un banner con instrucciones.

---

## ▶️ Ejecutar en Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

---

## 🏗️ Build para Producción

```bash
npm run build
npm run preview    # Previsualizar el build
```

Los archivos de producción estarán en `dist/`.

---

## 🌐 Deploy en Vercel

### Método 1: CLI de Vercel
```bash
npm install -g vercel
vercel login
vercel          # Deploy de preview
vercel --prod   # Deploy a producción
```

### Método 2: GitHub + Vercel Dashboard
1. Sube el proyecto a GitHub
2. Ve a https://vercel.com/new
3. Importa tu repositorio
4. Configuración:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click en "Deploy"

> ⚠️ **Importante para Vercel**: Asegúrate de incluir `stockfish.js` en el repositorio (la carpeta `public/`). Normalmente se agregaría al `.gitignore` pero en este caso **debe estar en el repo**.

---

## 🎯 Cómo Cambiar la Dificultad del Motor

La dificultad se configura en `src/utils/constants.js`:

```javascript
export const DIFFICULTY_LEVELS = {
  easy: {
    skill: 1,        // Nivel Stockfish 0-20 (0=peor, 20=máximo)
    depth: 3,        // Profundidad de búsqueda
    movetime: 500,   // Tiempo de pensamiento en ms
  },
  medium: {
    skill: 10,
    depth: 8,
    movetime: 1500,
  },
  hard: {
    skill: 20,
    depth: 20,
    movetime: 3000,  // 3 segundos
  },
};
```

**Para hacer la IA más difícil:**
- Aumenta `skill` (máximo 20)
- Aumenta `depth` (más profundidad = más fuerte)
- Aumenta `movetime` (más tiempo = mejor jugada)

**Para agregar un nivel "Imposible":**
```javascript
impossible: {
  label: 'Imposible',
  emoji: '👾',
  description: 'Stockfish máximo',
  skill: 20,
  depth: null,     // Sin límite de profundidad
  movetime: 5000,  // 5 segundos
  color: '#a855f7',
}
```

---

## 🔄 Cómo Reemplazar Stockfish por Otro Motor

### Opción 1: Otro archivo de motor (UCI compatible)

La comunicación con el motor se maneja en `public/stockfish.worker.js`.
Cualquier motor UCI puede reemplazar a Stockfish:

```javascript
// En stockfish.worker.js, línea de importScripts:
importScripts('/tu-motor.js');  // Reemplaza stockfish.js

// El motor debe exponer una función global o seguir el protocolo UCI
```

### Opción 2: Motor en servidor (con backend)

Si quieres usar Stockfish nativo (más potente), reemplaza el Web Worker
por llamadas a una API:

```javascript
// En useStockfish.js, reemplaza getBestMove:
const getBestMove = async (fen, difficulty, onMove) => {
  const response = await fetch('/api/stockfish', {
    method: 'POST',
    body: JSON.stringify({ fen, depth: config.depth }),
  });
  const { move } = await response.json();
  onMove(move);
};
```

### Opción 3: Lc0 / Leela Chess Zero
Reemplaza el worker con la versión WASM de Leela:
- https://github.com/LeelaChessZero/lc0

---

## 🎮 Funcionalidades

- ✅ Tablero interactivo (click y drag & drop)
- ✅ Motor Stockfish con Web Workers
- ✅ 3 niveles de dificultad configurables
- ✅ Elección de color (blancas/negras)
- ✅ Detección de jaque mate, tablas y jaque
- ✅ Movimientos legales resaltados
- ✅ Historial de movimientos en notación algebraica
- ✅ Sonidos procedurales (Web Audio API)
- ✅ Indicador visual cuando la IA piensa
- ✅ Diseño responsive (móvil y escritorio)
- ✅ Tema oscuro profesional

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI |
| Vite | 5 | Bundler |
| TailwindCSS | 3 | Estilos |
| react-chessboard | 4 | Tablero visual |
| chess.js | 1 | Lógica/validación |
| Stockfish.js | nmrugg | Motor de IA |
| Web Audio API | nativa | Sonidos |

---

## 📄 Licencia

MIT — Libre para uso personal y comercial.
