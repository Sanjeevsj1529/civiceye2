import React, { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroSection } from '../../components/landing/HeroSection'
import { LiveTicker } from '../../components/landing/LiveTicker'
import { CategoryPills } from '../../components/landing/CategoryPills'
import { LandingStats } from '../../components/landing/LandingStats'
import { ActivityFeed } from '../../components/landing/ActivityFeed'
import { TestimonialCarousel } from '../../components/landing/TestimonialCarousel'
import { WARDS } from '../../utils/mockData'
import { Button } from '../../components/ui'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const wardsSectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = wardsSectionRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.from(root.querySelectorAll('.landing-ward-card'), {
        scrollTrigger: {
          trigger: root,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        y: 48,
        opacity: 0,
        duration: 0.95,
        stagger: 0.1,
        ease: 'power3.out',
      })

      gsap.from(root.querySelector('.landing-wards-intro'), {
        scrollTrigger: {
          trigger: root,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        x: -36,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">
      <HeroSection />
      <LiveTicker />
      <CategoryPills />
      <LandingStats />
      
      {/* Featured Section: Top Wards - Broken Symmetry Layout */}
      <section
        ref={wardsSectionRef}
        className="py-32 px-6 relative overflow-hidden bg-brand-navy/5 dark:bg-white/[0.03]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-indigo/[0.07] via-transparent to-neon-cyan/[0.05]" />
        <div className="absolute inset-0 bg-dots [background-size:30px_30px] opacity-40 dark:opacity-10 animate-grid-pan" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-start relative z-10">
          <div className="landing-wards-intro lg:col-span-5 sticky top-32 relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-3xl shadow-glow-lg border border-amber-500/20 backdrop-blur-md">🏆</div>
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] drop-shadow-sm">Performance Index</h3>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter drop-shadow-md">
              Accountability <br />
              <span className="text-neon-cyan underline decoration-brand-indigo/50 decoration-wavy underline-offset-8">by Design.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-medium drop-shadow-sm">
              We monitor resolution speeds and citizen satisfaction across every ward. 
              Real data. Real transparency.
            </p>
            <Link to="/analytics">
              <Button size="xl" variant="outline" className="border-white/20 text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs shadow-inner-glow backdrop-blur-md">
                Explore City Metrics
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-7 space-y-6 pt-12 lg:pt-0 relative z-10">
            {WARDS.slice(0, 4).sort((a, b) => b.slaComplianceRate - a.slaComplianceRate).map((ward, i) => (
              <div
                key={ward.id}
                className={clsx(
                  "landing-ward-card glass-premium p-8 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:shadow-glow-blue hover:border-brand-indigo/50 transition-all duration-500 relative overflow-hidden panel-shine",
                  i % 2 === 0 ? "lg:mr-12" : "lg:ml-12"
                )}
              >
                <div className="absolute inset-0 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />
                <div className="flex items-center gap-8 relative z-10">
                  <span className="text-4xl font-black text-white/20 font-display transition-colors group-hover:text-neon-cyan/40">0{i + 1}</span>
                  <div>
                    <h4 className="text-2xl font-black text-white group-hover:text-neon-cyan transition-colors drop-shadow-sm">{ward.name}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-black flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      {ward.officerCount} Active Responders
                    </p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-4xl font-black text-white font-display leading-none drop-shadow-md">{ward.slaComplianceRate}%</p>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-black mt-2 drop-shadow-sm">SLA Compliance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ActivityFeed />
      <TestimonialCarousel />

      {/* Final CTA - Cinematic Overlay */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-indigo/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center glass-premium p-20 rounded-[3rem] border border-white/10 shadow-glow-lg backdrop-blur-2xl relative overflow-hidden panel-shine group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none drop-shadow-lg relative z-10">Voice your concern, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-brand-indigo">Change your city.</span></h2>
          <p className="text-xl text-slate-300 mb-14 max-w-2xl mx-auto font-medium drop-shadow-sm relative z-10">
            Join thousands of citizens working directly with authorities to build a more responsive and liveable urban future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link to="/register"><Button size="xl" glow className="bg-gradient-to-r from-brand-indigo to-neon-cyan text-white px-12 shadow-glow-blue hover:scale-105 transition-transform border-none">Create Account</Button></Link>
            <Link to="/about"><Button variant="ghost" size="xl" className="text-white hover:bg-white/10 px-10 border border-white/20 backdrop-blur-md uppercase font-black tracking-widest text-xs">Learn the Workflow</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer - Cinematic Identity */}
      <footer className="bg-[#020617] py-24 px-6 border-t border-white/10 relative overflow-hidden panel-shine">
        <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-indigo/50 to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-[1.25rem] bg-brand-indigo/20 flex items-center justify-center text-xl shadow-glow-blue border border-brand-indigo/30 backdrop-blur-md">
                <span className="drop-shadow-md">👁️</span>
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-white drop-shadow-sm">CivicEye</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-10 leading-relaxed font-medium">
              Official transparency and public grievance platform. 
              Empowering citizens, assisting authorities, building futures.
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                <a key={s} href="#" className="text-[10px] font-black text-slate-500 hover:text-neon-cyan uppercase tracking-widest transition-colors drop-shadow-sm">{s}</a>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 drop-shadow-sm">Platform</h5>
            <ul className="space-y-5 text-slate-400 text-sm font-medium">
              <li><Link to="/analytics" className="hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">City Analytics</Link></li>
              <li><Link to="/community" className="hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Community Feed</Link></li>
              <li><Link to="/about" className="hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">How it Works</Link></li>
              <li><Link to="/contact" className="hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all">Support Desk</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 drop-shadow-sm">Legal</h5>
            <ul className="space-y-5 text-slate-400 text-sm font-medium">
              <li><Link to="/privacy" className="hover:text-brand-indigo hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.8)] transition-all">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-indigo hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.8)] transition-all">Terms of Service</Link></li>
              <li><Link to="/accessibility" className="hover:text-brand-indigo hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.8)] transition-all">Accessibility Statement</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest drop-shadow-sm">© 2026 CivicEye. Government of India Initiative.</p>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 shadow-inner-glow backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">System Online • v4.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
