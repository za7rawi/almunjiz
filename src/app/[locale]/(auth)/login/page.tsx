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
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/ui/country-select';
import { useAuthStore } from '@/store/auth-store';
import { getDefaultCountry, validatePhone, type Country } from '@/lib/countries';

interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  general?: string;
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

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        signIn: () => Promise<{
          authorization: { id_token: string };
          user?: { name: { firstName: string; lastName: string }; email: string };
        }>;
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

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login, loginEmail, loginWithGoogle, loginWithApple } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const result = loginWithGoogle({
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
        });
        if (result.success) {
          router.push(result.redirect === '/admin' ? '/admin' : redirectTo);
        }
      } else {
        setErrors({ general: data.message || 'فشل تسجيل الدخول بـ Google' });
      }
    } catch {
      setErrors({ general: 'حدث خطأ أثناء التواصل مع Google' });
    }
    setGoogleLoading(false);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'demo-google-client-id',
          callback: handleGoogleCredentialResponse,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) existingScript.remove();
    };
  }, []);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrors({});

    if (window.google) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
          setErrors({ general: 'يرجى السماح لنافذة تسجيل الدخول أو تجربة طريقة أخرى' });
        }
      });
    } else {
      setGoogleLoading(false);
      setErrors({ general: 'جاري تحميل خدمات Google...' });
    }
  };

  const handleAppleLogin = () => {
    setAppleLoading(true);
    const result = loginWithApple({
      name: 'مستخدم Apple',
      email: `user${Date.now()}@icloud.com`,
    });
    if (result.success) {
      router.push(result.redirect === '/admin' ? '/admin' : redirectTo);
    }
    setAppleLoading(false);
  };

  const validateEmailField = (val: string): string | undefined => {
    if (!val) return 'البريد الإلكتروني مطلوب';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'البريد الإلكتروني غير صحيح';
    return undefined;
  };

  const validatePasswordField = (val: string): string | undefined => {
    if (!val) return 'كلمة المرور مطلوبة';
    if (val.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    return undefined;
  };

  const validatePhoneField = (val: string): string | undefined => {
    if (!val) return 'رقم الجوال مطلوب';
    if (!validatePhone(val, selectedCountry)) return 'رقم الجوال غير صحيح';
    return undefined;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmailField(email);
    const passErr = validatePasswordField(password);
    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });

    if (emailErr || passErr) return;

    setLoading(true);
    const result = loginEmail(email, password);
    if (result.success) {
      router.push(result.redirect === '/admin' ? '/admin' : redirectTo);
    } else {
      setErrors({ general: result.message });
    }
    setLoading(false);
  };

  const handlePhoneSubmit = async () => {
    const phoneErr = validatePhoneField(phone);
    setErrors({ phone: phoneErr });
    setTouched({ phone: true });

    if (phoneErr) return;

    setOtpLoading(true);
    try {
      const fullPhone = `${selectedCountry.dialCode}${phone}`;
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('otp_identifier', fullPhone);
        sessionStorage.setItem('otp_type', 'phone');
        sessionStorage.setItem('otp_phone_display', `${selectedCountry.flag} ${selectedCountry.dialCode} ${phone}`);
        if (data.data?.devCode) sessionStorage.setItem('otp_dev_code', data.data.devCode);
        if (data.message && data.message.includes(':')) {
          const match = data.message.match(/:\s*(\d{6})/);
          if (match) sessionStorage.setItem('otp_dev_code', match[1]);
        }
        router.push(`/otp?redirect=${encodeURIComponent(redirectTo)}`);
      } else {
        setErrors({ general: data.message || 'فشل إرسال رمز التحقق' });
      }
    } catch {
      setErrors({ general: 'حدث خطأ أثناء إرسال الرمز' });
    } finally {
      setOtpLoading(false);
    }
  };

  const getFieldError = (field: keyof FormErrors) => {
    if (!touched[field]) return undefined;
    return errors[field];
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">تسجيل الدخول</h2>
        <p className="text-white/50 text-sm">أدخل بياناتك للوصول إلى حسابك</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab('phone'); setErrors({}); }}
          className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors z-10 cursor-pointer ${
            activeTab === 'phone' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          {activeTab === 'phone' && (
            <motion.div
              layoutId="login-tab"
              className="absolute inset-0 bg-white/[0.08] rounded-lg"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <Phone size={16} />
            رقم الجوال
          </span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('email'); setErrors({}); }}
          className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors z-10 cursor-pointer ${
            activeTab === 'email' ? 'text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          {activeTab === 'email' && (
            <motion.div
              layoutId="login-tab"
              className="absolute inset-0 bg-white/[0.08] rounded-lg"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <Mail size={16} />
            البريد الإلكتروني
          </span>
        </button>
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

      <AnimatePresence mode="wait">
        {activeTab === 'phone' ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">رقم الجوال</label>
                <div className="flex gap-2">
                  <CountrySelect value={selectedCountry.code} onChange={setSelectedCountry} />
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => {
                        const val = e.target.value.replace(/[^\d]/g, '');
                        setPhone(val);
                        if (touched.phone) {
                          setErrors(prev => ({
                            ...prev,
                            phone: !val ? 'رقم الجوال مطلوب' : !validatePhone(val, selectedCountry) ? 'رقم الجوال غير صحيح' : undefined,
                          }));
                        }
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                      placeholder={selectedCountry.phonePlaceholder}
                      dir="ltr"
                      className={`w-full pr-10 pl-4 py-3 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                        getFieldError('phone')
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : phone && !getFieldError('phone')
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
                      }`}
                    />
                    {phone && !getFieldError('phone') && (
                      <CheckCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {getFieldError('phone') && (
                    <motion.p
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="flex items-center gap-1.5 text-xs text-red-400 mt-2"
                    >
                      <AlertCircle size={12} />
                      {getFieldError('phone')}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                loading={otpLoading}
                onClick={handlePhoneSubmit}
                iconLeft={!otpLoading ? <Phone size={18} /> : undefined}
                className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 hover:shadow-2xl hover:shadow-[#2580eb]/30 transition-all duration-300"
              >
                إرسال رمز التحقق
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                        const emailErr = !e.target.value ? 'البريد الإلكتروني مطلوب' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? 'البريد الإلكتروني غير صحيح' : undefined;
                        setErrors(prev => ({ ...prev, email: emailErr }));
                      }
                    }}
                    onBlur={() => { setTouched(prev => ({ ...prev, email: true })); const err = validateEmailField(email); setErrors(prev => ({ ...prev, email: err })); }}
                    placeholder="example@email.com"
                    dir="ltr"
                    className={`w-full pr-10 pl-10 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
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

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">كلمة المرور</label>
                <div className="relative group">
                  <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) {
                        const passErr = validatePasswordField(e.target.value);
                        setErrors(prev => ({ ...prev, password: passErr }));
                      }
                    }}
                    onBlur={() => { setTouched(prev => ({ ...prev, password: true })); const err = validatePasswordField(password); setErrors(prev => ({ ...prev, password: err })); }}
                    placeholder="••••••••"
                    className={`w-full pr-10 pl-12 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                      getFieldError('password')
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : password && !getFieldError('password')
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
                    }`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div key="eyeoff" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                          <EyeOff size={18} />
                        </motion.div>
                      ) : (
                        <motion.div key="eye" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                          <Eye size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-lg border-2 border-white/15 peer-checked:border-[#2580eb] peer-checked:bg-[#2580eb] transition-all duration-200 flex items-center justify-center">
                      <CheckCircle size={12} className={`text-white transition-opacity duration-200 ${rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>
                  <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">تذكرني</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#14b8a6] hover:text-[#14b8a6]/80 transition-colors font-medium">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <div className="pt-2">
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
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-transparent px-4 text-xs text-white/30 font-medium">أو</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium transition-all duration-200 hover:border-white/[0.15] disabled:opacity-50"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
          Google
        </motion.button>
        <motion.button
          type="button"
          onClick={handleAppleLogin}
          disabled={appleLoading}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium transition-all duration-200 hover:border-white/[0.15] disabled:opacity-50"
        >
          {appleLoading ? <Loader2 size={18} className="animate-spin" /> : <AppleIcon />}
          Apple
        </motion.button>
      </motion.div>

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
