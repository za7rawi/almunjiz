'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import type { PromoBarData } from '@/lib/storefront-data';

const DISMISS_KEY = 'almunjiz-promo-dismissed';

export function PromoBar({ data }: { data: PromoBarData | null }) {
  const { language } = useLanguageStore();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!data || data.enabled === false || dismissed) return null;

  const text = language === 'ar' ? data.textAr : data.textEn;
  if (!text) return null;

  const content = (
    <span className="inline-flex items-center gap-2.5 text-center text-[13px] sm:text-sm font-medium">
      <Sparkles size={14} className="shrink-0 text-[#14b8a6]" />
      {text}
    </span>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 relative">
          {data.link ? (
            <Link href={data.link} className="block text-white/90 hover:text-white transition-colors">
              {content}
            </Link>
          ) : (
            <div className="text-white/90">{content}</div>
          )}
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              try {
                localStorage.setItem(DISMISS_KEY, '1');
              } catch {}
            }}
            aria-label={language === 'ar' ? 'إغلاق' : 'Dismiss'}
            className="absolute top-1/2 -translate-y-1/2 end-3 p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}