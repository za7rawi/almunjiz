'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ProgressColor = 'blue' | 'turquoise' | 'purple' | 'green' | 'red';
type ProgressHeight = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  height?: ProgressHeight;
  showLabel?: boolean;
  className?: string;
}

const gradientStyles: Record<ProgressColor, string> = {
  blue: 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6]',
  turquoise: 'bg-gradient-to-r from-[#14b8a6] to-[#2580eb]',
  purple: 'bg-gradient-to-r from-[#7c3aed] to-[#2580eb]',
  green: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  red: 'bg-gradient-to-r from-red-500 to-rose-500',
};

const heightStyles: Record<ProgressHeight, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function Progress({
  value,
  max = 100,
  color = 'blue',
  height = 'md',
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden', heightStyles[height])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
          className={cn('h-full rounded-full', gradientStyles[color])}
        />
      </div>
    </div>
  );
}

export { type ProgressProps, type ProgressColor, type ProgressHeight };
