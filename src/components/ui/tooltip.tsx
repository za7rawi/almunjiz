'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: React.ReactNode;
  className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'end-full top-1/2 -translate-y-1/2 me-2',
  right: 'start-full top-1/2 -translate-y-1/2 ms-2',
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent border-4',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent border-4',
  left: 'start-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent border-4',
  right: 'end-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent border-4',
};

export function Tooltip({ content, position = 'top', children, className }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg whitespace-nowrap pointer-events-none',
              positionStyles[position],
            )}
            role="tooltip"
          >
            {content}
            <span className={cn('absolute', arrowStyles[position])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { type TooltipProps, type TooltipPosition };
