import React from 'react'
import { clsx } from 'clsx'

export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -top-[20%] -right-[10%] h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-gradient-to-br from-brand-indigo/45 via-neon-violet/25 to-transparent blur-[100px] animate-float-slow" />
      <div className="absolute top-[30%] -left-[15%] h-[min(440px,50vw)] w-[min(440px,50vw)] rounded-full bg-gradient-to-tr from-neon-cyan/30 via-brand-indigo/15 to-transparent blur-[90px] animate-aurora" />
      <div className="absolute bottom-0 right-[25%] h-[min(320px,40vw)] w-[min(320px,40vw)] rounded-full bg-gradient-to-t from-brand-amber/15 via-transparent to-transparent blur-[80px] animate-float" />
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2] bg-dots [background-size:28px_28px] animate-grid-pan" />
    </div>
  )
}
