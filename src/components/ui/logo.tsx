'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  white?: boolean;
  className?: string;
}

const sizeMap = { sm: 32, md: 40, lg: 48, xl: 64 };
const textSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
const subTextSizeMap = { sm: 'text-[9px]', md: 'text-[10px]', lg: 'text-[11px]', xl: 'text-xs' };

export function Logo({ size = 'md', showText = false, white = false, className }: LogoProps) {
  const { language } = useLanguageStore();
  const px = sizeMap[size];

  return (
    <span className={cn('inline-flex items-center gap-2.5 shrink-0', className)}>
      <span className="relative flex items-center justify-center">
        <Image
          src="/logo.jpg"
          alt="المنجز"
          className="relative shrink-0 object-contain drop-shadow-lg"
          style={{ width: px, height: px }}
          width={px}
          height={px}
        />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-extrabold tracking-tight',
              textSizeMap[size],
              white ? 'text-white' : 'text-slate-900'
            )}
          >
            {language === 'ar' ? 'المنجز' : 'AL-MUNJIZ'}
          </span>
          {size !== 'sm' && (
            <span
              className={cn(
                'font-medium tracking-widest uppercase',
                subTextSizeMap[size],
                white ? 'text-white/50' : 'text-slate-400'
              )}
            >
              {language === 'ar' ? 'الخدمات الإلكترونية' : 'ELECTRONIC SERVICES'}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
