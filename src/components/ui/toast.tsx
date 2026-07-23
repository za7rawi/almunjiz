'use client';

import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const toastColors: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-200 dark:border-sky-500/20',
    text: 'text-sky-700 dark:text-sky-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
};

function createToast(type: ToastType, options: ToastOptions = {}) {
  const { title, description, duration = 4000 } = options;
  const colors = toastColors[type];

  return sonnerToast[type](title || '', {
    description,
    duration,
    className: cn(
      'border',
      colors.bg,
      colors.border,
    ),
    descriptionClassName: cn('text-sm', colors.text),
  });
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
