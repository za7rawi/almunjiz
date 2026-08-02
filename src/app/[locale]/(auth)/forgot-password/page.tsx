'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language-store';

type Step = 'email' | 'verify' | 'success';

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');

  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendable = timer <= 0;
  const timerProgress = timer / 60;

  const maskedEmail = email
    ? email.replace(/(.{3})(.*)(@.*)/, '$1***$3')
    : '***@***.com';

  useEffect(() => {
    if (step === 'verify' && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer, step]);

  useEffect(() => {
    if (step === 'verify') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setDevCode(data.devCode || '');
        setStep('verify');
        setTimer(60);
      } else {
        setError(data.error || (isAr ? 'حدث خطأ أثناء إرسال الرمز. حاول مرة أخرى' : 'An error occurred sending the code. Try again'));
      }
    } catch {
      setError(isAr ? 'حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى' : 'An error occurred connecting to the server. Try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = useCallback(async (code: string) => {
    if (!newPassword || newPassword.length < 8) {
      setError(isAr ? 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' : 'New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    setShakeError(false);

    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setShakeError(true);
        setError(data.error || (isAr ? 'الرمز غير صحيح' : 'Invalid code'));
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
          setShakeError(false);
        }, 100);
      }
    } catch {
      setShakeError(true);
      setError(isAr ? 'حدث خطأ أثناء التحقق. حاول مرة أخرى' : 'An error occurred verifying. Try again');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  }, [email, newPassword, isAr]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1 || (value && !/^\d$/.test(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    setShakeError(false);
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
    if (step === 'verify') {
      const code = otp.join('');
      if (code.length === 6 && !loading) {
        const timeout = setTimeout(() => handleVerifyCode(code), 300);
        return () => clearTimeout(timeout);
      }
    }
  }, [otp, loading, step, handleVerifyCode]);

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        setError('');
        setShakeError(false);
        if (data.devCode) setDevCode(data.devCode);
        inputRefs.current[0]?.focus();
      } else {
        setError(isAr ? 'فشل إعادة إرسال الرمز. حاول مرة أخرى.' : 'Failed to resend code. Try again.');
      }
    } catch {
      setError(isAr ? 'فشل إعادة إرسال الرمز. حاول مرة أخرى.' : 'Failed to resend code. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Step 1: Email */}
      {step === 'email' && (
        <>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] mb-4 shadow-lg shadow-[#2580eb]/30"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <KeyRound className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{isAr ? 'استعادة كلمة المرور الخاصة بحسابك' : 'Reset Your Password'}</h2>
            <p className="text-white/50 text-sm">{isAr ? 'أدخل بريدك الإلكتروني، وسنرسل إليك رابطًا آمنًا لإعادة تعيين كلمة المرور.' : 'Enter your email and we will send you a secure link to reset your password.'}</p>
          </motion.div>

          <form onSubmit={handleRequestCode} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
              <div className="relative group">
                <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full pr-10 pl-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20 transition-all"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                iconLeft={!loading ? <ArrowRight size={18} /> : undefined}
                className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 hover:shadow-2xl hover:shadow-[#2580eb]/30 transition-all duration-300"
              >
                {isAr ? 'إرسال رمز التحقق' : 'Send Verification Code'}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <Link href="/login" className="text-sm text-[#2580eb] hover:text-[#2580eb]/80 transition-colors">
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
              </Link>
            </motion.div>
          </form>
        </>
      )}

      {/* Step 2: Verification Code + New Password */}
      {step === 'verify' && (
        <>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] mb-4 shadow-lg shadow-[#2580eb]/30"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{isAr ? 'تعيين كلمة مرور جديدة' : 'Set a New Password'}</h2>
            <p className="text-white/50 text-sm mb-3">{isAr ? 'أدخل رمز التحقق الذي أرسلناه إلى بريدك الإلكتروني ثم حدّد كلمة مرورك الجديدة.' : 'Enter the verification code we sent to your email, then set your new password.'}</p>
            <div className="flex items-center justify-center gap-2">
              <Mail size={16} className="text-[#14b8a6]" />
              <p className="text-white font-semibold text-base tracking-wider" dir="ltr">{maskedEmail}</p>
            </div>
          </motion.div>

          <div className="space-y-5">
            {devCode && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-center">
                <p className="text-xs text-[#14b8a6] mb-1">{isAr ? 'رمز التحقق للتجربة' : 'Test verification code'}</p>
                <p className="text-2xl font-bold text-white tracking-[0.3em] font-mono" dir="ltr">{devCode}</p>
                <p className="text-[10px] text-white/30 mt-1">{isAr ? 'هذا الرمز يظهر في وضع التطوير فقط' : 'This code is shown in development mode only'}</p>
              </motion.div>
            )}

            {/* Verification Code Inputs */}
            <motion.div variants={shakeError ? shakeVariants : undefined} animate={shakeError ? 'shake' : undefined} className="flex justify-center gap-2.5 sm:gap-3">
              {otp.map((digit, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}>
                  <input
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold text-white bg-white/[0.05] border rounded-xl focus:outline-none transition-all duration-300 disabled:opacity-50 ${
                      error ? 'border-red-500/50 bg-red-500/10' : digit ? 'border-[#2580eb]/50 bg-[#2580eb]/5 shadow-lg shadow-[#2580eb]/10' : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
                    }`}
                  />
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Password Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
              <div className="relative group">
                <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={`w-full pr-10 pl-12 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                    newPassword && newPassword.length < 8
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-white/40 mt-1.5">{isAr ? 'يجب أن تكون 8 أحرف على الأقل' : 'Must be at least 8 characters'}</p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={() => handleVerifyCode(otp.join(''))}
                iconLeft={!loading ? <ArrowRight size={18} className="rtl:rotate-180" /> : undefined}
                disabled={otp.join('').length < 6 || !newPassword || newPassword.length < 8 || loading}
                className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 disabled:opacity-40 disabled:shadow-none transition-all duration-300"
              >
                {isAr ? 'تعيين كلمة المرور' : 'Set New Password'}
              </Button>
            </motion.div>
          </div>

          {/* Resend Timer / Button */}
          <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center gap-4">
            {!resendable ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <CircularProgress progress={timerProgress} size={48} strokeWidth={3} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{timer}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/40">{isAr ? 'إعادة الإرسال بعد' : 'Resend in'}</p>
                  <p className="text-xs text-white/40">{timer} {isAr ? 'ثانية' : 'seconds'}</p>
                </div>
              </div>
            ) : (
              <motion.button onClick={handleResend} disabled={resending} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2580eb]/10 border border-[#2580eb]/20 text-[#2580eb] text-sm font-semibold hover:bg-[#2580eb]/15 transition-all duration-200 disabled:opacity-50">
                {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                {isAr ? 'إعادة إرسال الرمز' : 'Resend Code'}
              </motion.button>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <button
              onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']); setNewPassword(''); }}
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              {isAr ? 'تغيير البريد الإلكتروني' : 'Change email'}
              <ArrowLeft size={14} className="rtl:rotate-180" />
            </button>
          </motion.div>
        </>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 shadow-lg shadow-emerald-500/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}>
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-2xl md:text-3xl font-bold text-white mb-2">{isAr ? 'تمت العملية بنجاح' : 'Operation Completed Successfully'}</motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/50 text-sm mb-6">{isAr ? 'تم تنفيذ طلبك بنجاح، ويمكنك الآن المتابعة داخل منصة المنجز.' : 'Your request was completed successfully. You can now continue inside the AL-MUNJIZ platform.'}</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push('/login')}
                iconLeft={<ArrowRight size={18} />}
                className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 transition-all duration-300"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </Button>
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
