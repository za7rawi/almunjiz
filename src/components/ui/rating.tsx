'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: number;
  readonly?: boolean;
  className?: string;
}

export function Rating({
  value = 0,
  onChange,
  max = 5,
  size = 22,
  readonly = false,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating === value ? 0 : rating);
    }
  };

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={() => !readonly && setHoverValue(null)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const rating = i + 1;
        const filled = rating <= displayValue;
        const halfFilled = !filled && rating - 0.5 <= displayValue;

        return (
          <motion.button
            key={i}
            type="button"
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.2 } : undefined}
            whileTap={!readonly ? { scale: 0.9 } : undefined}
            onMouseEnter={() => !readonly && setHoverValue(rating)}
            onClick={() => handleClick(rating)}
            className={cn(
              'relative transition-colors disabled:cursor-default',
              filled || halfFilled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600',
              !readonly && 'cursor-pointer',
            )}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.5} />
            {halfFilled && (
              <Star
                size={size}
                fill="currentColor"
                strokeWidth={1.5}
                className="absolute inset-0"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export { type RatingProps };
