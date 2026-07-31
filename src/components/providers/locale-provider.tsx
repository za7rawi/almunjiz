'use client';

import { useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/language-store';

export function LocaleProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const initialized = useRef(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    if (!initialized.current) {
      initialized.current = true;
      setLanguage(locale === 'ar' ? 'ar' : 'en');
    }
  }, [locale, setLanguage]);

  return <>{children}</>;
}
