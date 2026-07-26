'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void
          ) => void;
        };
      };
    };
  }
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

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
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { loginEmail, loginWithGoogle } = useAuthStore();

  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      setGoogleLoading(true);
      try {
        const result = await loginWithGoogle({
          idToken: response.credential,
          name: '',
          email: '',
        });
        if (result.success) {
          const signInResult = await signIn('credentials', {
            email: result.email,
            password: result.token,
            redirect: false,
          });
          if (signInResult?.error) {
            setErrors({ general: 'فشل إنشاء جلسة تسجيل الدخول. يرجى المحاولة مرة أخرى' });
            useAuthStore.setState({ user: null, isAuthenticated: false });
            return;
          }
          router.push(result.redirect === '/admin' ? '/admin' : redirectTo);
        } else {
          setErrors({ general: result.message || 'فشل تسجيل الدخول بـ Google' });
        }
      } catch {
        setErrors({ general: 'حدث خطأ أثناء التواصل مع Google' });
      }
      setGoogleLoading(false);
    },
    [loginWithGoogle, router, redirectTo]
  );

  useEffect(() => {
    const googleEmail = searchParams.get('googleEmail');
    const googleToken = searchParams.get('googleToken');
    if (googleEmail && googleToken) {
      setGoogleLoading(true);
      (async () => {
        try {
          const signInResult = await signIn('credentials', {
            email: googleEmail,
            password: googleToken,
            redirect: false,
          });
          if (signInResult?.error) {
            setErrors({ general: 'فشل إنشاء جلسة تسجيل الدخول بـ Google' });
            return;
          }
          const redir = searchParams.get('redirect') || '/dashboard';
          router.push(redir);
        } catch {
          setErrors({ general: 'حدث خطأ أثناء تسجيل الدخول بـ Google' });
        } finally {
          setGoogleLoading(false);
        }
      })();
    }

    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        google_denied: 'تم إلغاء تسجيل الدخول بـ Google',
        google_token: 'فشل التحقق من Google. يرجى المحاولة مرة أخرى',
        google_profile: 'لم يتم استلام بيانات الملف الشخصي من Google',
        google_config: 'تسجيل الدخول بـ Google غير مُعد حالياً',
        google_error: 'حدث خطأ أثناء تسجيل الدخول بـ Google',
      };
      setErrors({ general: errorMessages[errorParam] || 'حدث خطأ غير متوقع' });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCredentialResponse,
        });
      }
    };
    document.head.appendChild(script);
    return () => {
      const s = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (s) s.remove();
    };
  }, [handleGoogleCredentialResponse]);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrors({});
    if (window.google) {
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          setGoogleLoading(false);
          window.location.href = `/api/auth/google/redirect?redirect=${encodeURIComponent(redirectTo)}`;
        }
      });
    } else {
      window.location.href = `/api/auth/google/redirect?redirect=${encodeURIComponent(redirectTo)}`;
    }
  };

  const validateEmail = (val: string) => {
    if (!val) return 'البريد الإلكتروني مطلوب';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'البريد الإلكتروني غير صحيح';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'كلمة المرور مطلوبة';
    if (val.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
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
        setErrors({ general: data.error || data.message || 'فشل إرسال رمز التحقق' });
      }
    } catch {
      setErrors({ general: 'حدث خطأ أثناء إرسال الرمز' });
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
        setErrors({ general: 'فشل إنشاء جلسة تسجيل الدخول. يرجى المحاولة مرة أخرى' });
        useAuthStore.setState({ user: null, isAuthenticated: false });
        setLoading(false);
        return;
      }
      router.push(result.redirect === '/admin' ? '/admin' : redirectTo);
    } else {
      setErrors({ general: result.message });
    }
    setLoading(false);
  };

  const getFieldError = (field: string) => (touched[field] ? errors[field] : undefined);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">تسجيل الدخول</h2>
        <p className="text-white/50 text-sm">أدخل بريدك الإلكتروني للمتابعة</p>
      </motion.div>

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
          <label className="block text-sm font-medium text-white/70 mb-2">البريد الإلكتروني</label>
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
            <label className="block text-sm font-medium text-white/70 mb-2">كلمة المرور</label>
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
            إرسال رمز التحقق
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
              تسجيل الدخول
            </Button>
          </form>
        )}
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
          {mode === 'otp' ? 'تسجيل الدخول بكلمة المرور' : 'تسجيل الدخول برمز التحقق'}
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-transparent px-4 text-xs text-white/30 font-medium">أو</span>
        </div>
      </motion.div>

      {/* Google */}
      <motion.div variants={itemVariants}>
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium transition-all duration-200 hover:border-white/[0.15] disabled:opacity-50 shadow-lg shadow-black/10"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
          Google
        </motion.button>
      </motion.div>

      {/* Register link */}
      <motion.div variants={itemVariants} className="mt-6 text-center">
        <p className="text-sm text-white/40">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-[#2580eb] hover:text-[#2580eb]/80 font-semibold transition-colors">
            أنشئ حساباً جديداً
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
