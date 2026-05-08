import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../ui'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import { clsx } from 'clsx'

import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

export function HeroSection() {
  const { darkMode } = useUIStore()
  const { user, isAuthenticated } = useAuthStore()

  const isStaff = user?.role === 'super_admin' || user?.role === 'zonal_admin' || user?.role === 'officer'
  const dashboardLink = user?.role === 'officer' ? '/dashboard/officer' : 
                        (user?.role === 'super_admin' || user?.role === 'zonal_admin') ? '/dashboard/admin' : 
                        '/dashboard/citizen'

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
      {/* Clean Theme-Aware Background */}
      <div className={clsx(
        "absolute inset-0 pointer-events-none z-0 transition-all duration-1000",
        darkMode ? "bg-[#020617]" : "bg-white"
      )}>
        {/* Generated Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/simple_clean_modern_city_view_1778250034872.png" 
            alt="Smart City" 
            className={clsx(
              "w-full h-full object-cover transition-all duration-1000",
              darkMode ? "opacity-30 grayscale-[0.3] brightness-[0.4] contrast-[1.1]" : "opacity-15 grayscale-0 brightness-100 contrast-100"
            )}
          />
          <div className={clsx(
            "absolute inset-0",
            darkMode ? "bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" : "bg-gradient-to-b from-white via-transparent to-white"
          )} />
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full -z-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <Badge className="mb-6 bg-primary-500/10 text-primary-400 border border-primary-500/20 px-4 py-2">
          ✨ Transforming Civic Engagement with AI
        </Badge>
        
        <h1 className="text-5xl md:text-8xl font-black font-display leading-[1.1] text-slate-900 dark:text-white mb-8">
          Report. Track. <br />
          <span className="gradient-text animate-pulse-glow">Resolve.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The all-in-one platform for citizens to voice concerns, track resolutions in real-time, 
          and help authorities build smarter cities.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {!isAuthenticated ? (
            <Link to="/login">
              <Button size="xl" glow rightIcon={<ArrowRight size={20} />}>
                Join the Watch & Start
              </Button>
            </Link>
          ) : isStaff ? (
            <Link to={dashboardLink}>
              <Button size="xl" glow rightIcon={<ArrowRight size={20} />}>
                {user?.role === 'officer' ? 'Open Duty Terminal' : 'Launch City HQ'}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/complaints/new">
                <Button size="xl" glow rightIcon={<ArrowRight size={20} />}>
                  Fix My Neighborhood
                </Button>
              </Link>
              <Link to="/dashboard/citizen">
                <Button variant="secondary" size="xl">
                  Citizen Portal
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Floating Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: <Zap className="text-yellow-400" />, label: 'Fast Resolution', desc: 'Average 48hr fix time' },
            { icon: <Shield className="text-emerald-400" />, label: 'Verified Proof', desc: 'Resolution with images' },
            { icon: <Globe className="text-primary-400" />, label: 'Citizen Power', desc: '100% Transparency' },
          ].map((feature, i) => (
            <div 
              key={i}
              className="relative overflow-hidden bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-4 text-left shadow-[0_0_15px_rgba(0,0,0,0.05)]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center relative z-10">
                {feature.icon}
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{feature.label}</p>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', className)}>
      {children}
    </span>
  )
}
