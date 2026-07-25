'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('otp_identifier', email);
        if (data.data?.code) {
          sessionStorage.setItem('otp_dev_code', data.data.code);
        }
        router.push('/otp');
      } else {
        setError(data.message || 'حدث خطأ أثناء إرسال الرمز. حاول مرة أخرى');
      }
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">نسيت كلمة المرور؟</h2>
          <p className="text-white/50 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-2xl p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="example@email.com"
                dir="ltr"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20 transition-all"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            iconLeft={!loading ? <ArrowRight size={18} /> : undefined}
            className="py-4 text-base font-bold rounded-2xl"
          >
            إرسال رمز التحقق
          </Button>
          <div className="text-center">
            <Link href="/login" className="text-sm text-[#2580eb] hover:text-[#2580eb]/80 transition-colors">
              العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
