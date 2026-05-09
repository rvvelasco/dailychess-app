/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        dc: {
          bg:      '#0d1f24',
          bg2:     '#112028',
          surface: '#162a32',
          surface2:'#1c3340',
          border:  '#1e3a44',
          teal:    '#2abfaa',
          tealDim: '#1a7a6e',
          text:    '#e8f2f0',
          muted:   '#7aa8a2',
          faint:   '#3a5a60',
          red:     '#d44a4a',
          amber:   '#c9a84c',
          green:   '#4caf7c',
          sqLight: '#c8ddd8',
          sqDark:  '#2a6b62',
        },
      },
      animation: {
        'fade-in':     'fadeup 0.4s ease both',
        'slide-in':    'slideIn 0.3s ease both',
        'bounce-subtle':'bounceSubtle 0.6s ease-out',
        'thinking':    'thinkingDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeup: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-4px)' },
        },
        thinkingDot: {
          '0%,80%,100%': { opacity: '0.3' },
          '40%':          { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
