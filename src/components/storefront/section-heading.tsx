'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDirection } from '@/hooks/use-direction';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'start';
  action?: { label: string; href: string };
  className?: string;
  dark?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  action,
  className,
  dark = false,
}: SectionHeadingProps) {
  const { isRtl } = useDirection();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div
      className={cn(
        'flex items-end justify-between gap-4 mb-8 md:mb-10',
        align === 'center' && 'flex-col items-center text-center',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(align === 'center' && 'flex flex-col items-center')}
      >
        <h2
          className={cn(
            'text-2xl md:text-4xl font-extrabold mb-3',
            dark ? 'text-white' : 'text-slate-900 dark:text-white'
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            'w-20 h-1 rounded-full mb-4',
            'bg-gradient-to-r from-[#2580eb] to-[#14b8a6]',
            align === 'center' && 'mx-auto'
          )}
        />
        {subtitle && (
          <p
            className={cn(
              'max-w-2xl mx-auto text-base md:text-lg',
              dark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {subtitle}
          </p>
        )}
      </motion.div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold shrink-0 group',
            dark ? 'text-white hover:text-[#14b8a6]' : 'text-[#2580eb] hover:text-[#14b8a6]'
          )}
        >
          {action.label}
          <Arrow size={16} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}