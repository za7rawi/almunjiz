'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === 'ar' ? 'en' : 'ar',
        })),
    }),
    {
      name: 'almunjiz-language',
    }
  )
);
