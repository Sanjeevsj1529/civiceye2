import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { HeroSection } from '../../components/landing/HeroSection'
import { LiveTicker } from '../../components/landing/LiveTicker'
import { CategoryPills } from '../../components/landing/CategoryPills'
import { LandingStats } from '../../components/landing/LandingStats'
import { ActivityFeed } from '../../components/landing/ActivityFeed'
import { TestimonialCarousel } from '../../components/landing/TestimonialCarousel'
import { WARDS } from '../../utils/mockData'
import { Button } from '../../components/ui'
import { Link } from 'react-router-dom'
import { Trophy, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <HeroSection />
      <LiveTicker />
      <CategoryPills />
      <LandingStats />
      
      {/* Featured Section: Top Wards - Broken Symmetry Layout */}
      <section className="py-32 px-6 relative overflow-hidden bg-brand-navy/5 dark:bg-white/5">
        <div className="absolute inset-0 bg-dots [background-size:30px_30px] opacity-40 dark:opacity-10" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-start relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 sticky top-32"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-handcrafted bg-brand-amber/10 flex items-center justify-center text-3xl text-brand-amber shadow-handcrafted">🏆</div>
              <h3 className="text-sm font-black text-brand-amber uppercase tracking-[0.2em]">Performance Index</h3>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-brand-navy dark:text-white mb-8 leading-[0.9] tracking-tighter">
              Accountability <br />
              <span className="text-brand-indigo underline decoration-brand-amber/30 decoration-wavy underline-offset-8">by Design.</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
              We monitor resolution speeds and citizen satisfaction across every ward. 
              Real data. Real transparency.
            </p>
            <Link to="/analytics">
              <Button size="xl" variant="outline" className="btn-handcrafted border-2 border-brand-navy dark:border-white/20 text-brand-navy dark:text-white hover:bg-brand-navy hover:text-white dark:hover:bg-white dark:hover:text-brand-navy transition-all">
                Explore City Metrics
              </Button>
            </Link>
          </motion.div>

          <div className="lg:col-span-7 space-y-6 pt-12 lg:pt-0">
            {WARDS.slice(0, 4).sort((a, b) => b.slaComplianceRate - a.slaComplianceRate).map((ward, i) => (
              <motion.div
                key={ward.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={clsx(
                  "glass p-8 rounded-2xl border-2 border-slate-200 dark:border-white/5 flex items-center justify-between group hover:shadow-handcrafted transition-all duration-500",
                  i % 2 === 0 ? "lg:mr-12" : "lg:ml-12"
                )}
              >
                <div className="flex items-center gap-8">
                  <span className="text-4xl font-black text-slate-200 dark:text-slate-800 font-display transition-colors group-hover:text-brand-indigo/20">0{i + 1}</span>
                  <div>
                    <h4 className="text-2xl font-black text-brand-navy dark:text-white group-hover:text-brand-indigo transition-colors">{ward.name}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {ward.officerCount} Active Responders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-brand-navy dark:text-white font-display leading-none">{ward.slaComplianceRate}%</p>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-widest font-black mt-1">SLA Compliance</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ActivityFeed />
      <TestimonialCarousel />

      {/* Final CTA - Humanized Layering */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-navy" />
        <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.05] bg-noise" />
        <div className="max-w-5xl mx-auto relative z-10 text-center glass bg-white/10 dark:bg-white/5 p-20 rounded-handcrafted-lg border border-white/10 shadow-2xl backdrop-blur-xl rotate-[-1deg]">
          <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">Voice your concern, <br /><span className="text-brand-indigo">Change your city.</span></h2>
          <p className="text-xl text-indigo-200/60 mb-14 max-w-2xl mx-auto font-medium">
            Join thousands of citizens working directly with authorities to build a more responsive and liveable urban future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register"><Button size="xl" className="btn-handcrafted bg-white text-brand-navy px-12 shadow-2xl hover:scale-105 transition-transform">Create Account</Button></Link>
            <Link to="/about"><Button variant="ghost" size="xl" className="text-white hover:bg-white/10 px-10">Learn the Workflow</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer - Professional Civic Identity */}
      <footer className="bg-brand-navy dark:bg-[#050810] py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-indigo/50 to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded bg-brand-indigo flex items-center justify-center text-xl">👁️</div>
              <span className="font-display font-black text-2xl tracking-tight text-white">CivicEye</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Official transparency and public grievance platform. 
              Empowering citizens, assisting authorities, building futures.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                <a key={s} href="#" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">{s}</a>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-8">Platform</h5>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link to="/analytics" className="hover:text-brand-indigo transition-colors">City Analytics</Link></li>
              <li><Link to="/community" className="hover:text-brand-indigo transition-colors">Community Feed</Link></li>
              <li><Link to="/about" className="hover:text-brand-indigo transition-colors">How it Works</Link></li>
              <li><Link to="/contact" className="hover:text-brand-indigo transition-colors">Support Desk</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-8">Legal</h5>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link to="/privacy" className="hover:text-brand-indigo transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-indigo transition-colors">Terms of Service</Link></li>
              <li><Link to="/accessibility" className="hover:text-brand-indigo transition-colors">Accessibility Statement</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">© 2026 CivicEye. Government of India Initiative.</p>
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">System Online • v4.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
