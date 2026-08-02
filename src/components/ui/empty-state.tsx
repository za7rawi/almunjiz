'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]',
        compact ? 'px-6 py-10' : 'px-6 py-16',
        className,
      )}
    >
      <div className="relative mb-5">
        <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 blur-lg" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 border border-[#2580eb]/15 flex items-center justify-center">
          <Icon size={26} className="text-[#2580eb]" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
