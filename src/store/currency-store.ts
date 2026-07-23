'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyStore {
  currency: 'SAR' | 'USD';
  setCurrency: (c: 'SAR' | 'USD') => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'SAR',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'currency-store' }
  )
);
