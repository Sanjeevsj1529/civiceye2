import React, { useRef, useLayoutEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../ui'
import { ArrowRight, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { gsap } from 'gsap'
import { useAuthStore } from '../../store/authStore'
import { AnimatedCounter, FloatingOrbs, Magnetic } from '../cinematic'

const textContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
}

const textItem = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
  },
}

function CitySilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="ce-city-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ce-window" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <g className="hero-city-layer text-slate-900 dark:text-indigo-200/30">
        <path
          d="M0 200V120h40v80H0zm60-50V80h50v120H60zm80-30V40h70v160h-70zm100 20V100h45v100h-45zm70-60V60h55v140h-55zm90 10V90h40v110h-40zm60-40V20h80v180h-80zm100 5V70h50v130h-50zm80-25V50h60v150h-60zm90 15V85h45v115h-45zm70-35V30h90v170h-90zm110 25V95h55v105h-55zm80-20V55h65v145h-65zm100 8V75h48v125h-48zm80-12V40h72v160h-72z"
          fill="url(#ce-city-grad)"
        />
        {[
          [32, 95, 4, 6],
          [128, 55, 3, 5],
          [248, 35, 4, 4],
          [400, 75, 3, 6],
          [550, 45, 5, 5],
          [720, 25, 4, 7],
          [900, 65, 3, 5],
          [1050, 50, 4, 5],
        ].map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={w * 8}
            height={h * 8}
            fill="url(#ce-window)"
            className="animate-pulse-glow"
            style={{ animationDelay: `${i * 0.25}s` }}
            opacity={0.6}
          />
        ))}
      </g>
    </svg>
  )
}

export function HeroSection() {
  const { user, isAuthenticated } = useAuthStore()
  const dashboardLink = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/citizen'

  const wrapRef = useRef<HTMLElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 40 })

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    setGlow({ x, y })
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-float-card', {
        y: -12,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: { each: 0.6, from: 'random' },
      })
    }, wrapRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={wrapRef}
      onMouseMove={onMouseMove}
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 md:pt-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-95 transition-opacity duration-500 dark:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, rgba(129,140,248,0.22), transparent 55%), radial-gradient(420px circle at ${100 - glow.x}% ${100 - glow.y}%, rgba(34,211,238,0.12), transparent 50%)`,
        }}
      />

      <FloatingOrbs />

      <div
        className={clsx(
          'absolute inset-0 z-[1] bg-grid opacity-[0.25] dark:opacity-[0.14]',
          '[mask-image:linear-gradient(to_bottom,black,transparent)]'
        )}
      />

      <div className="absolute inset-0 z-[1] bg-noise opacity-[0.09] dark:opacity-[0.05]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="text-left lg:col-span-7"
        >
          <motion.div variants={textItem} className="mb-8 inline-flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-slate-600 shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:text-indigo-100/90">
              <Sparkles className="mr-2 inline-block h-3 w-3 text-neon-cyan" />
              Civic neural mesh · Live
            </span>
          </motion.div>

          <motion.h1
            variants={textItem}
            className="font-display text-[clamp(2.75rem,8vw,6rem)] font-black leading-[0.92] tracking-tighter text-slate-950 dark:text-white"
          >
            <span className="block">Better Cities</span>
            <span className="gradient-text-cinematic mt-2 block italic md:mt-3">
              Built Together.
            </span>
          </motion.h1>

          <motion.p
            variants={textItem}
            className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl"
          >
            A collaborative mesh for citizens and authorities — report, trace, and resolve public
            issues with transparency that feels as refined as the infrastructure we protect.
          </motion.p>

          <motion.div variants={textItem} className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Magnetic className="inline-block">
              {!isAuthenticated ? (
                <Link to="/login">
                  <Button
                    size="xl"
                    className="btn-handcrafted relative overflow-hidden border border-white/15 bg-gradient-to-r from-brand-indigo via-indigo-600 to-brand-indigo px-12 text-white shadow-glow-blue ring-2 ring-brand-indigo/30 transition-all hover:brightness-110 dark:from-indigo-500 dark:to-violet-600"
                  >
                    <span className="relative z-10 flex items-center gap-2 font-black tracking-tight">
                      Report an Issue
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 hover:translate-x-full" />
                  </Button>
                </Link>
              ) : (
                <Link to={dashboardLink}>
                  <Button
                    size="xl"
                    className="btn-handcrafted border border-white/15 bg-gradient-to-r from-brand-indigo to-violet-600 px-12 text-white shadow-glow-blue ring-2 ring-brand-indigo/25"
                  >
                    Access Portal
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              )}
            </Magnetic>

            <Link to="/about">
              <motion.span
                whileHover={{ x: 4 }}
                className="group inline-flex cursor-pointer items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-indigo dark:text-slate-400 dark:hover:text-neon-cyan"
              >
                How it works
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1.5"
                />
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            variants={textItem}
            className="mt-16 grid grid-cols-2 gap-10 border-t border-slate-200/80 pt-10 dark:border-white/[0.08] sm:flex sm:items-center sm:gap-14"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-5 shadow-inner backdrop-blur-xl dark:bg-white/[0.04]">
              <p className="font-display text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
                <AnimatedCounter value={12.4} decimals={1} suffix="k" />
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-500">
                Issues Resolved
              </p>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-neon-cyan/20 blur-2xl" />
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-5 shadow-inner backdrop-blur-xl dark:bg-white/[0.04]">
              <p className="font-display text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
                <AnimatedCounter value={98} suffix="%" duration={1.6} />
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-500">
                SLA Compliance
              </p>
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-brand-indigo/25 blur-2xl" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative hidden md:col-span-5 md:block"
        >
          <div className="hero-float-card absolute -left-8 top-8 z-20 max-w-[200px] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-glow-blue backdrop-blur-2xl dark:bg-white/[0.06]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Live throughput
            </p>
            <p className="mt-2 font-display text-2xl font-black text-slate-900 dark:text-white">
              +412 <span className="text-sm font-bold text-neon-cyan">today</span>
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-brand-indigo"
                initial={{ width: '12%' }}
                animate={{ width: '78%' }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              />
            </div>
          </div>

          <div className="hero-float-card absolute -right-4 bottom-12 z-20 max-w-[220px] rounded-2xl border border-white/15 bg-white/10 p-4 shadow-glow-violet backdrop-blur-2xl dark:bg-white/[0.06]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Field mesh
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-emerald-400">
                Stable
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Officers synced across wards with sub-second dispatch telemetry.
            </p>
          </div>

          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.02] p-2 shadow-glow-lg backdrop-blur-xl dark:from-white/[0.08] dark:to-transparent">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo/20 via-transparent to-neon-cyan/10" />
            <img
              src="/hero_image.png"
              alt="CivicEye platform connectivity"
              className="relative z-[1] w-full rounded-[1.35rem] transition-transform duration-700 ease-out hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 z-[2] rounded-[1.35rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]" />
          </div>

          <div className="absolute -bottom-6 left-1/2 z-0 h-[45%] w-[120%] -translate-x-1/2 bg-gradient-to-t from-brand-indigo/25 via-neon-cyan/10 to-transparent blur-3xl" />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] w-full text-slate-900 dark:text-indigo-300/40">
        <CitySilhouette className="hero-city-layer h-auto w-full min-h-[120px] translate-y-1" />
      </div>
    </section>
  )
}
