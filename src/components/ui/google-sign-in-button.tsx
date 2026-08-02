'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useLanguageStore } from '@/store/language-store';
import { Loader2 } from 'lucide-react';

const GoogleSvg = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export function GoogleSignInButton({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [loading, setLoading] = useState(false);
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const label = mode === 'signin'
    ? (isAr ? 'تسجيل الدخول بواسطة Google' : 'Sign in with Google')
    : (isAr ? 'التسجيل بواسطة Google' : 'Sign up with Google');

  return (
    <motion.button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn('google', { callbackUrl: '/services' });
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl
        bg-white hover:bg-gray-50 active:bg-gray-100
        text-slate-800 font-semibold text-sm
        border border-slate-200/60 shadow-lg shadow-black/5
        hover:shadow-xl hover:shadow-black/10 hover:border-slate-300/60
        active:shadow-md
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2580eb]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900
        transition-all duration-200
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg
      `}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin text-slate-400" />
      ) : (
        <GoogleSvg />
      )}
      <span className={loading ? 'text-slate-400' : ''}>{loading ? (isAr ? 'جاري الاتصال بـ Google...' : 'Connecting to Google...') : label}</span>
    </motion.button>
  );
}
