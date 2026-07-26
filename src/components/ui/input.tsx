'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isPassword?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, iconLeft, iconRight, isPassword, className, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <motion.div
          whileFocus={{ scale: 1.01 }}
          className={cn(
            'relative flex items-center rounded-xl transition-all duration-200',
            'border bg-white dark:bg-white/5',
            error
              ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/30'
              : 'border-slate-200 dark:border-white/10 focus-within:border-[#2580eb] focus-within:ring-2 focus-within:ring-[#2580eb]/30',
          )}
        >
          {iconLeft && (
            <span className="absolute start-3 text-slate-400 pointer-events-none">{iconLeft}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'w-full bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none',
              iconLeft && 'ps-10',
              (iconRight || isPassword) && 'pe-10',
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {!isPassword && iconRight && (
            <span className="absolute end-3 text-slate-400">{iconRight}</span>
          )}
        </motion.div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input, type InputProps };
