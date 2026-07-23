'use client';

import { useLanguageStore } from '../store/language-store';

export function useDirection() {
  const language = useLanguageStore((s) => s.language);
  return {
    dir: (language === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    isRtl: language === 'ar',
  };
}
