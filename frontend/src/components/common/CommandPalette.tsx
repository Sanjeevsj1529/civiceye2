import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, Map, Plus, BarChart, Settings, User, HelpCircle, FileText, Layout, Bell, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'

const COMMANDS = [
  { id: 'new_complaint', label: 'File a New Complaint', icon: <Plus size={18} />, path: '/complaints/new', category: 'Actions' },
  { id: 'track_id', label: 'Track Complaint by ID', icon: <Search size={18} />, path: '/complaints/track', category: 'Actions' },
  { id: 'view_map', label: 'Open Civic Map', icon: <Map size={18} />, path: '/complaints/map', category: 'Views' },
  { id: 'analytics', label: 'View Public Analytics', icon: <BarChart size={18} />, path: '/analytics', category: 'Views' },
  { id: 'dashboard', label: 'Go to My Dashboard', icon: <Layout size={18} />, path: '/dashboard/citizen', category: 'Navigation' },
  { id: 'profile', label: 'Edit My Profile', icon: <User size={18} />, path: '/profile', category: 'Navigation' },
  { id: 'settings', label: 'Account Settings', icon: <Settings size={18} />, path: '/profile?tab=settings', category: 'Navigation' },
  { id: 'help', label: 'Help & FAQ', icon: <HelpCircle size={18} />, path: '/faq', category: 'Information' },
  { id: 'privacy', label: 'Privacy Policy', icon: <FileText size={18} />, path: '/privacy', category: 'Information' },
  { id: 'lang_hi', label: 'Switch to Hindi', icon: <Globe size={18} />, action: () => alert('Hindi selected'), category: 'Preferences' },
  { id: 'toggle_theme', label: 'Toggle Dark/Light Mode', icon: <Command size={18} />, action: () => {}, category: 'Preferences' },
]

export function CommandPalette() {
  const { commandPaletteOpen: isOpen, setCommandPalette: setOpen, toggleDarkMode } = useUIStore()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!isOpen)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setOpen])

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))

  const handleSelect = (command: typeof COMMANDS[0]) => {
    if (command.path) navigate(command.path)
    if (command.action) command.action()
    if (command.id === 'toggle_theme') toggleDarkMode()
    setOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-100 dark:bg-dark-950/90"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl glass border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-slate-50 dark:bg-white/5">
              <Command size={20} className="text-primary-500" />
              <input 
                autoFocus
                placeholder="What do you want to do?" 
                className="w-full bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-600"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-dark-800 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 font-bold">
                ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-slate-500">No commands found for "{query}"</p>
                </div>
              ) : (
                Object.entries(
                  filtered.reduce((acc, cmd) => {
                    if (!acc[cmd.category]) acc[cmd.category] = []
                    acc[cmd.category].push(cmd)
                    return acc
                  }, {} as Record<string, typeof COMMANDS>)
                ).map(([category, cmds]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{category}</div>
                    <div className="space-y-1">
                      {cmds.map((cmd) => (
                        <button
                          key={cmd.id}
                          onClick={() => handleSelect(cmd)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 dark:bg-white/5 group transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-slate-400 group-hover:text-primary-400 transition-colors">
                              {cmd.icon}
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-900 dark:text-white">
                              {cmd.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">
                            {cmd.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-dark-800 border border-slate-200 dark:border-white/10 text-slate-400">↑↓</span> Navigate
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-dark-800 border border-slate-200 dark:border-white/10 text-slate-400">ENTER</span> Select
                </div>
              </div>
              <p className="text-[10px] text-slate-600">CivicEye Intelligence Console</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
