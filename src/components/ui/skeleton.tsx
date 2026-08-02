'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-200 dark:bg-white/10',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/30 before:dark:via-white/5 before:to-transparent',
        className,
      )}
      style={style}
    />
  );
}

function SkeletonText({ lines = 3, className }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4 rounded-lg', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

function SkeletonAvatar({ size = 10, className }: SkeletonProps & { size?: number }) {
  return <Skeleton className={cn('rounded-full shrink-0', className)} style={{ width: size, height: size }} />;
}

function SkeletonImage({ className }: SkeletonProps) {
  return <Skeleton className={cn('aspect-video rounded-xl', className)} />;
}

function SkeletonStatGrid({ count = 4, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function SkeletonTableRows({ rows = 5, className }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-white/10 px-5 py-4">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
          <Skeleton className="h-5 w-14 hidden md:block" />
        </div>
      ))}
    </div>
  );
}

function SkeletonList({ items = 4, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-white/10 p-4">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonOrderDetail({ className }: SkeletonProps) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-3', className)}>
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-3">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonStatGrid,
  SkeletonTableRows,
  SkeletonList,
  SkeletonOrderDetail,
  type SkeletonProps,
};

