'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25 hover:shadow-xl hover:shadow-[#2580eb]/30',
  secondary:
    'border-2 border-[#2580eb]/30 text-[#2580eb] bg-transparent hover:bg-[#2580eb]/5 backdrop-blur-sm',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3 text-base rounded-xl gap-2.5',
  xl: 'px-9 py-4 text-lg rounded-2xl gap-3',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconLeft,
      iconRight,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none',
          'focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'xl' ? 22 : 18} />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
