import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navbar } from './common/Navbar'
import { Sidebar } from './common/Sidebar'
import { CommandPalette } from './common/CommandPalette'
import { useUIStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import { Toaster } from 'react-hot-toast'
import { clsx } from 'clsx'

function GlobalAmbient() {
  return (
    <motion.div
      className="ce-page-ambient pointer-events-none fixed inset-0 z-0"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-[#020617] opacity-90" />
      <motion.div
        className="absolute inset-0 ce-mesh-bg opacity-30"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -left-[10%] top-[-15%] h-[60vh] w-[60vh] rounded-full bg-brand-indigo/10 blur-[140px]"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-[20%] top-[10%] h-[70vh] w-[70vh] rounded-full bg-neon-cyan/5 blur-[150px]"
        animate={{ x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] h-[50vh] w-[60vh] rounded-full bg-brand-violet/5 blur-[130px]"
        animate={{ x: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      <div className="absolute inset-0 opacity-[0.2] bg-grid" style={{ backgroundPosition: 'center top' }} />
      <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" />
    </motion.div>
  )
}

export function AppShell() {
  const { darkMode, fontSize, dyslexicFont, rtl, highContrast, setAllSettings } = useUIStore()
  const { user, isAuthenticated, updateUISettings } = useAuthStore()

  React.useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }, [])

  return (
    <div
      className={clsx(
        'relative min-h-screen w-full overflow-x-hidden bg-[#020617]',
        'dark text-slate-200',
        fontSize === 'lg' ? 'text-lg' : fontSize === 'sm' ? 'text-sm' : 'text-base',
        dyslexicFont && 'font-dyslexic',
        rtl && 'rtl',
        highContrast && 'contrast-125 brightness-110'
      )}
    >
      <GlobalAmbient />

      <Navbar />
      <Sidebar />
      <CommandPalette />
      
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-premium !border-white/10 !text-white !shadow-glow-lg',
          duration: 4000,
          style: {
            background: 'rgba(8, 12, 28, 0.88)',
            backdropFilter: 'blur(24px)',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 40px -12px rgba(79, 70, 229, 0.4)',
          },
        }}
      />

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
