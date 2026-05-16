import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CATEGORY_META } from '../../utils/mockData'
import { clsx } from 'clsx'

export function CategoryPills() {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-indigo/10 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter drop-shadow-md relative z-10">Select Action Protocol</h2>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">Initiate rapid response by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-5">
          {Object.entries(CATEGORY_META).map(([key, meta], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link 
                to={`/complaints/new?category=${key}`}
                className="group flex flex-col items-center justify-center p-8 glass-premium rounded-[2rem] border border-white/10 hover:border-brand-indigo/50 hover:bg-white/5 transition-all duration-500 shadow-inner-glow hover:shadow-glow-blue relative overflow-hidden panel-shine"
              >
                <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
                <div className="text-5xl mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 relative z-10 drop-shadow-md">
                  {meta.icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-[0.2em] text-center relative z-10 transition-colors">
                  {meta.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
