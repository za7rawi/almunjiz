'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintPassword, setHintPassword] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { loginAdmin } = useAuthStore();
  const locale = pathname.split('/')[1] || 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = loginAdmin(email, password);
      if (success) {
        router.push(`/${locale}/admin`);
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setLoading(false);
      }
    }, 500);
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
            لوحة التحكم
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            سجّل الدخول للوصول إلى لوحة الإدارة
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
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-white/5 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#2580eb] focus:ring-1 focus:ring-[#2580eb]/50 transition-colors"
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 bg-white/5 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#2580eb] focus:ring-1 focus:ring-[#2580eb]/50 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  تسجيل الدخول
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="w-full text-xs text-slate-500 hover:text-slate-400 transition-colors text-center"
            >
              {showHint ? 'إخفاء بيانات الدخول' : 'عرض بيانات الدخول'}
            </button>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 bg-white/5 rounded-xl p-3 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">البريد:</span>
                  <span className="text-slate-300 font-mono">admin@gmail.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">كلمة المرور:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-mono">
                      {hintPassword ? 'admin123' : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHintPassword(!hintPassword)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {hintPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Munjiz Admin Panel &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
