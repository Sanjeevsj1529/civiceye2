import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  X, Layout, Users, BarChart2, Map as MapIcon, 
  Shield, Settings, LogOut, ChevronRight, Zap,
  Home, ClipboardList, Activity
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { Button, Avatar, Badge } from '../ui'
import { clsx } from 'clsx'

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const navItems = [
    { label: 'Home', path: '/', icon: <Home size={20} /> },
    { label: 'Community Feed', path: '/community', icon: <Users size={20} /> },
    { label: 'City Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { label: 'Global Map', path: '/complaints/map', icon: <MapIcon size={20} /> },
  ]

  const roleItems = [
    { 
      label: 'My Dashboard', 
      path: '/dashboard/citizen', 
      icon: <Layout size={20} />, 
      show: user?.role === 'citizen' 
    },
    { 
      label: 'Zonal Dashboard', 
      path: '/dashboard/admin', 
      icon: <Shield size={20} />, 
      show: user?.role === 'zonal_admin' || user?.role === 'admin'
    },
    { 
      label: 'Command Center', 
      path: '/dashboard/admin', 
      icon: <Activity size={20} />, 
      show: user?.role === 'super_admin'
    },
    { 
      label: 'Field Operations', 
      path: '/dashboard/officer', 
      icon: <ClipboardList size={20} />, 
      show: user?.role === 'officer' 
    },
  ]

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] lg:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[300px] bg-white dark:bg-brand-navy border-r border-slate-200 dark:border-white/10 z-[101] flex flex-col shadow-2xl lg:hidden"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shadow-glow-blue">👁️</div>
                <span className="font-display font-black text-xl tracking-tighter text-slate-900 dark:text-white">CivicEye</span>
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Summary (Mobile) */}
            {user && (
              <div className="p-6 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar name={user.name} size="md" className="ring-2 ring-primary-500/20" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <Badge variant="info" className="text-[10px] mt-1">{user.role.toUpperCase()}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-dark-900 p-2 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Points</p>
                    <p className="text-sm font-black text-primary-500">{user.rewardPoints}</p>
                  </div>
                  <div className="bg-white dark:bg-dark-900 p-2 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Reports</p>
                    <p className="text-sm font-black text-emerald-500">{user.complaintsCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
              {/* Main Nav */}
              <div>
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Discovery</p>
                <div className="space-y-1">
                  {navItems.map(item => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={toggleSidebar}
                      className={clsx(
                        "flex items-center justify-between p-3 rounded-xl transition-all group",
                        location.pathname === item.path 
                          ? "bg-primary-500/10 text-primary-500" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx("transition-transform group-hover:scale-110", location.pathname === item.path ? "text-primary-500" : "text-slate-400")}>
                          {item.icon}
                        </span>
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className={clsx("opacity-0 transition-all", location.pathname === item.path ? "opacity-100 translate-x-0" : "group-hover:opacity-40 group-hover:translate-x-1")} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Role Specific */}
              <div>
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operations</p>
                <div className="space-y-1">
                  {roleItems.filter(i => i.show).map(item => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={toggleSidebar}
                      className={clsx(
                        "flex items-center justify-between p-3 rounded-xl transition-all group",
                        location.pathname === item.path 
                          ? "bg-primary-500/10 text-primary-500" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={clsx("transition-transform group-hover:scale-110", location.pathname === item.path ? "text-primary-500" : "text-slate-400")}>
                          {item.icon}
                        </span>
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className={clsx("opacity-0 transition-all", location.pathname === item.path ? "opacity-100 translate-x-0" : "group-hover:opacity-40 group-hover:translate-x-1")} />
                    </Link>
                  ))}
                  <Link to="/complaints/new" onClick={toggleSidebar}>
                    <Button glow className="w-full mt-4 btn-handcrafted">
                      <Zap size={16} className="mr-2" /> File Report
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-white/5 space-y-2">
              <Link 
                to="/profile?tab=settings" 
                onClick={toggleSidebar}
                className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Settings size={20} />
                <span className="text-sm font-bold">Preferences</span>
              </Link>
              <button 
                onClick={() => { logout(); toggleSidebar(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-brand-rose hover:bg-brand-rose/10 transition-all"
              >
                <LogOut size={20} />
                <span className="text-sm font-bold">Secure Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
