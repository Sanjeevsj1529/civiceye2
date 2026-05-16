import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Bell, User, Settings, LogOut, Sun, Moon, 
  Command, Menu, X, Layout, Shield, Activity, ClipboardList
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Avatar, Button, Badge } from '../ui'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, toggleCommandPalette, toggleSidebar } = useUIStore()
  const { notifications, unreadCount, initializeNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = initializeNotifications(user.id, user.role, user.wardId);
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [user?.id, user?.role, user?.wardId, initializeNotifications]);

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-6 right-6 z-50 flex justify-between items-start pointer-events-none"
    >
      {/* Top Left: HUD Logo */}
      <Link to="/" className="pointer-events-auto flex items-center gap-4 group glass-premium px-4 py-3 rounded-2xl border border-white/10 shadow-glow-lg panel-shine">
        <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay" />
        <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-brand-indigo to-neon-cyan flex items-center justify-center text-xl shadow-glow-blue group-hover:scale-110 transition-transform">👁️</div>
        <div className="relative z-10">
          <span className="font-display font-black text-xl tracking-tighter text-white drop-shadow-md leading-none block">CivicEye</span>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neon-cyan">Gov OS</span>
        </div>
      </Link>

      {/* Top Right: HUD Actions */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleCommandPalette}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl glass-premium border border-white/10 text-slate-400 hover:text-white transition-colors panel-shine shadow-lg"
        >
          <Search size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Command [⌘K]</span>
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className="flex items-center justify-center w-12 h-12 rounded-2xl glass-premium border border-white/10 text-slate-400 hover:text-white transition-colors panel-shine shadow-lg relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 shadow-glow-rose border border-[#020617]" />
            )}
          </motion.button>
          
          {/* Notification Dropdown (Simplified) */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 glass-premium border border-white/10 rounded-[2rem] shadow-glow-lg z-20 overflow-hidden panel-shine"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Alert Center</h4>
                  <button onClick={markAllAsRead} className="text-[9px] font-bold text-neon-cyan uppercase hover:text-white">Clear All</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => { markAsRead(n.id); navigate(`/complaints/track/${n.referenceId}`); setNotifOpen(false); }}
                        className={clsx(
                          'p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors',
                          !n.isRead && 'bg-brand-indigo/10 border-l-2 border-l-neon-cyan'
                        )}
                      >
                        <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                        <p className="text-[10px] text-slate-400">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">No Active Alerts</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-12 h-12 rounded-2xl glass-premium border border-white/10 text-slate-400 hover:text-white transition-colors panel-shine shadow-lg"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login"><Button variant="ghost" className="text-white text-xs font-black uppercase tracking-widest">Login</Button></Link>
          </div>
        )}
      </div>
    </motion.nav>
  )
}
