import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Bell, User, Settings, LogOut, Sun, Moon, 
  Command, Shield, Menu, X, Users, BarChart2, 
  Map as MapIcon, ClipboardList, Layout, Activity 
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Avatar, Button, Badge } from '../ui'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, toggleCommandPalette, notifications: uiNotifications, sidebarOpen, toggleSidebar } = useUIStore()
  const { notifications, unreadCount, initializeNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = initializeNotifications(user.id, user.role, user.wardId);
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [user?.id, user?.role, user?.wardId, initializeNotifications]);

  const navLinks = [
    { label: 'Community', path: '/community', icon: <Users size={16} /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart2 size={16} /> },
    { label: 'City Map', path: '/complaints/map', icon: <MapIcon size={16} /> },
  ]

  const dropdownItems = [
    { 
      icon: <Layout size={16} />, 
      label: 'My Dashboard', 
      path: '/dashboard/citizen', 
      show: user?.role === 'citizen' 
    },
    { 
      icon: <Shield size={16} />, 
      label: 'Zonal Dashboard', 
      path: '/dashboard/admin', 
      show: user?.role === 'zonal_admin' || user?.role === 'admin'
    },
    { 
      icon: <Activity size={16} />, 
      label: 'Command Center', 
      path: '/dashboard/admin', 
      show: user?.role === 'super_admin'
    },
    { 
      icon: <ClipboardList size={16} />, 
      label: 'Field Operations', 
      path: '/dashboard/officer', 
      show: user?.role === 'officer' 
    },
    { icon: <User size={16} />, label: 'My Profile', path: '/profile', show: true },
    { icon: <Settings size={16} />, label: 'Settings', path: '/profile?tab=settings', show: true },
  ]

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-500',
        scrolled 
          ? clsx(
              'border-b backdrop-blur-xl transition-all duration-500',
              darkMode 
                ? 'border-white/[0.08] bg-[#030712]/85 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(129,140,248,0.12)]' 
                : 'border-slate-200/90 bg-white/85 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)]'
            )
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
        {/* Logo & Mobile Toggle */}
        <div className="flex items-center gap-6">
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-brand-navy dark:text-slate-400 dark:hover:text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-3 group relative">
            <div className="w-10 h-10 rounded-lg bg-brand-navy dark:bg-brand-indigo flex items-center justify-center text-xl shadow-handcrafted group-hover:rotate-3 transition-transform duration-300">👁️</div>
            <span className="font-display font-black text-2xl tracking-tight text-brand-navy dark:text-white">CivicEye</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-indigo transition-all group-hover:w-full" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 ml-4">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  location.pathname === link.path 
                    ? "bg-primary-500/10 text-primary-500" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-white/5"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg relative">
          <div className={clsx(
            'flex items-center gap-3 w-full px-5 py-2.5 rounded-xl border transition-all duration-500',
            searchFocused 
              ? 'bg-white dark:bg-white/5 border-brand-indigo/50 shadow-soft ring-4 ring-brand-indigo/5' 
              : 'bg-slate-100/50 dark:bg-white/5 border-slate-200/60 dark:border-white/10'
          )}>
            <Search size={16} className="text-slate-400 dark:text-slate-500" />
            <input 
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onClick={toggleCommandPalette}
              readOnly
              placeholder="Search complaints, wards, or officers..." 
              className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 cursor-pointer"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[10px] text-slate-400 font-mono">
              <Command size={10} /> K
            </kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all relative border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-brand-rose text-[8px] font-black text-white flex items-center justify-center rounded-full animate-pulse-glow border-2 border-dark-950">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 glass border border-slate-300 dark:border-white/10 rounded-3xl shadow-2xl z-20 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/5">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Alert Center</h4>
                      <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary-500 hover:text-primary-400">Mark all read</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              markAsRead(n.id);
                              navigate(`/complaints/track/${n.referenceId}`);
                              setNotifOpen(false);
                            }}
                            className={clsx(
                              'p-4 border-b border-slate-200 dark:border-white/5 cursor-pointer transition-all hover:bg-white/5',
                              !n.isRead && 'bg-primary-500/5 border-l-4 border-l-primary-500'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={clsx(
                                'w-8 h-8 rounded-xl flex items-center justify-center text-sm',
                                n.type === 'status_change' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary-500/10 text-primary-500'
                              )}>
                                {n.type === 'status_change' ? '⚡' : '💬'}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase">
                                  {n.createdAt?.seconds ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">All caught up! ✌️</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block" />

          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
              >
                <Avatar name={user!.name} src={user?.avatar} size="sm" />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                    {user?.role === 'super_admin' ? 'Super Admin' : 
                     user?.role === 'zonal_admin' ? 'Zonal Admin' : 
                     user?.role === 'officer' ? 'Field Worker' : 'Citizen'}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 glass border border-slate-300 dark:border-white/10 rounded-3xl shadow-2xl z-20 p-2"
                    >
                      <div className="p-4 border-b border-slate-200 dark:border-white/5 mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="info">{user?.rewardPoints} Points</Badge>
                          <Badge variant="success">Level 4</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {dropdownItems.filter(item => item.show).map(item => (
                          <button 
                            key={item.label}
                            onClick={() => { navigate(item.path); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
                          >
                            {item.icon} {item.label}
                          </button>
                        ))}
                      </div>
                      
                      <div className="h-px bg-slate-200 dark:bg-white/5 my-2" />
                      
                      <button 
                        onClick={() => { logout(); navigate('/'); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm" className="text-slate-900 dark:text-white">Sign In</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
