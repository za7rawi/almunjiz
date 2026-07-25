'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Shield,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const shakeVariants = {
  shake: {
    x: [0, -12, 12, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

function CircularProgress({ progress, size = 56, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#timerGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2580eb" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendable = timer <= 0;
  const timerProgress = timer / 60;

  const identifier = typeof window !== 'undefined' ? sessionStorage.getItem('otp_identifier') || '' : '';
  const devCode = typeof window !== 'undefined' ? sessionStorage.getItem('otp_dev_code') || '' : '';

  const maskedEmail = identifier
    ? identifier.replace(/(.{3})(.*)(@.*)/, '$1***$3')
    : '***@***.com';

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleVerify = useCallback(async (code: string) => {
    setLoading(true);
    setError(false);
    setErrorMsg('');

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, code }),
      });

      const data = await res.json();

      if (data.success) {
        setVerified(true);
        login(data.data.user);
        sessionStorage.removeItem('otp_identifier');
        sessionStorage.removeItem('otp_type');
        sessionStorage.removeItem('otp_dev_code');
        setTimeout(() => router.push(redirectTo), 1500);
      } else {
        setError(true);
        setErrorMsg(data.message || 'الرمز غير صحيح');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError(true);
      setErrorMsg('حدث خطأ أثناء التحقق. حاول مرة أخرى');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  }, [identifier, router, login, redirectTo]);

  const handleChange = useCallback((index: number, value: string) => {
    if (value.length > 1 || (value && !/^\d$/.test(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);
    setErrorMsg('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }, [otp]);

  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !loading && !verified) {
      const timeout = setTimeout(() => handleVerify(code), 300);
      return () => clearTimeout(timeout);
    }
  }, [otp, loading, verified, handleVerify]);

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier }),
      });
      const data = await res.json();
      if (data.success) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        setError(false);
        setErrorMsg('');
        inputRefs.current[0]?.focus();
      } else {
        setErrorMsg('فشل إعادة إرسال الرمز. حاول مرة أخرى.');
      }
    } catch {
      setErrorMsg('فشل إعادة إرسال الرمز. حاول مرة أخرى.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] mb-4 shadow-lg shadow-[#2580eb]/30"
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">التحقق من الرمز</h2>
        <p className="text-white/50 text-sm mb-3">أدخل الرمز المكون من 6 أرقام المرسل إلى</p>
        <div className="flex items-center justify-center gap-2">
          <Mail size={16} className="text-[#14b8a6]" />
          <p className="text-white font-semibold text-base tracking-wider" dir="ltr">{maskedEmail}</p>
        </div>
      </motion.div>

      {devCode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-center"
        >
          <p className="text-xs text-[#14b8a6] mb-1">رمز التحقق للتجربة</p>
          <p className="text-2xl font-bold text-white tracking-[0.3em] font-mono" dir="ltr">{devCode}</p>
          <p className="text-[10px] text-white/30 mt-1">هذا الرمز يظهر في وضع التطوير فقط</p>
        </motion.div>
      )}

      <motion.div variants={error ? shakeVariants : undefined} animate={error ? 'shake' : undefined} className="flex justify-center gap-2.5 sm:gap-3 mb-8">
        {otp.map((digit, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}>
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={loading || verified}
              className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold text-white bg-white/[0.05] border rounded-xl focus:outline-none transition-all duration-300 disabled:opacity-50 ${
                verified ? 'border-emerald-500/50 bg-emerald-500/10' : error ? 'border-red-500/50 bg-red-500/10' : digit ? 'border-[#2580eb]/50 bg-[#2580eb]/5 shadow-lg shadow-[#2580eb]/10' : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {error && errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {verified && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }} className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white font-semibold text-lg">تم التحقق بنجاح!</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-white/50 text-sm mt-1">جاري التحويل إلى لوحة التحكم...</motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {!verified && (
        <motion.div variants={itemVariants}>
          <Button variant="primary" size="lg" fullWidth loading={loading} onClick={() => handleVerify(otp.join(''))} iconLeft={!loading ? <ArrowRight size={18} className="rtl:rotate-180" /> : undefined} disabled={otp.join('').length < 6 || loading} className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 disabled:opacity-40 disabled:shadow-none transition-all duration-300">
            تحقق
          </Button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4">
        {!resendable ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <CircularProgress progress={timerProgress} size={48} strokeWidth={3} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{timer}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/40">إعادة الإرسال بعد</p>
              <p className="text-xs text-white/25">{timer} ثانية</p>
            </div>
          </div>
        ) : (
          <motion.button onClick={handleResend} disabled={resending} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2580eb]/10 border border-[#2580eb]/20 text-[#2580eb] text-sm font-semibold hover:bg-[#2580eb]/15 transition-all duration-200 disabled:opacity-50">
            {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            إعادة إرسال الرمز
          </motion.button>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
          العودة لتسجيل الدخول
          <ArrowLeft size={14} className="rtl:rotate-180" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
