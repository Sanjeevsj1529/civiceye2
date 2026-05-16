import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TICKER_MESSAGES = [
  "🚨 New: Water leakage reported in East Ward (Sector 14)",
  "✅ Resolved: Street light fix completed on Main Street",
  "👮 Officer Rajesh is now responding to a Garbage complaint",
  "📱 5,000+ citizens registered this month!",
  "🏆 West Ward leads in resolution efficiency today!",
  "⚠️ Alert: Planned maintenance in Zone 4 tonight (8 PM - 12 AM)",
]

export function LiveTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TICKER_MESSAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden border-y border-white/10 bg-[#030712]/90 py-3.5 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-indigo/10 via-transparent to-neon-cyan/10" />
      <motion.div className="relative mx-auto flex max-w-[1600px] items-center gap-6 px-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 whitespace-nowrap rounded-full border border-neon-cyan/25 bg-neon-cyan/10 px-3 py-1.5 shadow-[0_0_24px_-8px_rgba(34,211,238,0.5)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-neon-cyan">
            Live Updates
          </span>
        </motion.div>

        <div className="relative h-5 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-0 text-sm text-slate-400"
            >
              {TICKER_MESSAGES[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="hidden items-center gap-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:flex">
          <span>Active Officers: 142</span>
          <span>SLA Compliance: 94.2%</span>
          <span>API Latency: 24ms</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
