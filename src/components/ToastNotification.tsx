import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, Bell, X, LogOut, ShieldAlert, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'logout' | 'sos';
  duration?: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start justify-between space-x-3 text-white ${
              toast.type === 'logout'
                ? 'bg-slate-900/95 border-amber-500/40 text-amber-200 shadow-amber-500/10'
                : toast.type === 'sos'
                ? 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-600/20'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500/40 text-amber-200'
                : toast.type === 'info'
                ? 'bg-slate-900/95 border-cyan-500/40 text-cyan-200'
                : 'bg-slate-900/95 border-emerald-500/40 text-emerald-200 shadow-emerald-500/10'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-0.5">
                {toast.type === 'logout' && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'sos' && (
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-400 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'success' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'warning' && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-bold tracking-wide">{toast.title}</h4>
                {toast.description && (
                  <p className="text-[11px] opacity-90 font-light leading-snug">{toast.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export function triggerSystemPushNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (err) {
        // Ignored inside iframe sandbox if blocked
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          try {
            new Notification(title, { body, icon: '/favicon.ico' });
          } catch (err) {
            // Ignored
          }
        }
      });
    }
  }
}
