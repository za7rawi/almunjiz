'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Upload, X, CreditCard,
  CheckCircle2, Shield, Tag, FileText, File,
  FileSpreadsheet, Archive, ImageIcon, Loader2,
  Globe, Hash, Lock, Wallet, ChevronDown, AlertCircle,
  Trash2, Star, Clock, Sparkles, Info, Zap, Sparkle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { getAvailablePaymentMethods, type PaymentMethodDisplay } from '@/lib/payment-providers';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
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
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  phoneCode: string;
}

interface OrderData {
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

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const router = useRouter();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const { dir } = useDirection();
  const { currency } = useCurrencyStore();

  const [service, setService] = useState<ServiceData | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [activeGateways, setActiveGateways] = useState<Array<{ id: string; name: string; slug: string; displayName?: string; displayNameEn?: string; isActive: boolean; isDefault: boolean; supportsApplePay?: boolean; supportsGooglePay?: boolean; supportsInstallments?: boolean; logo?: string }>>([]);

  const [step, setStep] = useState<'info' | 'order_created' | 'processing'>('info');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; discountType: 'percentage' | 'fixed'; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CustomerForm>(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    phoneCode: '+966',
  }));

  useEffect(() => {
    if (serviceId) {
      fetch('/api/services?limit=100')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            const items = data.data.data || data.data;
            const list = Array.isArray(items) ? items : [];
            const found = list.find((s: ServiceData) => s.id === serviceId);
            if (found) setService(found);
          }
        })
        .catch(() => {})
        .finally(() => setServiceLoading(false));
    } else {
      setServiceLoading(false);
    }
    fetch('/api/admin/gateways')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActiveGateways(data.data.filter((g: { isActive: boolean }) => g.isActive));
      })
      .catch(() => {});
  }, [serviceId]);

  const paymentMethods = useMemo(() => getAvailablePaymentMethods(activeGateways), [activeGateways]);

  const displayMethods = useMemo(
    () => paymentMethods.filter((m) => activeGateways.some((g) => g.id === m.id)),
    [paymentMethods, activeGateways],
  );

  const basePrice = service?.price || 0;
  const discount = useMemo(() => {
    if (!promoResult?.valid) return 0;
    if (promoResult.discountType === 'percentage') return Math.round(basePrice * promoResult.discount / 100);
    return promoResult.discount;
  }, [promoResult, basePrice]);
  const finalAmount = Math.max(0, basePrice - discount);

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
  }, [formData]);

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
      if (uploadedFiles.length >= 5) return;
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

  const uploadFilesToServer = async (orderId: string): Promise<boolean> => {
    const pendingFiles = uploadedFiles.filter((f) => !f.uploaded);
    if (pendingFiles.length === 0) return true;
    setFileUploading(true);
    try {
      const fd = new FormData();
      fd.append('orderId', orderId);
      pendingFiles.forEach((f) => fd.append('files', f.file));
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.data) {
        setUploadedFiles((prev) =>
          prev.map((f) => {
            const serverFile = data.data.find((sf: { name: string; id: string }) => sf.name === f.name);
            if (serverFile) return { ...f, uploaded: true, serverFileId: serverFile.id, progress: 100 };
            return f;
          })
        );
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setFileUploading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!validate() || !service) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          amount: basePrice,
          discount,
          total: finalAmount,
          currency: currency === 'SAR' ? 'SAR' : currency === 'USD' ? 'USD' : currency === 'AED' ? 'AED' : 'SAR',
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: `${formData.phoneCode}${formData.phone}`,
          notes: '',
          attachments: uploadedFiles.map((f) => f.name),
          promoCode: promoResult?.valid ? promoCode : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create order');
      const order: OrderData = {
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
      };
      setOrderData(order);
      setStep('order_created');
      if (uploadedFiles.length > 0) {
        uploadFilesToServer(order.id);
      }
    } catch (err) {
                      setError(err instanceof Error ? err.message : (isAr ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating order'));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!orderData || !selectedGatewayId) return;
    setStep('processing');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.id,
          gatewayId: selectedGatewayId,
          amount: orderData.total,
          currency: orderData.currency,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: `${formData.phoneCode}${formData.phone}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
        return;
      }
      if (data.success && data.data?.clientSecret) {
        router.push(`/payment/success?orderId=${orderData.id}&orderNumber=${encodeURIComponent(orderData.orderNumber)}&gatewayId=${selectedGatewayId}`);
        return;
      }
      if (data.success) {
        router.push(`/payment/success?orderId=${orderData.id}&orderNumber=${encodeURIComponent(orderData.orderNumber)}`);
        return;
      }
      throw new Error(data.error || (isAr ? 'فشلت معالجة الدفع' : 'Payment processing failed'));
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'حدث خطأ أثناء معالجة الدفع' : 'Error processing payment'));
      setStep('order_created');
    } finally {
      setLoading(false);
    }
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#2580eb] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'جارٍ تحميل بيانات الخدمة...' : 'Loading service data...'}</p>
        </motion.div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
        </motion.div>
      </div>
    );
  }

  const currencyCode: 'SAR' | 'USD' = currency === 'USD' ? 'USD' : 'SAR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Breadcrumb & Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-5">
            <Link href="/services" className="hover:text-[#2580eb] transition-colors">{isAr ? 'الخدمات' : 'Services'}</Link>
            <span>/</span>
            <Link href={`/services/${service.id}`} className="hover:text-[#2580eb] transition-colors">{isAr ? service.name : (service.nameEn || service.name)}</Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">{isAr ? 'إتمام الطلب' : 'Checkout'}</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{isAr ? 'إتمام الطلب' : 'Checkout'}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base">{isAr ? 'أكمل بياناتك واختر طريقة الدفع' : 'Complete your details and choose a payment method'}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Progress Steps ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="mb-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              {[
                { label: isAr ? 'بيانات العميل' : 'Customer Info', icon: User, done: step !== 'info' },
                { label: isAr ? 'تأكيد الطلب' : 'Confirm Order', icon: CheckCircle2, done: step === 'processing' },
                { label: isAr ? 'الدفع' : 'Payment', icon: CreditCard, done: false },
              ].map((s, i) => {
                const StepIcon = s.icon;
                const isCurrent = (i === 0 && step === 'info') || (i === 1 && step === 'order_created') || (i === 2 && step === 'processing');
                return (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                        s.done && "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-200",
                        isCurrent && !s.done && "bg-gradient-to-br from-[#2580eb] to-[#1a6dd1] text-white shadow-lg shadow-[#2580eb]/30 ring-4 ring-[#2580eb]/10",
                        !s.done && !isCurrent && "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500",
                      )}>
                        {s.done ? <CheckCircle2 size={20} className="sm:w-5 sm:h-5" /> : <StepIcon size={18} className="sm:w-5 sm:h-5" />}
                      </div>
                      <span className={cn(
                        "text-[10px] sm:text-xs mt-2 font-semibold transition-colors",
                        s.done && "text-emerald-600",
                        isCurrent && !s.done && "text-[#2580eb]",
                        !s.done && !isCurrent && "text-slate-400 dark:text-slate-500",
                      )}>
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </span>
                    </div>
                    {i < 2 && (
                      <div className="flex-1 mx-2 sm:mx-3 mb-6">
                        <div className="h-0.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: s.done ? '100%' : '0%' }}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" dir={dir}>
          <div className="lg:col-span-2 space-y-5">

            {/* ── Service Details ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
                    <Star size={20} className="text-[#2580eb]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'تفاصيل الخدمة' : 'Service Details'}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'معلومات الخدمة المختارة' : 'Selected service information'}</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 rounded-xl border border-[#2580eb]/10">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center shrink-0">
                      <Star size={24} className="text-[#2580eb]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{isAr ? service.name : (service.nameEn || service.name)}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{isAr ? service.description : (service.descriptionEn || service.description)}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#2580eb]/10 text-[#2580eb] text-xs font-semibold">
                          <Clock size={12} /> {service.duration}
                        </span>
                        {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            <FileText size={12} /> {service.requiredDocuments.length} {isAr ? 'مستندات مطلوبة' : 'Required Documents'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ── Customer Information ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
                    <User size={20} className="text-[#2580eb]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'بيانات العميل' : 'Customer Information'}</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'أدخل بياناتك الشخصية' : 'Enter your personal details'}</p>
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
                        disabled={step !== 'info'}
                        className={cn(
                          formErrors.name ? inputError : inputNormal,
                          "pr-11",
                          step !== 'info' && "bg-slate-50 opacity-70 cursor-not-allowed",
                        )}
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
                        <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />                        <input
                          type="email"
                          dir="ltr"
                          value={formData.email}
                          onChange={(e) => setField('email', e.target.value)}
                          placeholder="email@example.com"
                          disabled={step !== 'info'}
                          className={cn(
                            formErrors.email ? inputError : inputLtr,
                            "pr-11",
                            step !== 'info' && "bg-slate-50 opacity-70 cursor-not-allowed",
                          )}
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
                          disabled={step !== 'info'}
                          className="w-24 px-2 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all appearance-none text-center"
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
                            disabled={step !== 'info'}
                            className={cn(
                              formErrors.phone ? inputError : inputLtr,
                              "pr-11",
                              step !== 'info' && "bg-slate-50 opacity-70 cursor-not-allowed",
                            )}
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
                </div>
              </Card>
            </motion.div>

            {/* ── File Upload ── */}
            {step === 'info' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400/10 to-amber-500/10 flex items-center justify-center">
                      <Upload size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'رفع المستندات' : 'Upload Documents'}</h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'ارفع الملفات المطلوبة (اختياري)' : 'Upload required files (optional)'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 mb-4">PDF, DOC, XLS, JPG, PNG, ZIP — {isAr ? 'حد أقصى 10 ميجا — حتى 5 ملفات' : 'Max 10MB — Up to 5 files'}</p>

                  {/* Drop Zone */}
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
                    <motion.div
                      animate={isDragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center mx-auto mb-4"
                    >
                      <Upload size={28} className={cn("transition-colors", isDragOver ? "text-[#2580eb]" : "text-slate-400 group-hover:text-[#2580eb]")} />
                    </motion.div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      {isDragOver ? (isAr ? 'أفلت الملفات هنا' : 'Drop files here') : (isAr ? 'اسحب الملفات هنا أو اضغط للاختيار' : 'Drag files here or click to select')}
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
                            className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors group"
                          >
                            {f.preview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={f.preview} alt={f.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-600" />
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
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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

            {/* ── Promo Code ── */}
            {step === 'info' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-4 focus:ring-[#2580eb]/10 transition-all text-left font-mono uppercase tracking-wider hover:border-slate-300 dark:hover:border-slate-500"
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

            {/* ── Order Created Confirmation ── */}
            <AnimatePresence>
              {step === 'order_created' && orderData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', duration: 0.5 }}>
                  <Card className="p-5 sm:p-7 border-2 border-[#14b8a6]/30 bg-gradient-to-br from-[#14b8a6]/5 to-white dark:from-[#14b8a6]/10 dark:to-slate-800">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'تم إنشاء الطلب بنجاح' : 'Order Created Successfully'}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'يمكنك الآن اختيار طريقة الدفع' : 'You can now choose a payment method'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'رقم الطلب' : 'Order Number'}</p>
                        <p className="text-lg font-bold text-[#2580eb] font-mono" dir="ltr">{orderData.orderNumber}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</p>
                        <p className="text-lg font-bold text-[#7c3aed] font-mono" dir="ltr">{orderData.invoiceNumber}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">{isAr ? 'الآن يمكنك اختيار طريقة الدفع وإتمام عملية الشراء' : 'You can now choose a payment method and complete the purchase'}</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Payment Method ── */}
            <AnimatePresence>
              {step === 'order_created' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: 0.1 }}>
                  <Card className="p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7c3aed]/10 to-[#2580eb]/10 flex items-center justify-center">
                        <CreditCard size={20} className="text-[#7c3aed]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'اختر طريقة الدفع المناسبة' : 'Choose the appropriate payment method'}</p>
                      </div>
                    </div>
                    {displayMethods.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                          <Wallet size={32} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold mb-1">{isAr ? 'لا توجد بوابات دفع مفعلة' : 'No active payment gateways'}</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{isAr ? 'يرجى التواصل مع الإدارة لتفعيل بوابة دفع' : 'Please contact admin to activate a payment gateway'}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayMethods.map((method) => {
                          const isSelected = selectedGatewayId === method.id;
                          return (
                            <motion.button
                              key={method.id}
                              onClick={() => setSelectedGatewayId(method.id)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-right",
                                isSelected
                                  ? "border-[#2580eb] bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 shadow-lg shadow-[#2580eb]/10"
                                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md",
                              )}
                            >
                              <div className={cn(
                                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                                isSelected ? "bg-[#2580eb]/10" : "bg-slate-100 dark:bg-slate-600",
                              )}>
                                <Wallet size={24} className={isSelected ? "text-[#2580eb]" : "text-slate-400"} />
                              </div>
                              <div className="flex-1 text-right">
                                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{isAr ? method.name : method.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{method.supportedMethods.join(' · ')}</p>
                              </div>
                              {method.isDefault && (
                                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">{isAr ? 'افتراضي' : 'Default'}</span>
                              )}
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                isSelected ? "border-[#2580eb] bg-[#2580eb]" : "border-slate-300",
                              )}>
                                {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
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
                      <span className="text-slate-500 dark:text-slate-400">{isAr ? 'السعر الأساسي' : 'Base Price'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(basePrice, currencyCode)}</span>
                    </div>
                    {discount > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center text-sm">
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <Tag size={13} /> {isAr ? 'الخصم' : 'Discount'}
                        </span>
                        <span className="font-bold text-emerald-600">-{formatPrice(discount, currencyCode)}</span>
                      </motion.div>
                    )}
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                      <motion.span
                        key={finalAmount}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-extrabold bg-gradient-to-l from-[#2580eb] to-[#14b8a6] bg-clip-text text-transparent"
                      >
                        {formatPrice(finalAmount, currencyCode)}
                      </motion.span>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm mb-4">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2.5 mt-2">
                    {step === 'info' && (
                      <Button
                        onClick={handleCreateOrder}
                        variant="primary"
                        fullWidth
                        loading={loading}
                        className="py-4 text-sm font-bold rounded-xl shadow-xl shadow-[#2580eb]/20 hover:shadow-[#2580eb]/30 transition-shadow"
                        iconLeft={!loading ? <Lock size={16} /> : undefined}
                      >
                        {loading ? (isAr ? 'جار إنشاء الطلب...' : 'Creating order...') : (isAr ? 'تأكيد الطلب' : 'Confirm Order')}
                      </Button>
                    )}

                    {step === 'order_created' && (
                      <Button
                        onClick={handlePay}
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={!selectedGatewayId || displayMethods.length === 0}
                        className="py-4 text-sm font-bold rounded-xl shadow-xl shadow-[#2580eb]/20 hover:shadow-[#2580eb]/30 transition-shadow"
                        iconLeft={!loading ? <Lock size={16} /> : undefined}
                      >
                        {loading ? (isAr ? 'جار المعالجة...' : 'Processing...') : `${isAr ? 'إكمال الدفع' : 'Pay'} ${formatPrice(finalAmount, currencyCode)}`}
                      </Button>
                    )}

                    {step === 'processing' && (
                      <div className="flex items-center justify-center gap-3 py-4">
                        <Loader2 size={24} className="animate-spin text-[#2580eb]" />
                        <span className="text-slate-600 dark:text-slate-400 font-medium text-sm">{isAr ? 'جار معالجة الدفع...' : 'Processing payment...'}</span>
                      </div>
                    )}
                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
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
