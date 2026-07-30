'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Upload, X, CreditCard,
  Shield, Tag, FileText, File, FileSpreadsheet, Archive,
  ImageIcon, Globe, Hash, Wallet, ChevronDown,
  AlertCircle, Trash2, Clock, ArrowLeft, ArrowRight,
  CheckCircle2, Sparkles, Info, Zap, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, generateOrderNumber } from '@/lib/utils';
import { useRequestProgressStore } from '@/store/request-progress-store';
import { useAuthStore } from '@/store/auth-store';
import { useCurrencyStore } from '@/store/currency-store';
import { useLanguageStore } from '@/store/language-store';
import { formatPrice } from '@/lib/currency';
import { getAvailablePaymentMethods, type PaymentMethodDisplay } from '@/lib/payment-providers';
import type { ServiceData } from '@/types/service-data';

interface GatewayData {
  id: string;
  name: string;
  displayName?: string;
  displayNameEn?: string;
  slug: string;
  isActive: boolean;
  isDefault: boolean;
  supportsApplePay?: boolean;
  supportsGooglePay?: boolean;
  supportsInstallments?: boolean;
  logo?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
}

const STEPS = [
  { label: 'بيانات العميل', labelEn: 'Customer Info', icon: User },
  { label: 'المستندات', labelEn: 'Documents', icon: Upload },
  { label: 'مراجعة الطلب', labelEn: 'Review', icon: CheckCircle2 },
  { label: 'الدفع', labelEn: 'Payment', icon: CreditCard },
];

