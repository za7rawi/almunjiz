'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  gradient?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  gradient = false,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'mb-8',
        gradient &&
          '-mx-4 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-gradient-to-br from-[#2580eb]/5 via-transparent to-[#7c3aed]/5 rounded-2xl',
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-3">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronLeft size={14} className="text-slate-300 dark:text-slate-600 rtl:rotate-180" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#2580eb] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 dark:text-white font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </motion.div>
  );
}

export { type PageHeaderProps, type Breadcrumb };
