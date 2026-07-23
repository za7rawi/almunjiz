'use client';

import { useCurrencyStore } from '@/store/currency-store';

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrencyStore();
  return (
    <div className="flex items-center bg-white/10 rounded-xl border border-white/10 p-0.5">
      <button
        onClick={() => setCurrency('SAR')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
          currency === 'SAR' ? 'bg-[#2580eb] text-white' : 'text-white/50'
        }`}
      >
        ر.س
      </button>
      <button
        onClick={() => setCurrency('USD')}
        className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
          currency === 'USD' ? 'bg-[#2580eb] text-white' : 'text-white/50'
        }`}
      >
        USD
      </button>
    </div>
  );
}
