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
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { register } = useAuthStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validate = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value) return isAr ? 'الاسم مطلوب' : 'Name is required';
        if (value.trim().length < 3) return isAr ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Name must be at least 3 characters';
        return '';
      case 'email':
        if (!value) return isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
        return '';
      case 'password':
        if (!value) return isAr ? 'كلمة المرور مطلوبة' : 'Password is required';
        if (value.length < 8) return isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value) return isAr ? 'تأكيد كلمة المرور مطلوب' : 'Password confirmation is required';
        if (value !== formData.password) return isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
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

    if (level <= 1) return { level, label: isAr ? 'ضعيفة' : 'Weak', color: 'bg-red-500' };
    if (level === 2) return { level, label: isAr ? 'متوسطة' : 'Medium', color: 'bg-yellow-500' };
    if (level === 3) return { level, label: isAr ? 'جيدة' : 'Good', color: 'bg-blue-500' };
    return { level, label: isAr ? 'قوية' : 'Strong', color: 'bg-emerald-500' };
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
      setErrors((prev) => ({ ...prev, general: isAr ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the Terms and Conditions' }));
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
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{isAr ? 'إنشاء حساب جديد' : 'Create Account'}</h2>
        <p className="text-white/50 text-sm">{isAr ? 'أدخل بياناتك لإنشاء حسابك' : 'Enter your details to create your account'}</p>
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
          <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
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
          <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
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
          <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'كلمة المرور' : 'Password'}</label>
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
          <label className="block text-sm font-medium text-white/70 mb-2">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
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
            {isAr ? 'أوافق على' : 'I agree to the'}{' '}
            <Link href="/terms" className="text-[#2580eb] hover:text-[#2580eb]/80 transition-colors">{isAr ? 'الشروط والأحكام' : 'Terms and Conditions'}</Link>
            {' '}{isAr ? 'و' : 'and'}{' '}
            <Link href="/privacy" className="text-[#2580eb] hover:text-[#2580eb]/80 transition-colors">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
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
            {isAr ? 'إنشاء الحساب' : 'Create Account'}
          </Button>
        </motion.div>
      </form>

      {/* Google Sign Up */}
      <motion.div variants={itemVariants} className="mt-6">
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0a0e27] text-white/40">{isAr ? 'أو' : 'or'}</span>
          </div>
        </div>
        <GoogleSignInButton mode="signup" />
      </motion.div>

      {/* Login link */}
      <motion.div variants={itemVariants} className="mt-6 text-center">
        <p className="text-sm text-white/40">
          {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <Link href="/login" className="text-[#2580eb] hover:text-[#2580eb]/80 font-semibold transition-colors">
            {isAr ? 'سجّل الدخول' : 'Sign in'}
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
