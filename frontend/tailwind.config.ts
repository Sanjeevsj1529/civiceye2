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
        }
      },
      backgroundImage: {
        'noise': "var(--noise-url, url('https://www.transparenttextures.com/patterns/natural-paper.png'))",
        'dots': "radial-gradient(circle, var(--dot-color, #94a3b8) 1.2px, transparent 1.2px)",
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'handcrafted': '4px 4px 0px 0px rgba(15, 23, 42, 0.1)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
