'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  trend?: { value: number; isUp: boolean };
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

export function StatCard({
  icon,
  value,
  label,
  trend,
  prefix = '',
  suffix = '',
  duration = 1200,
  className,
}: StatCardProps) {
  const animatedValue = useCountUp(value, duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative p-5 rounded-2xl bg-white dark:bg-slate-900/50',
        'border border-slate-200 dark:border-white/10',
        'shadow-sm hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-shadow duration-300',
        'overflow-hidden',
        className,
      )}
    >
      <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-[#2580eb] to-[#14b8a6] rounded-s-2xl" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-[#2580eb]/10 text-[#2580eb]">{icon}</div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
              trend.isUp
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400',
            )}
          >
            {trend.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}%
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { type StatCardProps };
