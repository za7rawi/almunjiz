'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/services';
  const isExpired = searchParams.get('expired') === '1';
  const { loginEmail } = useAuthStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (val: string) => {
    if (!val) return isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return isAr ? 'كلمة المرور مطلوبة' : 'Password is required';
    if (val.length < 6) return isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    return '';
  };

  const handleOtpSubmit = async () => {
    const emailErr = validateEmail(email);
    setErrors(emailErr ? { email: emailErr } : {});
    setTouched({ email: true });
    if (emailErr) return;

    setOtpLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('otp_identifier', email);
        sessionStorage.setItem('otp_type', 'email');
        if (data.devCode) sessionStorage.setItem('otp_dev_code', data.devCode);
        router.push(`/otp?redirect=${encodeURIComponent(redirectTo)}`);
      } else {
        setErrors({ general: data.error || data.message || (isAr ? 'فشل إرسال رمز التحقق' : 'Failed to send verification code') });
      }
    } catch {
      setErrors({ general: isAr ? 'حدث خطأ أثناء إرسال الرمز' : 'An error occurred sending the code' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });
    if (emailErr || passErr) return;

    setLoading(true);
    const result = await loginEmail(email, password);
    if (result.success) {
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setErrors({ general: isAr ? 'تعذر إتمام تسجيل الدخول. يرجى المحاولة مرة أخرى' : 'Unable to complete the sign-in. Please try again' });
        useAuthStore.setState({ user: null, isAuthenticated: false });
        setLoading(false);
        return;
      }
      window.location.href = result.redirect === '/admin' ? '/admin' : redirectTo;
    } else {
      setErrors({ general: result.message });
    }
    setLoading(false);
  };

  const getFieldError = (field: string) => (touched[field] ? errors[field] : undefined);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{isAr ? 'مرحبًا بعودتك' : 'Welcome Back'}</h2>
        <p className="text-white/50 text-sm">{isAr ? 'سجّل الدخول للوصول إلى جميع خدمات منصة المنجز ومتابعة طلباتك بكل سهولة.' : 'Sign in to access all AL-MUNJIZ services and easily track your orders.'}</p>
      </motion.div>

      <AnimatePresence>
        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">{isAr ? 'انتهت جلستك لأسباب أمنية. يرجى تسجيل الدخول مرة أخرى للمتابعة.' : 'Your session has expired for security reasons. Please sign in again to continue.'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{errors.general}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email input */}
      <motion.div variants={itemVariants} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
          <div className="relative group">
            <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                }
              }}
              onBlur={() => {
                setTouched((p) => ({ ...p, email: true }));
                setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
              }}
              placeholder="example@email.com"
              dir="ltr"
              className={`w-full pr-10 pl-10 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('email')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : email && !getFieldError('email')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            {email && !getFieldError('email') && (
              <CheckCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            )}
          </div>
          <AnimatePresence>
            {getFieldError('email') && (
              <motion.p
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="flex items-center gap-1.5 text-xs text-red-400 mt-2"
              >
                <AlertCircle size={12} />
                {getFieldError('email')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {mode === 'password' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'كلمة المرور' : 'Password'}</label>
            <div className="relative group">
              <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                  }
                }}
                onBlur={() => {
                  setTouched((p) => ({ ...p, password: true }));
                  setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
                }}
                placeholder="••••••••"
                className={`w-full pr-10 pl-12 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                  getFieldError('password')
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
                }`}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </motion.button>
            </div>
            <AnimatePresence>
              {getFieldError('password') && (
                <motion.p
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  className="flex items-center gap-1.5 text-xs text-red-400 mt-2"
                >
                  <AlertCircle size={12} />
                  {getFieldError('password')}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div variants={itemVariants} className="mt-5">
        {mode === 'otp' ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            loading={otpLoading}
            onClick={handleOtpSubmit}
            iconLeft={!otpLoading ? <KeyRound size={18} /> : undefined}
            className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 hover:shadow-2xl hover:shadow-[#2580eb]/30 transition-all duration-300"
          >
            {isAr ? 'إرسال رمز التحقق' : 'Send Verification Code'}
          </Button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              iconLeft={!loading ? <LogIn size={18} /> : undefined}
              className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 hover:shadow-2xl hover:shadow-[#2580eb]/30 transition-all duration-300"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </form>
        )}
      </motion.div>

      {/* Google Sign In */}
      <motion.div variants={itemVariants} className="mt-5">
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0a0e27] text-white/40">{isAr ? 'أو' : 'or'}</span>
          </div>
        </div>
        <GoogleSignInButton mode="signin" />
      </motion.div>

      {/* Toggle OTP / Password */}
      <motion.div variants={itemVariants} className="mt-3 text-center">
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'otp' ? 'password' : 'otp');
            setErrors({});
            setPassword('');
          }}
          className="text-xs text-white/40 hover:text-[#14b8a6] transition-colors"
        >
          {mode === 'otp' ? (isAr ? 'تسجيل الدخول بكلمة المرور' : 'Sign in with password') : (isAr ? 'تسجيل الدخول برمز التحقق' : 'Sign in with code')}
        </button>
      </motion.div>

      {/* Register link */}
      <motion.div variants={itemVariants} className="mt-6 text-center">
        <p className="text-sm text-white/40">
          {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
          <Link href="/register" className="text-[#2580eb] hover:text-[#2580eb]/80 font-semibold transition-colors">
            {isAr ? 'أنشئ حساباً جديداً' : 'Create new account'}
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
