'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountrySelect } from '@/components/ui/country-select';
import { getDefaultCountry, validatePhone, type Country } from '@/lib/countries';
import { useAuthStore } from '@/store/auth-store';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
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
  const { register, isEmailRegistered, loginWithGoogle } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(getDefaultCountry());
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'ضعيف', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'متوسط', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'قوي', color: 'bg-blue-500' };
    return { score: 4, label: 'قوي جداً', color: 'bg-emerald-500' };
  }, [formData.password]);

  const passwordChecks = useMemo(() => [
    { label: '8 أحرف على الأقل', met: formData.password.length >= 8 },
    { label: 'يحتوي على رقم', met: /[0-9]/.test(formData.password) },
    { label: 'يحتوي على حرف كبير', met: /[A-Z]/.test(formData.password) },
  ], [formData.password]);

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    else if (formData.name.trim().length < 3) newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.phone) newErrors.phone = 'رقم الجوال مطلوب';
    else if (!validatePhone(formData.phone, selectedCountry)) newErrors.phone = 'رقم الجوال غير صحيح';
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (formData.password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    return newErrors;
  }, [formData, selectedCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrors({ general: 'يجب الموافقة على الشروط والأحكام' });
      return;
    }
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const fullPhone = `${selectedCountry.dialCode}${formData.phone}`;
    const result = register({
      name: formData.name.trim(),
      email: formData.email,
      phone: fullPhone,
      password: formData.password,
    });
    if (result.success) {
      router.push('/login');
    } else {
      setErrors({ general: result.message });
    }
    setLoading(false);
  };

  const handleGoogleSignup = () => {
    const result = loginWithGoogle({
      name: 'مستخدم Google',
      email: `user${Date.now()}@gmail.com`,
    });
    if (result.success) {
      router.push('/');
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validate();
    setErrors(prev => ({ ...prev, general: undefined, ...newErrors }));
  };

  const getFieldError = (field: keyof FormErrors) => {
    if (!touched[field]) return undefined;
    return errors[field];
  };

  const getFieldValid = (field: keyof FormErrors) => {
    if (!touched[field] || !formData[field as keyof FormData]) return false;
    return !errors[field];
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-7">
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] mb-4 shadow-lg shadow-[#2580eb]/30"
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <ShieldCheck className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">إنشاء حساب</h2>
        <p className="text-white/50 text-sm">انضم إلى منصة المنجز الآن</p>
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
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-1.5">الاسم الكامل</label>
          <div className="relative">
            <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (touched.name) {
                  const nameErr = !e.target.value.trim() ? 'الاسم مطلوب' : e.target.value.trim().length < 3 ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : undefined;
                  setErrors(prev => ({ ...prev, name: nameErr }));
                }
              }}
              onBlur={() => handleBlur('name')}
              placeholder="محمد أحمد"
              className={`w-full pr-10 pl-10 py-3 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('name')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : getFieldValid('name')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            <AnimatePresence>
              {getFieldValid('name') && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {getFieldError('name') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle size={12} />
                {getFieldError('name')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-1.5">البريد الإلكتروني</label>
          <div className="relative">
            <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }));
                if (touched.email) {
                  const emailErr = !e.target.value ? 'البريد الإلكتروني مطلوب' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? 'البريد الإلكتروني غير صحيح' : undefined;
                  setErrors(prev => ({ ...prev, email: emailErr }));
                }
              }}
              onBlur={() => handleBlur('email')}
              placeholder="example@email.com"
              dir="ltr"
              className={`w-full pr-10 pl-10 py-3 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('email')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : getFieldValid('email')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            <AnimatePresence>
              {getFieldValid('email') && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {getFieldError('email') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle size={12} />
                {getFieldError('email')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-1.5">رقم الجوال</label>
          <div className="flex gap-2">
            <CountrySelect value={selectedCountry.code} onChange={setSelectedCountry} />
            <div className="relative flex-1">
              <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setFormData(prev => ({ ...prev, phone: val }));
                  if (touched.phone) {
                    const phoneErr = !val ? 'رقم الجوال مطلوب' : !validatePhone(val, selectedCountry) ? 'رقم الجوال غير صحيح' : undefined;
                    setErrors(prev => ({ ...prev, phone: phoneErr }));
                  }
                }}
                onBlur={() => handleBlur('phone')}
                placeholder={selectedCountry.phonePlaceholder}
                dir="ltr"
                className={`w-full pr-10 pl-4 py-3 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                  getFieldError('phone')
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : getFieldValid('phone')
                    ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
                }`}
              />
              <AnimatePresence>
                {getFieldValid('phone') && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <AnimatePresence>
            {getFieldError('phone') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle size={12} />
                {getFieldError('phone')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-1.5">كلمة المرور</label>
          <div className="relative">
            <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, password: e.target.value }));
                if (touched.password) {
                  const passErr = !e.target.value ? 'كلمة المرور مطلوبة' : e.target.value.length < 8 ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : undefined;
                  setErrors(prev => ({ ...prev, password: passErr, confirmPassword: formData.confirmPassword && e.target.value !== formData.confirmPassword ? 'كلمتا المرور غير متطابقتين' : undefined }));
                }
              }}
              onBlur={() => handleBlur('password')}
              placeholder="••••••••"
              className={`w-full pr-10 pl-12 py-3 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('password')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : getFieldValid('password')
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
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle size={12} />
                {getFieldError('password')}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {formData.password && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${passwordStrength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs text-white/50 font-medium min-w-[50px] text-left">{passwordStrength.label}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {passwordChecks.map((check) => (
                    <motion.div
                      key={check.label}
                      className="flex items-center gap-1.5"
                      animate={{ opacity: check.met ? 1 : 0.4 }}
                    >
                      {check.met ? (
                        <CheckCircle size={12} className="text-emerald-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-white/20" />
                      )}
                      <span className={`text-xs ${check.met ? 'text-emerald-400' : 'text-white/40'}`}>{check.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-white/70 mb-1.5">تأكيد كلمة المرور</label>
          <div className="relative">
            <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                if (touched.confirmPassword) {
                  const confirmErr = !e.target.value ? 'تأكيد كلمة المرور مطلوب' : formData.password !== e.target.value ? 'كلمتا المرور غير متطابقتين' : undefined;
                  setErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
                }
              }}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              className={`w-full pr-10 pl-12 py-3 rounded-xl bg-white/[0.05] border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all duration-300 ${
                getFieldError('confirmPassword')
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : getFieldValid('confirmPassword')
                  ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-white/[0.08] focus:border-[#2580eb]/50 focus:ring-2 focus:ring-[#2580eb]/20'
              }`}
            />
            <motion.button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          </div>
          <AnimatePresence>
            {getFieldError('confirmPassword') && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle size={12} />
                {getFieldError('confirmPassword')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                agreeTerms ? 'border-[#2580eb] bg-[#2580eb]' : 'border-white/15'
              }`}>
                <CheckCircle size={12} className={`text-white transition-opacity duration-200 ${agreeTerms ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors leading-5">
              أوافق على{' '}
              <Link href="/terms" className="text-[#2580eb] hover:text-[#2580eb]/80 font-medium">الشروط والأحكام</Link>
              {' '}و{' '}
              <Link href="/privacy" className="text-[#2580eb] hover:text-[#2580eb]/80 font-medium">سياسة الخصوصية</Link>
            </span>
          </label>
          <AnimatePresence>
            {!agreeTerms && touched.name && (
              <motion.p initial={{ opacity: 0, y: -5, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -5, height: 0 }} className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                <AlertCircle size={12} />
                يجب الموافقة على الشروط والأحكام
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            iconLeft={!loading ? <UserPlus size={18} /> : undefined}
            className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20 hover:shadow-2xl hover:shadow-[#2580eb]/30 transition-all duration-300"
          >
            إنشاء حساب
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-transparent px-4 text-xs text-white/30 font-medium">أو</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <motion.button
          type="button"
          onClick={handleGoogleSignup}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium transition-all duration-200 hover:border-white/[0.15] shadow-lg shadow-black/10"
        >
          <GoogleIcon />
          Google
        </motion.button>
      </motion.div>

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
