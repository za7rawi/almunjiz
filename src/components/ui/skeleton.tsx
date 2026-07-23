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

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonImage, type SkeletonProps };