const phoneCodes = [
  { code: '+966', flag: '🇸🇦', name: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات', nameEn: 'UAE' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت', nameEn: 'Kuwait' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين', nameEn: 'Bahrain' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان', nameEn: 'Oman' },
  { code: '+974', flag: '🇶🇦', name: 'قطر', nameEn: 'Qatar' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن', nameEn: 'Jordan' },
  { code: '+20', flag: '🇪🇬', name: 'مصر', nameEn: 'Egypt' },
];

const countryList = ['السعودية', 'الإمارات', 'الكويت', 'البحرين', 'عُمان', 'قطر', 'الأردن', 'مصر', 'العراق', 'لبنان'];
const countryListEn: Record<string, string> = { 'السعودية': 'Saudi Arabia', 'الإمارات': 'UAE', 'الكويت': 'Kuwait', 'البحرين': 'Bahrain', 'عُمان': 'Oman', 'قطر': 'Qatar', 'الأردن': 'Jordan', 'مصر': 'Egypt', 'العراق': 'Iraq', 'لبنان': 'Lebanon' };

function getFileIcon(type: string) {
  if (type.includes('image')) return <ImageIcon size={18} className="text-[#2580eb]" />;
  if (type.includes('pdf')) return <FileText size={18} className="text-red-500" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={18} className="text-[#2580eb]" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet size={18} className="text-emerald-500" />;
  if (type.includes('zip') || type.includes('archive')) return <Archive size={18} className="text-purple-500" />;
  return <File size={18} className="text-slate-400 dark:text-slate-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const inputBase = "w-full py-3 px-4 rounded-xl border text-sm transition-all duration-200 outline-none";
const inputNormal = cn(inputBase, "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 hover:border-slate-300 dark:hover:border-slate-600");
const inputError = cn(inputBase, "border-red-300 dark:border-red-500/50 bg-red-50/50 dark:bg-red-900/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10");
const inputLtr = cn(inputNormal, "text-left font-mono", "direction: ltr");

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, _hydrated } = useAuthStore();
  const { currency } = useCurrencyStore();
  const { saveProgress, getProgress, clearProgress } = useRequestProgressStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [activeGateways, setActiveGateways] = useState<GatewayData[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services?limit=100')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) { const items = data.data.data || data.data; setServicesData(Array.isArray(items) ? items : []); } })
      .catch(() => {});
    fetch('/api/gateways')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActiveGateways(data.data);
      })
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  }, []);

  const service = useMemo(() => servicesData.find((s) => s.id === id), [id, servicesData]);
  const paymentMethods: PaymentMethodDisplay[] = useMemo(() => getAvailablePaymentMethods(activeGateways), [activeGateways]);
  const displayMethods = useMemo(() => paymentMethods.filter((m) => activeGateways.some((g) => g.id === m.id)), [paymentMethods, activeGateways]);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; discountType: 'percentage' | 'fixed'; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [redirecting, setRedirecting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCode: '+966',
    country: 'السعودية',
    city: '',
    idNumber: '',
    residenceNumber: '',
    passportNumber: '',
    companyName: '',
    profession: '',
    workerData: '',
    notes: '',
  });

  useEffect(() => {
    if (_hydrated && !isAuthenticated) {
      router.replace(`/login?redirect=/request/${id}`);
    } else if (_hydrated) {
      setRedirecting(false);
      if (user) {
        setFormData((prev) => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
        const saved = getProgress(id, user.id);
        if (saved) {
          setFormData((prev) => ({
            ...prev,
            name: saved.formData.name || user.name || '',
            email: saved.formData.email || user.email || '',
            phone: saved.formData.phone || user.phone || '',
            phoneCode: saved.formData.phoneCode || '+966',
            country: saved.formData.country || 'السعودية',
            idNumber: saved.formData.idNumber || '',
            residenceNumber: saved.formData.residenceNumber || '',
            passportNumber: saved.formData.passportNumber || '',
            companyName: saved.formData.companyName || '',
            profession: saved.formData.profession || '',
            workerData: saved.formData.workerCount || '',
            notes: saved.formData.notes || '',
          }));
          setStep(Math.min(saved.step, 3));
          if (saved.promoCode) {
            setPromoCode(saved.promoCode);
          }
          if (saved.selectedGatewayId) {
            setSelectedGatewayId(saved.selectedGatewayId);
          }
        }
      }
    }
  }, [_hydrated, isAuthenticated, user, router, id]);

  useEffect(() => {
    if (!service || !isAuthenticated || redirecting) return;
    const timer = setTimeout(() => {
      saveProgress(id, {
        serviceId: id,
        userId: user?.id || '',
        step,
        formData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          phoneCode: formData.phoneCode,
          country: formData.country,
          idNumber: formData.idNumber,
          residenceNumber: formData.residenceNumber,
          passportNumber: formData.passportNumber,
          companyName: formData.companyName,
          profession: formData.profession,
          workerCount: formData.workerData,
          notes: formData.notes,
        },
        promoCode,
        selectedGatewayId,
        uploadedFileNames: uploadedFiles.map((f) => f.name),
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, step, promoCode, selectedGatewayId, uploadedFiles, service, isAuthenticated, redirecting, id, saveProgress]);

  const price = service?.price || 0;
  const discount = useMemo(() => {
    if (!promoResult?.valid) return 0;
    if (promoResult.discountType === 'percentage') return Math.round(price * promoResult.discount / 100);
    return promoResult.discount;
  }, [promoResult, price]);
  const total = Math.max(0, price - discount);

  const setField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (s: number) => {
    const errors: Record<string, string> = {};
    if (s === 0) {
      if (!formData.name.trim() || formData.name.trim().length < 3) errors.name = isAr ? 'الاسم مطلوب (3 أحرف على الأقل)' : 'Name is required (min 3 characters)';
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
      if (!formData.phone || formData.phone.length < 7) errors.phone = isAr ? 'رقم الجوال غير صحيح' : 'Invalid phone number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, 3)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch('/api/cms/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: price, serviceId: service?.id }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPromoResult(data.data);
      } else {
        setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: data.error || (isAr ? 'خطأ في التحقق من الكوبون' : 'Coupon validation error') });
      }
    } catch {
      setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: isAr ? 'خطأ في الاتصال' : 'Connection error' });
    }
  };

  const addFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      if (uploadedFiles.length >= 5) return;
      const uploaded: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36),
        file, name: file.name, size: file.size, type: file.type, progress: 0,
      };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => { uploaded.preview = ev.target?.result as string; setUploadedFiles((prev) => [...prev, uploaded]); };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles((prev) => [...prev, uploaded]);
      }
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 30 + 10;
        if (p >= 100) { p = 100; clearInterval(interval); }
        setUploadedFiles((prev) => prev.map((f) => f.id === uploaded.id ? { ...f, progress: p } : f));
      }, 200);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (fid: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== fid));

  const handleSubmit = async () => {
    if (!service) return;
    setLoading(true);
    try {
      let fileAttachmentIds: string[] = [];

      if (uploadedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadedFiles.forEach((f) => uploadFormData.append('files', f.file));
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data) {
          fileAttachmentIds = uploadData.data.map((f: { id: string }) => f.id);
        }
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          amount: price,
          discount: discount,
          total: total,
          currency: currency === 'SAR' ? 'SAR' : currency === 'USD' ? 'USD' : currency === 'AED' ? 'AED' : 'SAR',
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: `${formData.phoneCode}${formData.phone}`,
          notes: formData.notes,
          attachments: uploadedFiles.map((f) => f.name),
          promoCode: promoResult?.valid ? promoCode : undefined,
          fileAttachmentIds,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');

      const orderId = orderData.data.id;
      const orderNumber = orderData.data.orderNumber || '';

      if (selectedGatewayId) {
        const payRes = await fetch('/api/payments/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            gatewayId: selectedGatewayId,
            amount: total,
            currency: currency === 'SAR' ? 'SAR' : currency === 'USD' ? 'USD' : currency === 'AED' ? 'AED' : 'SAR',
            description: `Payment for ${service.name}`,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: `${formData.phoneCode}${formData.phone}`,
            metadata: {
              service_id: service.id,
              service_name: service.name,
            },
          }),
        });

        const payData = await payRes.json();
        if (payData.success && payData.data?.paymentUrl) {
          clearProgress(id);
          window.location.href = payData.data.paymentUrl;
          return;
        }
        if (payData.success && payData.data?.clientSecret) {
          clearProgress(id);
          router.push(`/payment/success?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}&gatewayId=${selectedGatewayId}&clientSecret=${payData.data.clientSecret}`);
          return;
        }
      }

      clearProgress(id);
      router.push(`/payment/success?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}`);
    } catch {
      router.push('/payment/failed');
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#2580eb] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'جارٍ التحقق من تسجيل الدخول...' : 'Verifying login...'}</p>
        </motion.div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-md w-full mx-4 p-10 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mx-auto mb-5">
              <X size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'خدمة غير موجودة' : 'Service Not Found'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{isAr ? 'الخدمة المحددة غير موجودة أو تم حذفها' : 'The selected service does not exist or has been removed'}</p>
            <Link href="/services">
              <Button variant="primary" className="rounded-xl px-8">{isAr ? 'العودة للخدمات' : 'Back to Services'}</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Breadcrumb & Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-5">
            <Link href="/services" className="hover:text-[#2580eb] transition-colors">{isAr ? 'الخدمات' : 'Services'}</Link>
            <span>/</span>
            <Link href={`/services/${service.id}`} className="hover:text-[#2580eb] transition-colors">{service.name}</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{isAr ? 'طلب خدمة' : 'Request Service'}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{isAr ? 'طلب خدمة' : 'Request Service'}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base">{service.name} — {formatPrice(service.price, currency)}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 self-start">
              <Clock size={13} />
              <span>{service.duration}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Step Indicator ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="mb-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isCompleted = i < step;
                const isCurrent = i === step;
                const isUpcoming = i > step;
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative">
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                        transition={isCurrent ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative",
                          isCompleted && "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-200",
                          isCurrent && "bg-gradient-to-br from-[#2580eb] to-[#1a6dd1] text-white shadow-lg shadow-[#2580eb]/30 ring-4 ring-[#2580eb]/10",
                          isUpcoming && "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500",
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={20} className="sm:w-5 sm:h-5" />
                        ) : (
                          <StepIcon size={18} className="sm:w-5 sm:h-5" />
                        )}
                        {isCurrent && (
                          <motion.div
                            className="absolute -inset-1 rounded-2xl border-2 border-[#2580eb]/20"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}
                      </motion.div>
                      <span className={cn(
                        "text-[10px] sm:text-xs mt-2 font-semibold transition-colors",
                        isCompleted && "text-emerald-600",
                        isCurrent && "text-[#2580eb]",
                        isUpcoming && "text-slate-400 dark:text-slate-500",
                      )}>
                        <span className="hidden sm:inline">{isAr ? s.label : s.labelEn}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 sm:mx-3 mb-6">
                        <div className="h-0.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: isCompleted ? '100%' : '0%' }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ─── Step 0: Customer Info ─── */}
              {step === 0 && (
                <motion.div key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <Card className="p-5 sm:p-7">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
                        <User size={20} className="text-[#2580eb]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'بيانات العميل' : 'Customer Information'}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'أدخل بياناتك الشخصية لاستكمال الطلب' : 'Enter your personal details to complete the request'}</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {isAr ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setField('name', e.target.value)}
                            placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                            className={cn(formErrors.name ? inputError : inputNormal, "pr-11")}
                          />
                        </div>
                        {formErrors.name && (
                          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                            <AlertCircle size={12} /> {formErrors.name}
                          </motion.p>
                        )}
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {isAr ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                              type="email"
                              dir="ltr"
                              value={formData.email}
                              onChange={(e) => setField('email', e.target.value)}
                              placeholder="email@example.com"
                              className={cn(formErrors.email ? inputError : inputLtr, "pr-11")}
                            />
                          </div>
                          {formErrors.email && (
                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.email}
                            </motion.p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {isAr ? 'رقم الجوال' : 'Phone Number'} <span className="text-red-400">*</span>
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={formData.phoneCode}
                              onChange={(e) => setField('phoneCode', e.target.value)}
                              className="w-24 px-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all appearance-none text-center"
                            >
                              {phoneCodes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                            <div className="relative flex-1">
                              <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                              <input
                                type="tel"
                                dir="ltr"
                                value={formData.phone}
                                onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 15))}
                                placeholder="5XXXX XXXX"
                                className={cn(formErrors.phone ? inputError : inputLtr, "pr-11")}
                              />
                            </div>
                          </div>
                          {formErrors.phone && (
                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.phone}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {/* Country & City */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'الدولة' : 'Country'}</label>
                          <div className="relative">
                            <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <select
                              value={formData.country}
                              onChange={(e) => setField('country', e.target.value)}
                              className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all appearance-none"
                            >
                              {countryList.map((c) => <option key={c} value={c}>{isAr ? c : countryListEn[c] || c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'المدينة' : 'City'}</label>
                          <div className="relative">
                            <Hash size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setField('city', e.target.value)}
                              placeholder={isAr ? 'مثال: الرياض' : 'e.g. Riyadh'}
                              className={cn(inputNormal, "pr-11")}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'ملاحظات إضافية' : 'Additional Notes'} <span className="text-slate-400 dark:text-slate-500 font-normal">({isAr ? 'اختياري' : 'Optional'})</span></label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setField('notes', e.target.value)}
                          placeholder={isAr ? 'أي تفاصيل إضافية عن طلبك...' : 'Any additional details about your request...'}
                          rows={3}
                          maxLength={500}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all resize-none hover:border-slate-300 dark:hover:border-slate-600"
                        />
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 text-left">{formData.notes.length}/500</p>
                      </div>
                    </div>
                  </Card>

                  {/* Service-Specific Fields */}
                  {(service.category === 'VISAS' || service.category === 'GOVERNMENT' || service.category === 'DOCUMENTS') && (
                    <Card className="p-5 sm:p-7 mt-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/10 to-[#7c3aed]/10 flex items-center justify-center">
                          <Hash size={20} className="text-purple-500" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'بيانات إضافية' : 'Additional Data'}</h2>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'أدخل بيانات الهوية أو الجواز' : 'Enter ID or passport information'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'رقم الهوية' : 'ID Number'}</label>
                          <input
                            type="text"
                            dir="ltr"
                            value={formData.idNumber}
                            onChange={(e) => setField('idNumber', e.target.value)}
                            placeholder="1XXXXXXXXX"
                            className={cn(inputLtr, "pr-4")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'رقم الإقامة' : 'Residence Number'}</label>
                          <input
                            type="text"
                            dir="ltr"
                            value={formData.residenceNumber}
                            onChange={(e) => setField('residenceNumber', e.target.value)}
                            placeholder={isAr ? 'اختياري' : 'Optional'}
                            className={cn(inputLtr, "pr-4")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'رقم الجواز' : 'Passport Number'}</label>
                          <input
                            type="text"
                            dir="ltr"
                            value={formData.passportNumber}
                            onChange={(e) => setField('passportNumber', e.target.value)}
                            placeholder="A12345678"
                            className={cn(inputLtr, "pr-4")}
                          />
                        </div>
                      </div>
                    </Card>
                  )}

                  {service.category === 'CONTRACTS' && (
                    <Card className="p-5 sm:p-7 mt-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/10 to-[#7c3aed]/10 flex items-center justify-center">
                          <Hash size={20} className="text-purple-500" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'بيانات العقد' : 'Contract Details'}</h2>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'معلومات العقد والموظفين' : 'Contract and employee information'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'اسم الشركة' : 'Company Name'}</label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setField('companyName', e.target.value)}
                            placeholder={isAr ? 'أدخل اسم الشركة' : 'Enter company name'}
                            className={cn(inputNormal, "pr-4")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'المهنة' : 'Profession'}</label>
                          <input
                            type="text"
                            value={formData.profession}
                            onChange={(e) => setField('profession', e.target.value)}
                            placeholder={isAr ? 'المهنة المطلوبة' : 'Required profession'}
                            className={cn(inputNormal, "pr-4")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'بيانات العامل' : 'Worker Details'}</label>
                          <textarea
                            value={formData.workerData}
                            onChange={(e) => setField('workerData', e.target.value)}
                            placeholder={isAr ? 'اسم العامل، الجنسية، رقم الجواز...' : 'Worker name, nationality, passport number...'}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all resize-none hover:border-slate-300 dark:hover:border-slate-600"
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* ─── Step 1: Documents ─── */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <Card className="p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400/10 to-amber-500/10 flex items-center justify-center">
                        <Upload size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'رفع المستندات' : 'Upload Documents'}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'ارفع الملفات المطلوبة لإتمام الطلب' : 'Upload the required files to complete your request'}</p>
                      </div>
                    </div>

                    {/* Required Documents Notice */}
                    {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 rounded-2xl border border-[#2580eb]/15 dark:border-[#2580eb]/20">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Info size={15} className="text-[#2580eb]" />
                          <p className="text-sm font-semibold text-[#2580eb]">{isAr ? 'المستندات المطلوبة:' : 'Required documents:'}</p>
                        </div>
                        <div className="space-y-1.5">
                          {service.requiredDocuments.map((doc, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 mb-4">{isAr ? 'PDF, DOC, XLS, JPG, PNG, ZIP — حد أقصى 10 ميجا — حتى 5 ملفات' : 'PDF, DOC, XLS, JPG, PNG, ZIP — Max 10 MB — Up to 5 files'}</p>

                    {/* Drop Zone */}
                    <div
                      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer group",
                        isDragOver
                          ? "border-[#2580eb] bg-[#2580eb]/5 scale-[1.02]"
                          : "border-slate-200 dark:border-slate-600 hover:border-[#2580eb]/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50",
                      )}
                    >
                      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" onChange={handleFileUpload} className="hidden" />
                      <motion.div
                        animate={isDragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center mx-auto mb-4"
                      >
                        <Upload size={28} className={cn("transition-colors", isDragOver ? "text-[#2580eb]" : "text-slate-400 dark:text-slate-500 group-hover:text-[#2580eb]")} />
                      </motion.div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {isDragOver ? (isAr ? 'أفلت الملفات هنا' : 'Drop files here') : (isAr ? 'اسحب الملفات هنا أو اضغط للاختيار' : 'Drag files here or click to browse')}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{uploadedFiles.length}/5 {isAr ? 'ملفات مرفوعة' : 'files uploaded'}</p>
                    </div>

                    {/* Uploaded Files */}
                    <AnimatePresence>
                      {uploadedFiles.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 space-y-2.5">
                          {uploadedFiles.map((f) => (
                            <motion.div
                              key={f.id}
                              initial={{ opacity: 0, x: -20, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: 20, scale: 0.95 }}
                              className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
                            >
                              {f.preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={f.preview} alt={f.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                                  {getFileIcon(f.type)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{f.name}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">{formatFileSize(f.size)}</p>
                                {f.progress < 100 && (
                                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${f.progress}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </div>
                                )}
                              </div>
                              {f.progress >= 100 && (
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              )}
                              <button
                                onClick={() => removeFile(f.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 2: Review ─── */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <Card className="p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'مراجعة الطلب' : 'Review Order'}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'تأكد من صحة البيانات قبل المتابعة' : 'Verify your information before continuing'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Service */}
                      <div className="p-4 bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 rounded-xl border border-[#2580eb]/10">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الخدمة المختارة' : 'Selected Service'}</p>
                        <p className="font-bold text-slate-900 dark:text-white">{service.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{service.duration}</p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: isAr ? 'الاسم' : 'Name', value: formData.name },
                          { label: isAr ? 'البريد' : 'Email', value: formData.email, dir: 'ltr' as const },
                          { label: isAr ? 'الجوال' : 'Phone', value: `${formData.phoneCode} ${formData.phone}`, dir: 'ltr' as const },
                          { label: isAr ? 'المدينة' : 'City', value: formData.city || formData.country },
                        ].map((item) => (
                          <div key={item.label} className="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200" dir={item.dir}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Files */}
                      {uploadedFiles.length > 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-2">{isAr ? 'المستندات المرفوعة' : 'Uploaded Documents'} ({uploadedFiles.length})</p>
                          <div className="space-y-1.5">
                            {uploadedFiles.map((f) => (
                              <div key={f.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                                  {getFileIcon(f.type)}
                                </div>
                                <span className="truncate">{f.name}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{formatFileSize(f.size)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {formData.notes && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'ملاحظات' : 'Notes'}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Promo Code */}
                  <Card className="p-5 sm:p-7 mt-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 flex items-center justify-center">
                        <Sparkles size={20} className="text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'كود الخصم' : 'Promo Code'}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'لديك كود خصم؟ أدخله هنا' : 'Have a promo code? Enter it here'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }}
                        placeholder={isAr ? 'أدخل كود الخصم' : 'Enter promo code'}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all text-left font-mono uppercase tracking-wider hover:border-slate-300 dark:hover:border-slate-600"
                        dir="ltr"
                      />
                      <Button onClick={handleApplyPromo} variant="primary" className="px-6 rounded-xl font-semibold">{isAr ? 'تطبيق' : 'Apply'}</Button>
                    </div>
                    {promoResult && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center gap-2 mt-3 text-sm font-semibold px-3 py-2 rounded-xl",
                          promoResult.valid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
                        )}
                      >
                        {promoResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {promoResult.message}
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 3: Payment ─── */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                  <Card className="p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed]/10 to-[#2580eb]/10 flex items-center justify-center">
                        <CreditCard size={20} className="text-[#7c3aed]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'اختر طريقة الدفع المناسبة لك' : 'Choose your preferred payment method'}</p>
                      </div>
                    </div>

                    {displayMethods.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                          <Wallet size={32} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">{isAr ? 'لا توجد بوابات دفع مفعلة' : 'No active payment gateways'}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{isAr ? 'يمكنك إكمال الطلب وسيتم التواصل معك لترتيب الدفع' : 'You can complete the order and we will contact you to arrange payment'}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayMethods.map((method) => {
                          const isSelected = selectedGatewayId === method.id;
                          return (
                            <motion.button
                              key={method.id}
                              onClick={() => { setSelectedGatewayId(method.id); setFormErrors((p) => { const n = { ...p }; delete n.gateway; return n; }); }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-right",
                                isSelected
                                  ? "border-[#2580eb] bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 shadow-lg shadow-[#2580eb]/10"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md",
                              )}
                            >
                              <div className={cn(
                                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                isSelected ? "bg-[#2580eb]/10" : "bg-slate-100 dark:bg-slate-700",
                              )}>
                                <Wallet size={24} className={isSelected ? "text-[#2580eb]" : "text-slate-400 dark:text-slate-500"} />
                              </div>
                              <div className="flex-1 text-right">
                                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{method.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{method.supportedMethods.join(' · ')}</p>
                              </div>
                              {method.isDefault && (
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">{isAr ? 'افتراضي' : 'Default'}</span>
                              )}
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "border-[#2580eb] bg-[#2580eb]" : "border-slate-300 dark:border-slate-600",
                              )}>
                                {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                    {formErrors.gateway && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-3 flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.gateway}
                      </motion.p>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                {/* Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-[#2580eb]/90 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Zap size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider font-medium">{isAr ? 'ملخص الطلب' : 'Order Summary'}</p>
                      <p className="font-bold text-sm mt-0.5">{service.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Clock size={12} />
                    <span>{service.duration}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-5 sm:p-6">
                  <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{isAr ? 'السعر' : 'Price'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(price, currency)}</span>
                    </div>
                    {discount > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Tag size={13} /> {isAr ? 'الخصم' : 'Discount'}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">-{formatPrice(discount, currency)}</span>
                      </motion.div>
                    )}
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-extrabold bg-gradient-to-l from-[#2580eb] to-[#14b8a6] bg-clip-text text-transparent"
                      >
                        {formatPrice(total, currency)}
                      </motion.span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 mt-2">
                    {step < 3 ? (
                      <Button
                        onClick={nextStep}
                        variant="primary"
                        fullWidth
                        className="py-3.5 text-sm font-bold rounded-xl shadow-xl shadow-[#2580eb]/20 hover:shadow-[#2580eb]/30 transition-shadow"
                        iconRight={<ArrowLeft size={16} className="rtl:rotate-180" />}
                      >
                        {step === 2 ? (isAr ? 'متابعة إلى الدفع' : 'Proceed to Payment') : (isAr ? 'التالي' : 'Next')}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={activeGateways.length > 0 && !selectedGatewayId}
                        className="py-4 text-sm font-bold rounded-xl shadow-xl shadow-[#2580eb]/20 hover:shadow-[#2580eb]/30 transition-shadow"
                        iconLeft={!loading ? <Lock size={16} /> : undefined}
                      >
                        {loading ? (isAr ? 'جار المعالجة...' : 'Processing...') : (isAr ? 'إتمام الطلب والدفع' : 'Complete Order & Pay')}
                      </Button>
                    )}
                    {step > 0 && (
                      <Button
                        onClick={prevStep}
                        variant="ghost"
                        fullWidth
                        className="py-3 rounded-xl text-sm font-medium"
                        iconRight={<ArrowRight size={16} className="rtl:rotate-180" />}
                      >
                        {isAr ? 'السابق' : 'Back'}
                      </Button>
                    )}
                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Shield size={13} className="text-emerald-500" />
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{isAr ? 'دفع آمن ومشفر بتقنية SSL' : 'Secure & SSL encrypted payment'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
