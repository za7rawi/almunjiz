'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', dot: 'w-2.5 h-2.5 border' },
  md: { container: 'w-10 h-10', text: 'text-sm', dot: 'w-3 h-3 border-2' },
  lg: { container: 'w-14 h-14', text: 'text-lg', dot: 'w-3.5 h-3.5 border-2' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', dot: 'w-4 h-4 border-2' },
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

function Avatar({ src, alt = '', name = '', size = 'md', online, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const s = sizeMap[size];
  const showImage = src && !imgError;

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          s.container,
          'rounded-full flex items-center justify-center overflow-hidden',
          'bg-gradient-to-br from-[#2580eb] to-[#7c3aed] text-white font-semibold ring-2 ring-white dark:ring-slate-900',
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={s.text}>{name ? getInitials(name) : '?'}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 rounded-full border-white dark:border-slate-900',
            s.dot,
            online ? 'bg-emerald-500' : 'bg-slate-400',
          )}
          style={{ insetInlineEnd: 0 }}
        />
      )}
    </div>
  );
}

function AvatarGroup({ children, max = 3, className }: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children];
  const visible = items.slice(0, max);
  const remaining = items.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((child, i) => (
        <div key={i} className={cn('relative -me-2 last:me-0')}>
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative -me-2">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps };
