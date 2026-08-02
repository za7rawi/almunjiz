'use client';

import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, Info, AlertTriangle, type LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

const toastIcons: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles: Record<ToastType, { icon: string; ring: string }> = {
  success: { icon: 'text-emerald-500', ring: 'ring-emerald-500/20' },
  error: { icon: 'text-red-500', ring: 'ring-red-500/20' },
  info: { icon: 'text-sky-500', ring: 'ring-sky-500/20' },
  warning: { icon: 'text-amber-500', ring: 'ring-amber-500/20' },
};

function createToast(type: ToastType, options: ToastOptions = {}) {
  const { title, description, duration = 4500 } = options;
  const Icon = toastIcons[type];
  const styles = toastStyles[type];

  return sonnerToast.custom((id) => (
    <div className="w-full pointer-events-auto flex items-start gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-900/10 dark:shadow-black/40 px-4 py-3.5">
      <span className={`mt-0.5 shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 ring-1 ${styles.ring} flex items-center justify-center`}>
        <Icon size={17} className={styles.icon} />
      </span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{title}</p>}
        {description && <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => sonnerToast.dismiss(id)}
        aria-label="إغلاق"
        className="shrink-0 mt-0.5 p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  ), { duration });
}

export const toast = {
  success: (options: ToastOptions | string) =>
    createToast('success', typeof options === 'string' ? { title: options } : options),
  error: (options: ToastOptions | string) =>
    createToast('error', typeof options === 'string' ? { title: options } : options),
  info: (options: ToastOptions | string) =>
    createToast('info', typeof options === 'string' ? { title: options } : options),
  warning: (options: ToastOptions | string) =>
    createToast('warning', typeof options === 'string' ? { title: options } : options),
};

export { type ToastOptions, type ToastType };
