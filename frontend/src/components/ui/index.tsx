import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  glow?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, glow, leftIcon, rightIcon, children, ...props }, ref) => {
    const variants = {
      primary: cn(
        'bg-gradient-to-r from-brand-indigo via-[#6366f1] to-[#4338ca] text-white',
        'border border-white/20 shadow-[0_0_20px_rgba(79,70,229,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]',
        'hover:shadow-[0_0_40px_rgba(79,70,229,0.8),inset_0_1px_0_rgba(255,255,255,0.5)]',
        'ring-1 ring-white/10'
      ),
      secondary: cn(
        'bg-white/80 text-slate-900 border border-slate-200/90 backdrop-blur-md',
        'hover:bg-white dark:bg-[#020617]/60 dark:text-white dark:border-white/10 dark:hover:bg-[#020617]/80',
        'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_20px_-5px_rgba(0,0,0,0.5)]'
      ),
      outline: cn(
        'border border-slate-300/80 text-slate-900 backdrop-blur-sm',
        'hover:bg-slate-50 hover:border-brand-indigo/30',
        'dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:border-neon-cyan/40 dark:hover:text-white'
      ),
      ghost: cn(
        'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
        'dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white'
      ),
      danger: cn(
        'bg-gradient-to-r from-rose-600 to-rose-500 text-white border border-rose-400/30 shadow-glow-rose',
        'hover:shadow-[0_0_30px_rgba(244,63,94,0.7)]'
      ),
    };
    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-xl',
      md: 'px-6 py-3 text-sm rounded-2xl',
      lg: 'px-8 py-4 text-base rounded-[1.25rem]',
      xl: 'px-10 py-5 text-lg font-bold rounded-[1.5rem]',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.95, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2.5 font-bold tracking-wide transition-[box-shadow,filter] duration-300 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
          variants[variant],
          sizes[size],
          glow && 'shadow-[0_0_40px_rgba(79,70,229,0.6)] ring-2 ring-brand-indigo/30 ring-offset-2 ring-offset-[#020617]',
          className
        )}
        {...props}
      >
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 to-transparent opacity-50" />
        {isLoading && (
          <span className="relative z-[1] h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {!isLoading && leftIcon && <span className="relative z-[1] drop-shadow-md">{leftIcon}</span>}
        <span className="relative z-[1] drop-shadow-md">{children as React.ReactNode}</span>
        {!isLoading && rightIcon && <span className="relative z-[1] drop-shadow-md">{rightIcon}</span>}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export const Card = ({
  children,
  className,
  hover = true,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) => (
  <motion.div
    whileHover={
      hover
        ? {
            y: -8,
            transition: { type: 'spring', stiffness: 350, damping: 25 },
          }
        : undefined
    }
    onClick={onClick}
    className={cn(
      'glass-premium panel-shine p-8',
      hover && 'hover:border-white/20 hover:shadow-glow-lg cursor-default',
      onClick && 'cursor-pointer',
      className
    )}
  >
    <motion.div
      className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-brand-indigo/15 blur-[60px]"
      animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-neon-cyan/15 blur-[60px]"
      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
    <motion.div className="relative z-10">{children}</motion.div>
  </motion.div>
);

export const Badge = ({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}) => {
  const styles = {
    default: 'bg-slate-200/90 text-slate-800 border border-slate-300/50 dark:bg-white/[0.04] dark:text-slate-300 dark:border-white/10',
    success: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)] dark:text-amber-400',
    error: 'bg-rose-500/15 text-rose-700 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)] dark:text-rose-400',
    info: 'bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 shadow-[0_0_15px_rgba(79,70,229,0.3)] dark:text-neon-cyan',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-md',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const Avatar = ({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) => {
  const sizes = { 
    sm: 'w-10 h-10 text-xs', 
    md: 'w-12 h-12 text-sm', 
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl'
  };
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-[#4f46e5] via-[#8b5cf6] to-[#06b6d4] font-black text-white shadow-glow-blue border border-white/20',
        sizes[size],
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <span className="pointer-events-none absolute inset-0 box-shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] rounded-[inherit]" />
      {src ? (
        <img src={src} alt={name} className="relative z-10 h-full w-full object-cover" />
      ) : (
        <span className="relative z-10 drop-shadow-md">{initials}</span>
      )}
    </motion.div>
  );
};

export const StatCard = ({
  label,
  value,
  icon,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  trend?: number;
  color?: string;
}) => (
  <Card
    className={cn(
      'border-white/10 bg-white/70 dark:bg-[#0a0f25]/60 overflow-hidden relative group',
      color
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <motion.div
      className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-indigo/15 blur-[40px] group-hover:bg-brand-indigo/25 transition-colors duration-500"
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
      transition={{ duration: 5, repeat: Infinity }}
    />
    <motion.div
      className="relative z-[1] flex flex-col gap-2"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="flex items-start justify-between"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-white/10 border border-white/10 backdrop-blur-md shadow-inner-glow">
          <span className="text-2xl drop-shadow-lg">{icon}</span>
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'rounded-xl px-2.5 py-1.5 text-[10px] font-black backdrop-blur-md shadow-lg',
              trend >= 0
                ? 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400'
                : 'bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30 dark:text-rose-400'
            )}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </motion.div>
      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 drop-shadow-sm">
          {label}
        </p>
        <h3 className="mt-1 font-display text-4xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-md">
          {value}
        </h3>
      </div>
    </motion.div>
  </Card>
);

export const ProgressBar = ({
  value,
  max = 100,
  color = 'bg-gradient-to-r from-[#4f46e5] via-[#8b5cf6] to-[#06b6d4]',
  showLabel,
}: {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}) => {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      {showLabel && (
        <motion.div
          className="mb-3 flex justify-between text-[10px] font-black uppercase tracking-[0.2em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-slate-500">Progress</span>
          <span className="text-slate-900 dark:text-white drop-shadow-md">{Math.round(percent)}%</span>
        </motion.div>
      )}
      <motion.div
        className="h-3 overflow-hidden rounded-full border border-white/5 bg-slate-200/50 shadow-inner dark:bg-[#020617]/50 backdrop-blur-sm relative"
        initial={{ opacity: 0, scaleX: 0.95 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay z-10 pointer-events-none" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn('relative h-full rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]', color)}
        >
          <span className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-[1.5rem] bg-slate-200/80 dark:bg-white/[0.04] border border-white/5',
      className
    )}
  >
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);
