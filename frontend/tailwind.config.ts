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
          500: '#4f46e5', // Indigo
          600: '#4338ca',
          700: '#3730a3',
          800: '#1e1b4b',
          900: '#0f172a',
          950: '#020617', // Ultra deep
        },
        brand: {
          indigo: '#4f46e5',
          navy: '#020617',
          amber: '#f59e0b',
          slate: '#64748b',
          cream: '#fafaf9',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          emerald: '#10b981',
          cyan: '#06b6d4',
          teal: '#14b8a6',
        },
        neon: {
          indigo: '#818cf8',
          cyan: '#22d3ee',
          violet: '#a78bfa',
          mint: '#34d399',
          amber: '#fbbf24',
          rose: '#fb7185',
        },
        dark: {
          950: '#020617',
          900: '#0a0f25',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'handcrafted': '4px 12px 6px 16px',
        'handcrafted-lg': '16px 6px 24px 12px',
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 14s ease-in-out infinite',
        'orbit': 'orbit 22s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'aurora': 'aurora 18s ease-in-out infinite',
        'grid-pan': 'grid-pan 40s linear infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        reveal: {
          '0%': { clipPath: 'inset(100% 0 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(15px, -25px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(40px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(40px) rotate(-360deg)' },
        },
        morph: {
          '0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(129, 140, 248, 0.4))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 30px rgba(34, 211, 238, 0.6))' },
        },
        aurora: {
          '0%, 100%': { opacity: '0.3', transform: 'translateX(0%) translateY(0%) scale(1)' },
          '50%': { opacity: '0.6', transform: 'translateX(8%) translateY(-5%) scale(1.1)' },
        },
        'grid-pan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        },
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        'cinematic': '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        'glow-blue': '0 0 40px -10px rgba(79, 70, 229, 0.4), 0 0 80px -20px rgba(34, 211, 238, 0.2)',
        'glow-violet': '0 0 40px -10px rgba(139, 92, 246, 0.4)',
        'glow-emerald': '0 0 40px -10px rgba(16, 185, 129, 0.4)',
        'glow-rose': '0 0 40px -10px rgba(251, 113, 133, 0.4)',
        'glow-amber': '0 0 40px -10px rgba(251, 191, 36, 0.4)',
        'glow-lg': '0 30px 90px -20px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'noise': "url('https://www.transparenttextures.com/patterns/stardust.png')",
        'dots': "radial-gradient(circle, var(--dot-color, #94a3b8) 1.2px, transparent 1.2px)",
        'radial-fade': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,70,229,0.15), transparent 55%)',
        'mesh': 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, transparent 50%), linear-gradient(225deg, rgba(34,211,238,0.1) 0%, transparent 45%), linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 40%)',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
    },
  },
  plugins: [],
}
