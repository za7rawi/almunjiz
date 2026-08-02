'use client';

import { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import {
  User, Upload, X,
  CheckCircle2, Shield, Tag, FileText, File,
  FileSpreadsheet, Archive, ImageIcon, Loader2,
  Wallet, AlertCircle,
  Trash2, Clock, Sparkles, Zap,
  ChevronLeft, ChevronRight, Printer, Home, CheckCircle,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { useLanguageStore } from '@/store/language-store';
import type { ServiceData } from '@/types/service-data';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
  uploaded: boolean;
  serverFileId?: string;
  fileUrl?: string;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  phoneCode: string;
}

interface OrderResult {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  amount: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerName: string;
  serviceName: string;
}

const phoneCodes = [
  { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان' },
  { code: '+974', flag: '🇶🇦', name: 'قطر' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  { code: '+20', flag: '🇪🇬', name: 'مصر' },
];

function getFileIcon(type: string) {
  if (type.includes('image')) return <ImageIcon size={18} className="text-[#2580eb]" />;
  if (type.includes('pdf')) return <FileText size={18} className="text-red-500" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={18} className="text-[#2580eb]" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet size={18} className="text-emerald-500" />;
  if (type.includes('zip') || type.includes('archive')) return <Archive size={18} className="text-purple-500" />;
  return <File size={18} className="text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const inputBase = "w-full py-3 px-4 rounded-xl border text-sm transition-all duration-200 outline-none";
const inputNormal = cn(inputBase, "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 hover:border-slate-300 dark:hover:border-slate-500");
const inputError = cn(inputBase, "border-red-300 bg-red-50/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10");
const inputLtr = cn(inputNormal, "text-left font-mono", "direction: ltr");

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { key: 'customer_info', ar: 'البيانات', en: 'Info' },
  { key: 'documents', ar: 'المستندات', en: 'Documents' },
  { key: 'confirm', ar: 'التأكيد', en: 'Confirm' },
  { key: 'payment', ar: 'الدفع', en: 'Payment' },
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const router = useRouter();
  const { user, isAuthenticated, _hydrated } = useAuthStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const { currency } = useCurrencyStore();

  const [service, setService] = useState<Partial<ServiceData> | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(true);

  const [step, setStep] = useState<'customer_info' | 'documents' | 'confirm' | 'payment' | 'order_created'>('customer_info');
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; discountType: 'percentage' | 'fixed'; message: string } | null>(null);

  const [formData, setFormData] = useState<CustomerForm>(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    phoneCode: '+966',
  }));

  useEffect(() => {
    const sync = () => {
      if (_hydrated && !isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(`/checkout?service=${serviceId || ''}`)}`);
      } else if (_hydrated) {
        setRedirecting(false);
      }
    };
    sync();
  }, [_hydrated, isAuthenticated, router, serviceId]);

  useEffect(() => {
    const sync = () => {
      if (serviceId) {
        fetch(`/api/services/${serviceId}?brief=true`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success) setService(data.data);
          })
          .catch(() => {})
          .finally(() => setServiceLoading(false));
      } else {
        setServiceLoading(false);
      }
    };
    sync();
  }, [serviceId]);

  const basePrice = service?.price || 0;
  const discount = useMemo(() => {
    if (!promoResult?.valid) return 0;
    if (promoResult.discountType === 'percentage') return Math.round(basePrice * promoResult.discount / 100);
    return promoResult.discount;
  }, [promoResult, basePrice]);
  const finalAmount = Math.max(0, basePrice - discount);
  const requiredDocs = (isAr ? service?.requiredDocuments : service?.requiredDocumentsEn) || service?.requiredDocuments || [];

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const maxReachableStep = orderResult ? 5 : 3;

  const goToStep = (idx: number) => {
    if (idx <= maxReachableStep && idx >= 0 && !loading) {
      setStep(STEPS[idx].key as typeof step);
    }
  };

  const setField = useCallback((field: keyof CustomerForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) errors.name = isAr ? 'الاسم مطلوب (3 أحرف على الأقل)' : 'Name is required (min 3 characters)';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
    if (!formData.phone || formData.phone.length < 7) errors.phone = isAr ? 'رقم الجوال غير صحيح' : 'Invalid phone number';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isAr]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch('/api/cms/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: basePrice, serviceId: serviceId || undefined }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPromoResult(data.data);
      } else {
        setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: data.error || (isAr ? 'خطأ في التحقق من الكوبون' : 'Error validating coupon') });
      }
    } catch {
      setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: isAr ? 'خطأ في الاتصال' : 'Connection error' });
    }
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      if (uploadedFiles.length >= 10) return;
      const uploaded: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36),
        file, name: file.name, size: file.size, type: file.type, progress: 0, uploaded: false,
      };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploaded.preview = ev.target?.result as string;
          setUploadedFiles((prev) => [...prev, uploaded]);
        };
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
  }, [uploadedFiles.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleCreateOrder = async () => {
    if (!validate() || !service) return;
    setLoading(true);
    setError('');

    try {
      let fileAttachmentIds: string[] = [];
      const pendingFiles = uploadedFiles.filter((f) => !f.uploaded && f.file);

      if (pendingFiles.length > 0) {
        setFileUploading(true);
        const fd = new FormData();
        pendingFiles.forEach((f) => fd.append('files', f.file));
        const uploadRes = await fetch('/api/upload-files', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || (isAr ? 'فشل رفع الملفات' : 'Failed to upload files'));
        }

        fileAttachmentIds = uploadData.data.map((f: { id: string }) => f.id);
        setUploadedFiles((prev) =>
          prev.map((f) => {
            const match = uploadData.data.find((sf: { fileName: string; id: string; fileUrl: string }) => sf.fileName === f.name);
            if (match) return { ...f, uploaded: true, serverFileId: match.id, fileUrl: match.fileUrl, progress: 100 };
            return f;
          })
        );
        setFileUploading(false);
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
        serviceName: service.name || '',
          amount: basePrice,
          discount,
          total: finalAmount,
          currency: currency === 'SAR' ? 'SAR' : 'SAR',
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: `${formData.phoneCode}${formData.phone}`,
          notes: '',
          attachments: uploadedFiles.map((f) => f.name),
          fileAttachmentIds,
          promoCode: promoResult?.valid ? promoCode : undefined,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || (isAr ? 'فشل إنشاء الطلب' : 'Failed to create order'));
      }

      setOrderResult({
        id: data.data.id,
        orderNumber: data.data.orderNumber,
        invoiceNumber: data.data.invoiceNumber,
        amount: Number(data.data.amount),
        discount: Number(data.data.discount),
        total: Number(data.data.total),
        currency: data.data.currency,
        status: data.data.status,
        paymentStatus: data.data.paymentStatus,
        createdAt: data.data.createdAt,
        customerName: formData.name,
        serviceName: service.name || '',
      });
      setStep('order_created');
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating order'));
    } finally {
      setLoading(false);
      setFileUploading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-[#2580eb] mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'جارٍ التحقق من تسجيل الدخول...' : 'Verifying login...'}</p>
        </div>
      </div>
    );
  }

  if (serviceLoading) {
    return <CheckoutSkeleton />;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-20">
        <div>
          <Card className="max-w-md w-full mx-4 p-10 text-center dark:bg-slate-800">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mx-auto mb-5">
              <X size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'خدمة غير موجودة' : 'Service not found'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{isAr ? 'الخدمة المحددة غير موجودة أو تم حذفها' : 'The selected service is not available or has been removed'}</p>
            <Link href="/services">
              <Button variant="primary" className="rounded-xl px-8">{isAr ? 'العودة للخدمات' : 'Back to Services'}</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  function renderStepIndicator() {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {STEPS.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            const isFuture = idx > currentStepIndex;
            return (
              <div key={s.key} className="flex items-center gap-1 sm:gap-2">
                {idx > 0 && (
                  <div className={cn(
                    "w-6 sm:w-10 h-0.5 rounded",
                    isPast ? "bg-[#2580eb]" : "bg-slate-200 dark:bg-slate-600"
                  )} />
                )}
                <button
                  onClick={() => goToStep(idx)}
                  disabled={isFuture || loading}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all",
                    isActive ? "bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/20" : "",
                    isPast ? "text-[#2580eb] cursor-pointer hover:bg-[#2580eb]/10" : "",
                    isFuture ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "",
                    !isActive && !isPast && !isFuture ? "text-slate-400" : ""
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold",
                    isActive ? "bg-white/20 text-white" : "",
                    isPast ? "bg-[#2580eb] text-white" : "",
                    !isActive && !isPast ? "bg-slate-100 dark:bg-slate-700 text-slate-400" : ""
                  )}>
                    {isPast ? <CheckCircle size={12} /> : idx + 1}
                  </div>
                  <span className="hidden sm:inline">{isAr ? s.ar : s.en}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCustomerInfoStep() {
    return (
      <div className="space-y-6">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
              <User size={20} className="text-[#2580eb]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'بيانات العميل' : 'Customer Information'}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'أدخل بياناتك لإتمام الطلب' : 'Enter your details to proceed'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className={formErrors.name ? inputError : inputNormal}
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="email@example.com"
                className={formErrors.email ? inputError : inputLtr}
                dir="ltr"
              />
              {formErrors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'رقم الجوال' : 'Phone Number'}</label>
              <div className="flex gap-2">
                <select
                  value={formData.phoneCode}
                  onChange={(e) => setField('phoneCode', e.target.value)}
                  className="w-28 sm:w-32 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#2580eb]"
                >
                  {phoneCodes.map((pc) => (
                    <option key={pc.code} value={pc.code}>{pc.flag} {pc.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                  placeholder={isAr ? 'رقم الجوال' : 'Phone number'}
                  className={cn(formErrors.phone ? inputError : inputNormal, "flex-1")}
                  dir="ltr"
                />
              </div>
              {formErrors.phone && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {formErrors.phone}</p>}
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 flex items-center justify-center">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'كود الخصم' : 'Discount Code'}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'لديك كود خصم؟ أدخله هنا' : 'Have a discount code? Enter it here'}</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }}
              placeholder={isAr ? 'أدخل كود الخصم' : 'Enter discount code'}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all text-left font-mono uppercase tracking-wider"
              dir="ltr"
            />
            <Button onClick={handleApplyPromo} variant="primary" className="px-6 rounded-xl font-semibold">{isAr ? 'تطبيق' : 'Apply'}</Button>
          </div>
          {promoResult && (
            <div className={cn(
              "flex items-center gap-2 mt-3 text-sm font-semibold px-3 py-2 rounded-xl",
              promoResult.valid ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
            )}>
              {promoResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {promoResult.message}
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              if (validate()) {
                setStep('documents');
              }
            }}
            variant="primary"
            className="px-8 py-3 rounded-xl font-bold"
            iconLeft={isAr ? undefined : <ChevronRight size={18} />}
            iconRight={isAr ? <ChevronLeft size={18} /> : undefined}
          >
            {isAr ? 'التالي' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  function renderDocumentsStep() {
    const hasRequired = requiredDocs && requiredDocs.length > 0;
    return (
      <div className="space-y-6">
        {hasRequired && (
          <Card className="p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400/10 to-indigo-500/10 flex items-center justify-center">
                <FileText size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'المستندات المطلوبة' : 'Required Documents'}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'يرجى رفع المستندات التالية' : 'Please upload the following documents'}</p>
              </div>
            </div>
            <div className="space-y-2">
              {requiredDocs.map((doc: string, i: number) => {
                const matched = uploadedFiles.some((f) => f.uploaded && f.name.toLowerCase().includes(doc.substring(0, 10).toLowerCase()));
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    {matched ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={18} className="text-slate-300 dark:text-slate-500 shrink-0" />
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{doc}</span>
                    <span className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-lg",
                      matched ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-600 text-slate-400"
                    )}>
                      {matched ? (isAr ? 'مرفوع' : 'Uploaded') : (isAr ? 'غير مرفوع' : 'Not uploaded')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400/10 to-amber-500/10 flex items-center justify-center">
              <Upload size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'رفع الملفات' : 'Upload Files'}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'PDF, DOC, XLS, JPG, PNG, ZIP — حد أقصى 10 ميجا — حتى 10 ملفات' : 'PDF, DOC, XLS, JPG, PNG, ZIP — Max 10MB — Up to 10 files'}</p>
            </div>
          </div>

          <div
            onDrop={handleDrop}
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center mx-auto mb-4">
              <Upload size={28} className={cn("transition-colors", isDragOver ? "text-[#2580eb]" : "text-slate-400 group-hover:text-[#2580eb]")} />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {isDragOver ? (isAr ? 'أفلت الملفات هنا' : 'Drop files here') : (isAr ? 'اسحب الملفات هنا أو اضغط للاختيار' : 'Drag files here or click to select')}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{uploadedFiles.length}/10 {isAr ? 'ملفات مرفوعة' : 'files uploaded'}</p>
          </div>

          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <div className="mt-5 space-y-2.5">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 transition-colors group">
                    {f.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.preview} alt={f.name} loading="lazy" className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-600" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                        {getFileIcon(f.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-400">{formatFileSize(f.size)}</p>
                      {f.progress < 100 && (
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                    </div>
                    {f.uploaded && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                    <button
                      onClick={() => removeFile(f.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={() => setStep('customer_info')}
            variant="secondary"
            className="px-6 py-3 rounded-xl font-medium"
            iconLeft={isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          >
            {isAr ? 'السابق' : 'Previous'}
          </Button>
          <Button
            onClick={() => setStep('confirm')}
            variant="primary"
            className="px-8 py-3 rounded-xl font-bold"
            iconLeft={isAr ? undefined : <ChevronRight size={18} />}
            iconRight={isAr ? <ChevronLeft size={18} /> : undefined}
          >
            {isAr ? 'التالي' : 'Next'}
          </Button>
        </div>
      </div>
    );
  }

  function renderConfirmStep() {
    const pendingFiles = uploadedFiles.filter((f) => !f.uploaded && f.file);
    const hasUnuploadedFiles = pendingFiles.length > 0;
    return (
      <div className="space-y-6">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-emerald-500/10 flex items-center justify-center">
              <FileText size={20} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'مراجعة الطلب' : 'Review Order'}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'يرجى مراجعة بيانات الطلب قبل التأكيد' : 'Please review your order before confirming'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الاسم' : 'Name'}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{formData.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'البريد الإلكتروني' : 'Email'}</p>
                <p className="font-semibold text-slate-900 dark:text-white" dir="ltr">{formData.email}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'رقم الجوال' : 'Phone'}</p>
                <p className="font-semibold text-slate-900 dark:text-white" dir="ltr">{formData.phoneCode} {formData.phone}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الخدمة' : 'Service'}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{isAr ? service?.name : service?.nameEn}</p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-2">{isAr ? 'الملفات المرفوعة' : 'Uploaded Files'}</p>
                <div className="space-y-1.5">
                  {uploadedFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm">
                      {f.uploaded ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Loader2 size={14} className="animate-spin text-amber-500" />}
                      <span className="text-slate-700 dark:text-slate-300 truncate">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            onClick={() => setStep('documents')}
            variant="secondary"
            className="px-6 py-3 rounded-xl font-medium"
            iconLeft={isAr ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          >
            {isAr ? 'السابق' : 'Previous'}
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="primary"
            loading={loading}
            disabled={hasUnuploadedFiles && fileUploading}
            className="px-8 py-3 rounded-xl font-bold"
            iconLeft={!loading ? <Shield size={18} /> : undefined}
          >
            {loading ? (isAr ? 'جاري إنشاء الطلب...' : 'Creating order...') : (isAr ? 'تأكيد الطلب' : 'Confirm Order')}
          </Button>
        </div>
      </div>
    );
  }

  function renderOrderCreated() {
    if (!orderResult) return null;
    const createdDate = new Date(orderResult.createdAt);
    const dateStr = createdDate.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = createdDate.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="space-y-6">
        <Card className="p-6 sm:p-8 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-900/20 dark:via-slate-800 dark:to-emerald-900/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'تم إرسال طلبك بنجاح' : 'Order Submitted Successfully'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'شكراً لك، تم استلام طلبك وسيتم مراجعته من قبل فريقنا' : 'Thank you, your order has been received and will be reviewed by our team'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'رقم الطلب' : 'Order Number'}</p>
              <p className="text-lg font-bold text-[#2580eb] font-mono" dir="ltr">{orderResult.orderNumber}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</p>
              <p className="text-lg font-bold text-[#7c3aed] font-mono" dir="ltr">{orderResult.invoiceNumber}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'العميل' : 'Customer'}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{orderResult.customerName}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الخدمة' : 'Service'}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{orderResult.serviceName}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'التاريخ' : 'Date'}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{dateStr}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الوقت' : 'Time'}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{timeStr}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-amber-500" />
              <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">{isAr ? 'حالة الطلب' : 'Order Status'}</p>
            </div>
            <p className="text-amber-600 dark:text-amber-300 text-sm">{isAr ? 'قيد المراجعة' : 'Under Review'}</p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">{isAr ? 'ملخص الفاتورة' : 'Invoice Summary'}</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{isAr ? 'السعر الأساسي' : 'Base Price'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(orderResult.amount, currency)}</span>
              </div>
              {orderResult.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-medium">{isAr ? 'الخصم' : 'Discount'}</span>
                  <span className="font-bold text-emerald-600">-{formatPrice(orderResult.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                <span className="text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="text-[#2580eb]">{formatPrice(orderResult.total, currency)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handlePrint}
            variant="secondary"
            className="px-6 py-3 rounded-xl font-medium"
            iconLeft={<Printer size={18} />}
          >
            {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
          </Button>
          <Link href={`/dashboard/invoices`}>
            <Button
              variant="secondary"
              className="px-6 py-3 rounded-xl font-medium"
              iconLeft={<FileText size={18} />}
            >
              {isAr ? 'عرض الفاتورة' : 'View Invoice'}
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="primary"
              className="px-6 py-3 rounded-xl font-medium"
              iconLeft={<Home size={18} />}
            >
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  function renderPaymentStep() {
    return (
      <div className="space-y-6">
        <Card className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'بوابة الدفع' : 'Payment Gateway'}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {isAr
              ? 'سيتم تفعيل بوابة الدفع قريباً. يمكنك متابعة طلبك من خلال لوحة التحكم.'
              : 'Payment gateway will be activated soon. You can track your order from the dashboard.'}
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 inline-flex items-center gap-2 mx-auto">
            <Clock size={18} className="text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'قريباً' : 'Coming Soon'}</span>
          </div>
          <div className="mt-6">
            <Link href="/">
              <Button variant="primary" className="px-8 py-3 rounded-xl font-bold" iconLeft={<Home size={18} />}>
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {step === 'order_created' ? (isAr ? 'تم بنجاح' : 'Success') : (isAr ? 'طلب الخدمة' : 'Service Order')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {step === 'order_created'
              ? (isAr ? 'تفاصيل طلبك' : 'Your order details')
              : (isAr ? `طلب خدمة: ${service.name}` : `Order: ${service.nameEn}`)}
          </p>
        </div>

        {step !== 'order_created' && renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'customer_info' && renderCustomerInfoStep()}
            {step === 'documents' && renderDocumentsStep()}
            {step === 'confirm' && renderConfirmStep()}
            {step === 'order_created' && renderOrderCreated()}
            {step === 'payment' && renderPaymentStep()}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
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

                <div className="p-5 sm:p-6">
                  <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{isAr ? 'السعر الأساسي' : 'Base Price'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(basePrice, currency)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Tag size={13} /> {isAr ? 'الخصم' : 'Discount'}
                        </span>
                        <span className="font-bold text-emerald-600">-{formatPrice(discount, currency)}</span>
                      </div>
                    )}
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                      <span className="text-2xl font-extrabold bg-gradient-to-l from-[#2580eb] to-[#14b8a6] bg-clip-text text-transparent">
                        {formatPrice(finalAmount, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Shield size={13} className="text-emerald-500" />
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{isAr ? 'دفع آمن ومشفر بتقنية SSL' : 'Secure encrypted payment with SSL'}</span>
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
