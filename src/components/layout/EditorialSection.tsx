import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Quote } from 'lucide-react';

export interface EditorialSectionProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  eyebrow?: string;
  accentColor?: 'lime' | 'amber' | 'cyan' | 'emerald' | 'indigo' | 'rose';
  quoteCallout?: {
    quote: string;
    author?: string;
    role?: string;
  };
  sideContent?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const EditorialSection: React.FC<EditorialSectionProps> = ({
  title,
  subtitle,
  eyebrow,
  accentColor = 'lime',
  quoteCallout,
  sideContent,
  actions,
  children,
  className = '',
  containerClassName = 'bg-white rounded-[32px] border border-slate-200/80 shadow-sm p-6 sm:p-8',
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'amber':
        return 'border-amber-400 bg-amber-400';
      case 'cyan':
        return 'border-cyan-400 bg-cyan-400';
      case 'emerald':
        return 'border-emerald-400 bg-emerald-400';
      case 'indigo':
        return 'border-indigo-400 bg-indigo-400';
      case 'rose':
        return 'border-rose-400 bg-rose-400';
      case 'lime':
      default:
        return 'border-[#D8F864] bg-[#D8F864]';
    }
  };

  return (
    <section className={`w-full space-y-6 ${className}`}>
      <div className={containerClassName}>
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5 max-w-3xl">
            {eyebrow && (
              <div className="flex items-center space-x-2 text-xs font-mono font-black uppercase tracking-widest text-slate-500">
                <span className={`w-3 h-3 rounded-full ${getAccentBorder()}`} />
                <span>{eyebrow}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>

            {subtitle && (
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div className="flex items-center space-x-2 shrink-0">{actions}</div>}
        </div>

        {/* Layout Grid with optional Quote or Side Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          {/* Main Content Area */}
          <div className={`${quoteCallout || sideContent ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
            {children}
          </div>

          {/* Side Editorial Callout Column */}
          {(quoteCallout || sideContent) && (
            <div className="lg:col-span-4 space-y-4">
              {quoteCallout && (
                <div className="bg-slate-900 text-white rounded-[28px] p-6 relative overflow-hidden shadow-xl border border-slate-800 space-y-4">
                  <Quote className="w-8 h-8 text-[#D8F864]/40 absolute top-4 right-4" />
                  <p className="text-sm font-serif italic text-slate-200 leading-relaxed relative z-10">
                    "{quoteCallout.quote}"
                  </p>
                  {quoteCallout.author && (
                    <div className="pt-2 border-t border-slate-800 text-xs font-bold text-amber-300">
                      <div>— {quoteCallout.author}</div>
                      {quoteCallout.role && (
                        <div className="text-[10px] text-slate-400 font-normal">{quoteCallout.role}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {sideContent}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
