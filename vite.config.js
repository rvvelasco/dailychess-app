import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Para GitHub Pages: cambia 'dailychess-app' por el nombre exacto de tu repo
  // Si usas dominio propio, deja base: '/'
  base: '/',
  worker: { format: 'es' },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react','react-dom'],
          chess:  ['chess.js','react-chessboard'],
        },
      },
    },
  },
})
