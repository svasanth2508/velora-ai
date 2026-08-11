import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface HeroMetric {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CinematicHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: string;
  backgroundImageUrl?: string;
  badge?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'lime' | 'amber' | 'cyan' | 'emerald' | 'rose' | 'slate';
  };
  metrics?: HeroMetric[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  overlayGradient?: string;
  heightClass?: string;
  className?: string;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  title,
  subtitle,
  description,
  backgroundImageUrl = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=80',
  badge,
  metrics,
  actions,
  children,
  heightClass = 'min-h-[380px] sm:min-h-[440px]',
  className = '',
}) => {
  const BadgeIcon = badge?.icon || Sparkles;

  const getBadgeStyle = (variant = 'lime') => {
    switch (variant) {
      case 'amber':
        return 'bg-amber-400 text-slate-950 border-amber-300';
      case 'cyan':
        return 'bg-cyan-400 text-slate-950 border-cyan-300';
      case 'emerald':
        return 'bg-emerald-400 text-slate-950 border-emerald-300';
      case 'rose':
        return 'bg-rose-400 text-white border-rose-300';
      case 'slate':
        return 'bg-slate-800 text-slate-200 border-slate-700';
      case 'lime':
      default:
        return 'bg-[#D8F864] text-slate-950 border-emerald-400';
    }
  };

  return (
    <div
      className={`relative w-full rounded-[36px] overflow-hidden bg-slate-950 text-white shadow-2xl border border-slate-800 ${heightClass} flex flex-col justify-between p-6 sm:p-10 ${className}`}
    >
      {/* Background Cover Image with Motion Zoom */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <img
          src={backgroundImageUrl}
          alt="Cinematic Background"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />
        {/* Layered Cinematic Vignette & Gradient Drops */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
      </motion.div>

      {/* Hero Header Top Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${getBadgeStyle(
              badge.variant
            )}`}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </motion.div>
        )}

        {/* Floating Quick Metrics Pill Header */}
        {metrics && metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 sm:space-x-4 bg-slate-900/80 border border-white/15 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg"
          >
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#D8F864]" />}
                  <span className="text-slate-400 font-medium hidden sm:inline">{m.label}:</span>
                  <span className="text-white font-extrabold">{m.value}</span>
                  {idx < metrics.length - 1 && <span className="text-slate-700">|</span>}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Main Hero Content Area */}
      <div className="relative z-10 max-w-3xl space-y-4 my-auto py-6">
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm font-mono text-[#D8F864] uppercase tracking-widest font-extrabold flex items-center space-x-2"
          >
            <span className="w-6 h-0.5 bg-[#D8F864]" />
            <span>{subtitle}</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight drop-shadow-xl"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-medium max-w-2xl drop-shadow"
          >
            {description}
          </motion.p>
        )}

        {/* Action Buttons / Search Inputs */}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-2 flex flex-wrap items-center gap-3"
          >
            {actions}
          </motion.div>
        )}
      </div>

      {/* Embedded Children Slot (e.g. search bars, tab filters, interactive controls) */}
      {children && <div className="relative z-10 pt-2">{children}</div>}
    </div>
  );
};
