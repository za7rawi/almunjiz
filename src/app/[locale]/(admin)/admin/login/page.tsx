'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useLanguageStore } from '@/store/language-store';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const json = await res.json();

      if (json.success && json.data?.user) {
        const role = json.data.user.role?.toLowerCase();
        if (role === 'admin' || role === 'super_admin' || role === 'manager') {
          router.push(`/${locale}/admin`);
        } else {
          setError(isAr ? 'غير مصرح - هذا الحساب ليس حساب مدير' : 'Unauthorized - This account is not an admin account');
          setLoading(false);
        }
      } else {
        setError(json.error || (isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password'));
        setLoading(false);
      }
    } catch {
      setError(isAr ? 'حدث خطأ أثناء الاتصال بالخادم' : 'An error occurred connecting to the server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2580eb]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Logo showText white />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {isAr ? 'لوحة التحكم' : 'Admin Panel'}
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            {isAr ? 'سجّل الدخول للوصول إلى لوحة الإدارة' : 'Sign in to access the admin dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 text-center"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-white/5 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2580eb] focus:ring-1 focus:ring-[#2580eb]/50 transition-colors"
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-white/5 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2580eb] focus:ring-1 focus:ring-[#2580eb]/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#2580eb]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Munjiz Admin Panel &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
