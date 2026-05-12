/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#4f46e5', // Muted Indigo
          600: '#4338ca',
          700: '#3730a3',
          800: '#1e1b4b',
          900: '#0f172a', // Deep Navy
          950: '#020617',
        },
        brand: {
          indigo: '#4f46e5',
          navy: '#0f172a',
          amber: '#f59e0b',
          slate: '#64748b',
          cream: '#fafaf9',
          rose: '#fb7185',
          violet: '#8b5cf6',
          emerald: '#10b981',
          cyan: '#22d3ee',
        },
        neon: {
          indigo: '#818cf8',
          cyan: '#22d3ee',
          violet: '#a78bfa',
          mint: '#34d399',
        },
        dark: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        }
      },
      fontFamily: {
        display: ['Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'handcrafted': '2px 8px 4px 12px',
        'handcrafted-lg': '12px 4px 16px 8px',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 14s ease-in-out infinite',
        'orbit': 'orbit 22s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'aurora': 'aurora 18s ease-in-out infinite',
        'grid-pan': 'grid-pan 40s linear infinite',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(12px, -18px) scale(1.03)' },
          '66%': { transform: 'translate(-10px, 8px) scale(0.98)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(40px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(40px) rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(129, 140, 248, 0.55))' },
          '50%': { opacity: '0.85', filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.65))' },
        },
        aurora: {
          '0%, 100%': { opacity: '0.45', transform: 'translateX(0%) translateY(0%) scale(1)' },
          '50%': { opacity: '0.75', transform: 'translateX(5%) translateY(-3%) scale(1.08)' },
        },
        'grid-pan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'handcrafted': '4px 4px 0px 0px rgba(15, 23, 42, 0.1)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
        'glow-blue': '0 0 60px -12px rgba(79, 70, 229, 0.55), 0 0 120px -24px rgba(34, 211, 238, 0.25)',
        'glow-violet': '0 0 50px -10px rgba(139, 92, 246, 0.5)',
        'glow-emerald': '0 0 45px -8px rgba(16, 185, 129, 0.45)',
        'glow-rose': '0 0 45px -8px rgba(251, 113, 133, 0.45)',
        'glow-lg': '0 25px 80px -20px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.06)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'noise': "var(--noise-url, url('https://www.transparenttextures.com/patterns/natural-paper.png'))",
        'dots': "radial-gradient(circle, var(--dot-color, #94a3b8) 1.2px, transparent 1.2px)",
        'radial-fade': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,70,229,0.22), transparent 55%)',
        'mesh': 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, transparent 50%), linear-gradient(225deg, rgba(34,211,238,0.12) 0%, transparent 45%), linear-gradient(180deg, rgba(139,92,246,0.1) 0%, transparent 40%)',
      },
    },
  },
  plugins: [],
}
