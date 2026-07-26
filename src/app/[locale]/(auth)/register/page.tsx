'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { register, loginWithGoogle } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

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
          router.push(result.redirect === '/admin' ? '/admin' : '/');
        } else {
          setErrors({ general: result.message || 'فشل التسجيل بـ Google' });
        }
      } catch {
        setErrors({ general: 'حدث خطأ أثناء التواصل مع Google' });
      }
      setGoogleLoading(false);
    },
    [loginWithGoogle, router]
  );

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setErrors({});
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.prompt((n) => {
        if (n.isNotDisplayed() || n.isSkippedMoment()) {
          setGoogleLoading(false);
          window.location.href = '/api/auth/google/redirect?redirect=/';
        }
      });
    } else {
      window.location.href = '/api/auth/google/redirect?redirect=/';
    }
  };

  const validate = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value) return 'الاسم مطلوب';
        if (value.trim().length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل';
        return '';
      case 'email':
        if (!value) return 'البريد الإلكتروني مطلوب';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'البريد الإلكتروني غير صحيح';
        return '';
      case 'password':
        if (!value) return 'كلمة المرور مطلوبة';
        if (value.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        return '';
      case 'confirmPassword':
        if (!value) return 'تأكيد كلمة المرور مطلوب';
        if (value !== formData.password) return 'كلمتا المرور غير متطابقتين';
        return '';
      default:
        return '';
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validate(field, formData[field as keyof typeof formData]),
    }));
  };

  const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
    let level = 0;
    if (pwd.length >= 8) level++;
    if (/[A-Z]/.test(pwd)) level++;
    if (/[0-9]/.test(pwd)) level++;
    if (/[^A-Za-z0-9]/.test(pwd)) level++;

    if (level <= 1) return { level, label: 'ضعيفة', color: 'bg-red-500' };
    if (level === 2) return { level, label: 'متوسطة', color: 'bg-yellow-500' };
    if (level === 3) return { level, label: 'جيدة', color: 'bg-blue-500' };
    return { level, label: 'قوية', color: 'bg-emerald-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    newErrors.name = validate('name', formData.name);
    newErrors.email = validate('email', formData.email);
    newErrors.password = validate('password', formData.password);
    newErrors.confirmPassword = validate('confirmPassword', formData.confirmPassword);

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (Object.values(newErrors).some(Boolean)) return;
    if (!agreeTerms) {
      setErrors((prev) => ({ ...prev, general: 'يجب الموافقة على الشروط والأحكام' }));
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    if (result.success) {
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    } else {
      setErrors({ general: result.message });
    }
    setLoading(false);
  };

  const getFieldError = (field: keyof FormErrors) =>
    touched[field] ? errors[field] : undefined;

  const strength = getPasswordStrength(formData.password);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">إنشاء حساب جديد</h2>
        <p className="text-white/50 text-sm">أدخل بياناتك لإنشاء حسابك</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-2">الاسم الكامل</label>
          <div className="relative group">
            <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="محمد أحمد"
              className={`w-full pr-10 pl-10 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('name')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : formData.name && !getFieldError('name')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            {formData.name && !getFieldError('name') && (
              <CheckCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            )}
          </div>
          <AnimatePresence>
            {getFieldError('name') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                <AlertCircle size={12} />{getFieldError('name')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-2">البريد الإلكتروني</label>
          <div className="relative group">
            <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="example@email.com"
              dir="ltr"
              className={`w-full pr-10 pl-10 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('email')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : formData.email && !getFieldError('email')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            {formData.email && !getFieldError('email') && (
              <CheckCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
            )}
          </div>
          <AnimatePresence>
            {getFieldError('email') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                <AlertCircle size={12} />{getFieldError('email')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-2">كلمة المرور</label>
          <div className="relative group">
            <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              className={`w-full pr-10 pl-12 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('password')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            <motion.button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" whileTap={{ scale: 0.9 }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          </div>
          <AnimatePresence>
            {getFieldError('password') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                <AlertCircle size={12} />{getFieldError('password')}
              </motion.p>
            )}
          </AnimatePresence>
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-1">{strength.label}</p>
            </div>
          )}
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-2">تأكيد كلمة المرور</label>
          <div className="relative group">
            <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              className={`w-full pr-10 pl-12 py-3.5 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/50 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('confirmPassword')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : formData.confirmPassword && !getFieldError('confirmPassword')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            <motion.button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" whileTap={{ scale: 0.9 }}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          </div>
          <AnimatePresence>
            {getFieldError('confirmPassword') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                <AlertCircle size={12} />{getFieldError('confirmPassword')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Terms */}
        <motion.div variants={itemVariants} className="flex items-start gap-3 pt-2">
          <button type="button" onClick={() => setAgreeTerms(!agreeTerms)} className="mt-0.5 shrink-0">
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${agreeTerms ? 'border-[#2580eb] bg-[#2580eb]' : 'border-white/15'}`}>
              {agreeTerms && <CheckCircle size={12} className="text-white" />}
            </div>
          </button>
          <p className="text-xs text-white/40 leading-relaxed">
            أوافق على{' '}
            <Link href="/terms" className="text-[#2580eb] hover:text-[#2580eb]/80 transition-colors">الشروط والأحكام</Link>
            {' '}و{' '}
            <Link href="/privacy" className="text-[#2580eb] hover:text-[#2580eb]/80 transition-colors">سياسة الخصوصية</Link>
          </p>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            iconLeft={!loading ? <UserPlus size={18} /> : undefined}
            className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 hover:shadow-2xl hover:shadow-[#2580eb]/30 transition-all duration-300"
          >
            إنشاء الحساب
          </Button>
        </motion.div>
      </form>

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
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium transition-all duration-200 hover:border-white/[0.15] disabled:opacity-50 shadow-lg shadow-black/10"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
          التسجيل بـ Google
        </motion.button>
      </motion.div>

      {/* Login link */}
      <motion.div variants={itemVariants} className="mt-6 text-center">
        <p className="text-sm text-white/40">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-[#2580eb] hover:text-[#2580eb]/80 font-semibold transition-colors">
            سجّل الدخول
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
