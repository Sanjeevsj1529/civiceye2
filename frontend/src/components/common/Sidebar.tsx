import React from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Users, BarChart2, Map as MapIcon, 
  Shield, Activity, ClipboardList, Settings, Zap
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'
import { Avatar } from '../ui'

export function Sidebar() {
  const { user } = useAuthStore()
  const location = useLocation()

  const navItems = [
    { label: 'Home', path: '/', icon: <Home size={24} /> },
    { label: 'Community Feed', path: '/community', icon: <Users size={24} /> },
    { label: 'City Analytics', path: '/analytics', icon: <BarChart2 size={24} /> },
    { label: 'Global Map', path: '/complaints/map', icon: <MapIcon size={24} /> },
  ]

  const roleItems = [
    { label: 'Dashboard', path: '/dashboard/citizen', icon: <Activity size={24} />, show: user?.role === 'citizen' },
    { label: 'Zonal Command', path: '/dashboard/admin', icon: <Shield size={24} />, show: user?.role === 'zonal_admin' || user?.role === 'admin' },
    { label: 'Command Center', path: '/dashboard/admin', icon: <Activity size={24} />, show: user?.role === 'super_admin' },
    { label: 'Field Ops', path: '/dashboard/officer', icon: <ClipboardList size={24} />, show: user?.role === 'officer' },
  ]

  const allItems = [...navItems, ...roleItems.filter(i => i.show)]

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.5 }}
      className="fixed bottom-8 left-1/2 z-[100] flex items-center gap-2 rounded-[2rem] glass-premium p-3 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-2xl panel-shine"
    >
      {allItems.map((item) => {
        const active = location.pathname === item.path
        return (
          <Link key={item.label} to={item.path} className="relative group">
            <motion.div
              whileHover={{ y: -12, scale: 1.2 }}
              className={clsx(
                "flex h-12 w-12 items-center justify-center rounded-[1.25rem] transition-all duration-300 relative z-10",
                active ? "bg-white/10 text-neon-cyan shadow-inner-glow border border-white/20" : "text-slate-400 hover:text-white"
              )}
            >
              {item.icon}
            </motion.div>
            {active && (
              <motion.div 
                layoutId="dock-indicator"
                className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              />
            )}
            
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#020617]/90 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
              {item.label}
            </div>
          </Link>
        )
      })}

      <div className="w-px h-8 bg-white/10 mx-2" />

      <Link to="/complaints/new" className="relative group">
        <motion.div
          whileHover={{ y: -12, scale: 1.2 }}
          className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-brand-indigo to-neon-cyan text-white shadow-glow-blue transition-all duration-300 border border-white/20 relative z-10"
        >
          <Zap size={24} className="animate-pulse" />
        </motion.div>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#020617]/90 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          Deploy Action
        </div>
      </Link>

      {user && (
        <>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <Link to="/profile" className="relative group">
            <motion.div whileHover={{ y: -12, scale: 1.15 }}>
              <Avatar name={user.name} src={user.avatar} size="sm" className="ring-2 ring-white/10 group-hover:ring-brand-indigo/50 transition-all cursor-pointer" />
            </motion.div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#020617]/90 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
              Profile Ops
            </div>
          </Link>
        </>
      )}
    </motion.div>
  )
}
