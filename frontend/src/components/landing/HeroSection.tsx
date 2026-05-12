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

  const isStaff = user?.role === 'admin'
  const dashboardLink = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/citizen'

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
      {/* Background with texture and subtle depth */}
      <div className={clsx(
        "absolute inset-0 z-0",
        darkMode ? "bg-brand-navy" : "bg-brand-cream"
      )}>
        <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.05] bg-noise" />
        <div className="absolute top-0 left-0 w-full h-full bg-dots [background-size:20px_20px] opacity-50 dark:opacity-20" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-brand-indigo/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-amber/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-7 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-indigo animate-pulse" />
            Official City Portal
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-display leading-[0.95] text-brand-navy dark:text-white mb-8 tracking-tighter">
            Better Cities <br />
            <span className="text-brand-indigo italic">Built Together.</span>
          </h1>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mb-12 leading-relaxed font-medium">
            A collaborative platform for citizens and authorities to report, track, 
            and resolve public issues with transparency and accountability.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-16">
            {!isAuthenticated ? (
              <Link to="/login">
                <Button size="xl" className="btn-handcrafted px-10 shadow-handcrafted bg-brand-navy dark:bg-brand-indigo hover:translate-y-[-2px] transition-transform">
                  Report an Issue
                </Button>
              </Link>
            ) : (
              <Link to={dashboardLink}>
                <Button size="xl" className="btn-handcrafted px-10 shadow-handcrafted bg-brand-navy dark:bg-brand-indigo hover:translate-y-[-2px] transition-transform">
                  Access Portal
                </Button>
              </Link>
            )}
            <Link to="/about">
              <button className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-indigo transition-colors flex items-center gap-2 group">
                How it works <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-8 border-t border-slate-200 dark:border-white/5 pt-10">
            <div>
              <p className="text-2xl font-black text-brand-navy dark:text-white">12.4k</p>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Issues Resolved</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
            <div>
              <p className="text-2xl font-black text-brand-navy dark:text-white">98%</p>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">SLA Compliance</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="md:col-span-5 lg:col-span-5 relative hidden md:block"
        >
          <div className="relative z-10 glass p-2 rounded-handcrafted-lg border-2 border-white/20 shadow-premium hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:border-brand-indigo/40 transition-all duration-700 overflow-hidden">
            <img 
              src="/hero_image.png" 
              alt="CivicEye Platform Connectivity" 
              className="w-full h-auto rounded-lg transition-all duration-700 hover:scale-105"
            />
          </div>
          {/* Decorative elements to break symmetry */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-indigo/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-amber/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
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
