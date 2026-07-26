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
  Trash2, Star, Clock, HashIcon, Receipt, ClipboardList,
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
  if (type.includes('image')) return <ImageIcon size={20} className="text-blue-400" />;
  if (type.includes('pdf')) return <FileText size={20} className="text-red-400" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={20} className="text-blue-500" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet size={20} className="text-green-400" />;
  if (type.includes('zip') || type.includes('archive')) return <Archive size={20} className="text-purple-400" />;
  return <File size={20} className="text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const router = useRouter();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
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
    if (!formData.name.trim() || formData.name.trim().length < 3) errors.name = 'الاسم مطلوب (3 أحرف على الأقل)';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.phone || formData.phone.length < 7) errors.phone = 'رقم الجوال غير صحيح';
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
        setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: data.error || 'خطأ في التحقق من الكوبون' });
      }
    } catch {
      setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: 'خطأ في الاتصال' });
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
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الطلب');
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
      throw new Error(data.error || 'فشلت معالجة الدفع');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الدفع');
      setStep('order_created');
    } finally {
      setLoading(false);
    }
  };

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 pt-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#2580eb]" />
          <p className="text-slate-500">جار تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 pt-20">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">خدمة غير موجودة</h2>
          <p className="text-slate-500 mb-6">الخدمة المحددة غير موجودة</p>
          <Link href="/services"><Button variant="primary">العودة للخدمات</Button></Link>
        </Card>
      </div>
    );
  }

  const currencyCode: 'SAR' | 'USD' = currency === 'USD' ? 'USD' : 'SAR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/services" className="hover:text-[#2580eb] transition-colors">الخدمات</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <Link href={`/services/${service.id}`} className="hover:text-[#2580eb] transition-colors">{service.name}</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span className="text-slate-900 dark:text-white font-medium">إتمام الطلب</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">إتمام الطلب</h1>
          <p className="text-slate-500 mt-1">أكمل بياناتك واختر طريقة الدفع</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" dir={dir}>
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white"><Star size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">تفاصيل الخدمة</h2>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center shrink-0"><Star size={24} className="text-[#2580eb]" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{service.name}</h3>
                      <p className="text-sm text-slate-500 mb-3 leading-relaxed">{service.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2580eb]/10 text-[#2580eb] text-xs font-medium">
                          <Clock size={12} /> {service.duration}
                        </span>
                        {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium">
                            <FileText size={12} /> {service.requiredDocuments.length} مستندات مطلوبة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Customer Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><User size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">بيانات العميل</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الاسم الكامل *</label>
                    <div className="relative">
                      <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={formData.name} onChange={(e) => setField('name', e.target.value)} placeholder="محمد أحمد"
                        disabled={step !== 'info'}
                        className={cn("w-full pr-10 pl-4 py-3 rounded-xl border text-sm focus:outline-none transition-all",
                          step !== 'info' ? 'bg-slate-50 opacity-70 cursor-not-allowed' : '',
                          formErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                    </div>
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" dir="ltr" value={formData.email} onChange={(e) => setField('email', e.target.value)} placeholder="email@example.com"
                          disabled={step !== 'info'}
                          className={cn("w-full pr-10 pl-4 py-3 rounded-xl border text-sm focus:outline-none transition-all text-left",
                            step !== 'info' ? 'bg-slate-50 opacity-70 cursor-not-allowed' : '',
                            formErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                      </div>
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">رقم الجوال *</label>
                      <div className="flex gap-2">
                        <select value={formData.phoneCode} onChange={(e) => setField('phoneCode', e.target.value)}
                          disabled={step !== 'info'}
                          className={cn("w-28 px-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] transition-all",
                            step !== 'info' ? 'opacity-70 cursor-not-allowed' : '')}>
                          {phoneCodes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                        <div className="relative flex-1">
                          <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="tel" dir="ltr" value={formData.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="5XXXX XXXX"
                            disabled={step !== 'info'}
                            className={cn("w-full pr-10 pl-4 py-3 rounded-xl border text-sm focus:outline-none transition-all text-left font-mono",
                              step !== 'info' ? 'bg-slate-50 opacity-70 cursor-not-allowed' : '',
                              formErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                        </div>
                      </div>
                      {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* File Upload - only in info step */}
            {step === 'info' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Upload size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">رفع المستندات</h2>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">ارفع الملفات المطلوبة (اختياري) — PDF, DOC, XLS, JPG, PNG, ZIP — حد أقصى 10 ميجا، 5 ملفات</p>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group",
                      isDragOver ? "border-[#2580eb] bg-[#2580eb]/5" : "border-slate-300 hover:border-[#2580eb] hover:bg-slate-50",
                    )}
                  >
                    <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" onChange={handleFileUpload} className="hidden" />
                    <div className="w-14 h-14 rounded-2xl bg-[#2580eb]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Upload size={24} className="text-[#2580eb]" /></div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">اسحب الملفات هنا أو اضغط للاختيار</p>
                    <p className="text-slate-400 text-xs">{uploadedFiles.length}/5 ملفات</p>
                  </div>
                  <AnimatePresence>
                    {uploadedFiles.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2">
                        {uploadedFiles.map((f) => (
                          <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 dark:border-slate-700">
                            {f.preview
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover" />
                              : <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">{getFileIcon(f.type)}</div>
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{f.name}</p>
                              <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
                              {f.progress < 100 && (
                                <div className="w-full h-1 bg-slate-200 rounded-full mt-1">
                                  <motion.div className="h-full bg-[#2580eb] rounded-full" animate={{ width: `${f.progress}%` }} />
                                </div>
                              )}
                            </div>
                            <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {/* Discount Code - only in info step */}
            {step === 'info' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Tag size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">كود الخصم</h2>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }} placeholder="أدخل كود الخصم"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono uppercase" dir="ltr" />
                    <Button onClick={handleApplyPromo} variant="primary" className="px-6">تطبيق</Button>
                  </div>
                  {promoResult && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex items-center gap-2 mt-3 text-sm font-medium", promoResult.valid ? 'text-emerald-600' : 'text-red-500')}>
                      {promoResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {promoResult.message}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Order Created Confirmation */}
            {step === 'order_created' && orderData && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
                <Card className="p-6 border-2 border-[#14b8a6]/30 bg-gradient-to-br from-[#14b8a6]/5 to-white">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center text-[#14b8a6]"><CheckCircle2 size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">تم إنشاء الطلب بنجاح</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardList size={16} className="text-[#2580eb]" />
                        <span className="text-xs font-medium text-slate-500">رقم الطلب</span>
                      </div>
                      <p className="text-lg font-bold text-[#2580eb] font-mono" dir="ltr">{orderData.orderNumber}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt size={16} className="text-[#7c3aed]" />
                        <span className="text-xs font-medium text-slate-500">رقم الفاتورة</span>
                      </div>
                      <p className="text-lg font-bold text-[#7c3aed] font-mono" dir="ltr">{orderData.invoiceNumber}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">الآن يمكنك اختيار طريقة الدفع وإتمام عملية الشراء</p>
                </Card>
              </motion.div>
            )}

            {/* Payment Method */}
            {step === 'order_created' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><CreditCard size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">طريقة الدفع</h2>
                  </div>
                  {displayMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet size={48} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">لا توجد بوابات دفع مفعلة حالياً</p>
                      <p className="text-slate-400 text-sm mt-1">يرجى التواصل مع الإدارة لتفعيل بوابة دفع</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayMethods.map((method) => (
                        <motion.button key={method.id} onClick={() => setSelectedGatewayId(method.id)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-right",
                            selectedGatewayId === method.id
                              ? "border-[#2580eb] bg-[#2580eb]/5 shadow-lg shadow-[#2580eb]/10"
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
                          )}>
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm",
                            selectedGatewayId === method.id ? "bg-[#2580eb]/10 text-[#2580eb]" : "bg-slate-100 text-slate-500"
                          )}>
                            <Wallet size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">{method.name}</p>
                            <p className="text-sm text-slate-500">{method.supportedMethods.join(' · ')}</p>
                          </div>
                          {method.isDefault && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-medium">افتراضي</span>}
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            selectedGatewayId === method.id ? "border-[#2580eb]" : "border-slate-300"
                          )}>
                            {selectedGatewayId === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2580eb]" />}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">ملخص الطلب</h3>
                  <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">اسم الخدمة</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-left max-w-[60%]">{service.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">المدة</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{service.duration}</span>
                    </div>
                  </div>
                  {orderData && (
                    <div className="space-y-3 py-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">رقم الطلب</span>
                        <span className="font-medium text-[#2580eb] font-mono text-xs" dir="ltr">{orderData.orderNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">رقم الفاتورة</span>
                        <span className="font-medium text-[#7c3aed] font-mono text-xs" dir="ltr">{orderData.invoiceNumber}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">السعر الأساسي</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatPrice(basePrice, currencyCode)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>الخصم {promoResult?.discountType === 'percentage' ? `(${promoResult.discount}%)` : ''}</span>
                        <span>-{formatPrice(discount, currencyCode)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">المبلغ النهائي</span>
                      <span className="text-2xl font-bold text-[#2580eb]">{formatPrice(finalAmount, currencyCode)}</span>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {step === 'info' && (
                    <Button onClick={handleCreateOrder} variant="primary" fullWidth loading={loading}
                      className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20"
                      iconLeft={!loading ? <Lock size={18} /> : undefined}>
                      {loading ? 'جار إنشاء الطلب...' : 'تأكيد الطلب'}
                    </Button>
                  )}

                  {step === 'order_created' && (
                    <Button onClick={handlePay} variant="primary" fullWidth loading={loading}
                      disabled={!selectedGatewayId || displayMethods.length === 0}
                      className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20"
                      iconLeft={!loading ? <Lock size={18} /> : undefined}>
                      {loading ? 'جار المعالجة...' : `إكمال الدفع ${formatPrice(finalAmount, currencyCode)}`}
                    </Button>
                  )}

                  {step === 'processing' && (
                    <div className="flex items-center justify-center gap-3 py-4">
                      <Loader2 size={24} className="animate-spin text-[#2580eb]" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">جار معالجة الدفع...</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                    <Shield size={12} />دفع آمن ومشفر بتقنية SSL
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
