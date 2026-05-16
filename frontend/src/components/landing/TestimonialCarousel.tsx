import React from 'react'
import { motion } from 'framer-motion'
import { TESTIMONIALS } from '../../utils/mockData'
import { Avatar, Card } from '../ui'

export function TestimonialCarousel() {
  return (
    <section className="py-32 px-4 overflow-hidden relative z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]/50" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-cyan/5 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-md relative z-10">Trusted by Thousands</h2>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] relative z-10 drop-shadow-sm">Join the movement for a cleaner, smarter city.</p>
        </div>

        <div className="flex gap-8 animate-ticker hover:[animation-play-state:paused] w-max px-4">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={i} className="w-[450px] flex-shrink-0 glass-premium p-8 rounded-[2rem] border border-white/10 hover:border-brand-indigo/50 transition-all duration-500 hover:shadow-glow-blue panel-shine group relative overflow-hidden">
              <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />
              <div className="flex items-center gap-5 mb-6 relative z-10">
                <Avatar name={t.name} src={t.avatar} size="lg" className="w-14 h-14 rounded-2xl shadow-md border-2 border-white/10 group-hover:border-neon-cyan/50 transition-colors" />
                <div>
                  <p className="text-base font-black text-white drop-shadow-sm">{t.name}</p>
                  <p className="text-[10px] text-brand-indigo uppercase tracking-[0.2em] font-black mt-1">{t.role}</p>
                </div>
              </div>
              <p className="text-slate-300 italic leading-relaxed font-medium relative z-10">"{t.text}"</p>
              <div className="flex gap-1.5 mt-6 text-amber-500 text-sm drop-shadow-md relative z-10">
                {Array(5).fill(0).map((_, i) => <span key={i}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
