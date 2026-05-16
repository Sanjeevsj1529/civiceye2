import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let startTime: number
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = (timestamp - startTime) / (duration * 1000)
        if (progress < 1) {
          setCount(Math.floor(end * progress))
          requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export function LandingStats() {
  return (
    <section className="relative overflow-hidden px-4 py-24 z-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-indigo/5 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Complaints Filed', value: 12842, icon: '📋', trend: 12, color: 'from-brand-indigo/20 to-transparent border-brand-indigo/30 hover:shadow-glow-blue hover:border-brand-indigo/50' },
            { label: 'Issues Resolved', value: 10250, icon: '✅', trend: 8, color: 'from-emerald-500/20 to-transparent border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:border-emerald-500/50' },
            { label: 'Active Officers', value: 142, icon: '👮', trend: 3, color: 'from-neon-cyan/20 to-transparent border-neon-cyan/30 hover:shadow-glow-blue hover:border-neon-cyan/50' },
            { label: 'Avg Resolution Time', value: 48, icon: '⏱️', suffix: ' hrs', color: 'from-violet-500/20 to-transparent border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-violet-500/50' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className={`glass-premium panel-shine relative overflow-hidden rounded-[2rem] border p-8 bg-gradient-to-br ${stat.color} transition-all duration-500 group`}
              >
                <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left drop-shadow-md">{stat.icon}</div>
                <div className="flex items-end gap-3 relative z-10">
                  <h3 className="text-4xl font-black text-white font-display drop-shadow-sm">
                    <Counter end={stat.value} />
                    {stat.suffix}
                  </h3>
                  {stat.trend && (
                    <span className="text-[10px] font-black text-emerald-400 mb-2 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                      ↑{stat.trend}%
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] mt-3 font-black relative z-10">{stat.label}</p>
                
                {/* Decorative Elements */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
