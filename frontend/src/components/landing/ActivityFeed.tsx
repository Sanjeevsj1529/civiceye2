import React from 'react'
import { motion } from 'framer-motion'
import { COMPLAINTS, CATEGORY_META, STATUS_META } from '../../utils/mockData'
import { Badge, Card } from '../ui'
import { formatDistanceToNow } from 'date-fns'

export function ActivityFeed() {
  const latest = COMPLAINTS.slice(0, 5)
  
  return (
    <section className="py-32 px-4 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#020617]/50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-indigo/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-cyan/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-md">Real-Time Action</h2>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] drop-shadow-sm">See what's being resolved in your community right now.</p>
        </div>

        <div className="space-y-6">
          {latest.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="glass-premium p-6 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row sm:items-center gap-6 hover:shadow-glow-blue hover:border-brand-indigo/50 transition-all duration-500 group panel-shine relative overflow-hidden">
                <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />
                <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shadow-inner-glow relative z-10">
                  <span className="drop-shadow-md">{CATEGORY_META[c.category].icon}</span>
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-neon-cyan transition-colors">{c.referenceId}</span>
                    <Badge variant={c.status === 'resolved' ? 'success' : 'info'} className="shadow-sm">
                      {STATUS_META[c.status].label}
                    </Badge>
                  </div>
                  <h4 className="text-base font-black text-white truncate drop-shadow-sm">{c.title}</h4>
                  <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wider">{c.location.address}</p>
                </div>
                <div className="text-left sm:text-right relative z-10">
                  <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black">Updated</p>
                  <p className="text-xs font-bold text-slate-300 mt-1">{formatDistanceToNow(new Date(c.updatedAt))} ago</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
