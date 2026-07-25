'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Upload, X, CreditCard,
  CheckCircle2, Shield, Tag, FileText, File,
  FileSpreadsheet, Archive, ImageIcon, Loader2,
  MapPin, Globe, Hash, Building, Lock, Wallet,
  ChevronDown, AlertCircle, Trash2, Star, Clock,
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
import type { ServiceData } from '@/lib/services-data';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  phoneCode: string;
  country: string;
  city: string;
  idNumber: string;
  residenceNumber: string;
  passportNumber: string;
  notes: string;
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

const countryList = ['السعودية', 'الإمارات', 'الكويت', 'البحرين', 'عُمان', 'قطر', 'الأردن', 'مصر', 'العراق', 'لبنان'];

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

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AM-${ts}-${rand}`;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const router = useRouter();
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const { dir } = useDirection();
  const { currency } = useCurrencyStore();

  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [activeGateways, setActiveGateways] = useState<Array<{ id: string; name: string; slug: string; isActive: boolean; isDefault: boolean; supportsApplePay?: boolean; supportsGooglePay?: boolean; supportsInstallments?: boolean; logo?: string }>>([]);

  useEffect(() => {
    fetch('/api/services?limit=100')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) setServicesData(data.data); })
      .catch(() => {});
    fetch('/api/admin/gateways')
      .then((r) => r.json())
      .then((data) => { if (data.success) setActiveGateways(data.data.filter((g: { isActive: boolean }) => g.isActive)); })
      .catch(() => {});
  }, []);

  const paymentMethods = useMemo(() => getAvailablePaymentMethods(activeGateways), [activeGateways]);

  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; discountType: 'percentage' | 'fixed'; message: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    phoneCode: '+966',
    country: 'السعودية',
    city: '',
    idNumber: '',
    residenceNumber: '',
    passportNumber: '',
    notes: '',
  }));

  const service = useMemo(() => servicesData.find((s) => s.id === serviceId), [serviceId, servicesData]);

  const displayMethods = useMemo(
    () => paymentMethods.filter((m) => activeGateways.some((g) => g.id === m.id)),
    [paymentMethods, activeGateways],
  );

  const price = service?.price || 0;
  const discount = useMemo(() => {
    if (!promoResult?.valid) return 0;
    if (promoResult.discountType === 'percentage') return Math.round(price * promoResult.discount / 100);
    return promoResult.discount;
  }, [promoResult, price]);
  const total = Math.max(0, price - discount);

  const setField = useCallback((field: keyof FormData, value: string) => {
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
        body: JSON.stringify({ code: promoCode, amount: price, serviceId: serviceId || undefined }),
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
        file, name: file.name, size: file.size, type: file.type, progress: 0,
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

  const handleSubmit = async () => {
    if (!validate() || !service) return;
    setLoading(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          amount: price,
          discount: discount,
          total,
          currency: currency === 'SAR' ? 'SAR' : currency === 'USD' ? 'USD' : currency === 'AED' ? 'AED' : 'SAR',
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: `${formData.phoneCode}${formData.phone}`,
          notes: formData.notes,
          attachments: uploadedFiles.map((f) => f.name),
          promoCode: promoResult?.valid ? promoCode : undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');
      const orderNumber = orderData.data.orderNumber;
      router.push(`/payment/success?orderId=${orderNumber}`);
    } catch {
      router.push(`/payment/failed?orderId=`);
    } finally {
      setLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 pt-20">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">خدمة غير موجودة</h2>
          <p className="text-slate-500 mb-6">الخدمة المحددة غير موجودة</p>
          <Link href="/services"><Button variant="primary">العودة للخدمات</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/services" className="hover:text-[#2580eb] transition-colors">الخدمات</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <Link href={`/services/${service.id}`} className="hover:text-[#2580eb] transition-colors">{service.name}</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span className="text-slate-900 font-medium">إتمام الطلب</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900">إتمام الطلب</h1>
          <p className="text-slate-500 mt-1">أكمل بياناتك واختر طريقة الدفع</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" dir={dir}>
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white"><Star size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">ملخص الخدمة</h2>
                </div>
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center shrink-0"><Star size={24} className="text-[#2580eb]" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1">{service.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#2580eb]/10 text-[#2580eb] text-xs font-medium">
                        <Clock size={12} /> {service.duration}
                      </span>
                      {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-xs font-medium">
                          <FileText size={12} /> {service.requiredDocuments.length} مستندات مطلوبة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Customer Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><User size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">بيانات العميل</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل *</label>
                    <div className="relative">
                      <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={formData.name} onChange={(e) => setField('name', e.target.value)} placeholder="محمد أحمد"
                        className={cn("w-full pr-10 pl-4 py-3 rounded-xl border text-sm focus:outline-none transition-all",
                          formErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                    </div>
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" dir="ltr" value={formData.email} onChange={(e) => setField('email', e.target.value)} placeholder="email@example.com"
                          className={cn("w-full pr-10 pl-4 py-3 rounded-xl border text-sm focus:outline-none transition-all text-left",
                            formErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                      </div>
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">رقم الجوال *</label>
                      <div className="flex gap-2">
                        <select value={formData.phoneCode} onChange={(e) => setField('phoneCode', e.target.value)}
                          className="w-28 px-2 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] transition-all">
                          {phoneCodes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                        <div className="relative flex-1">
                          <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="tel" dir="ltr" value={formData.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="5XXXX XXXX"
                            className={cn("w-full pr-10 pl-4 py-3 rounded-xl border text-sm focus:outline-none transition-all text-left font-mono",
                              formErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                        </div>
                      </div>
                      {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">الدولة</label>
                      <div className="relative">
                        <Globe size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={formData.country} onChange={(e) => setField('country', e.target.value)}
                          className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] transition-all appearance-none">
                          {countryList.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">المدينة</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={formData.city} onChange={(e) => setField('city', e.target.value)} placeholder="الرياض"
                          className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Additional Info - Conditional */}
            {(service.category === 'VISAS' || service.category === 'DOCUMENTS' || service.category === 'LEGALIZATION') && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Hash size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-900">بيانات إضافية</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهوية</label>
                      <input type="text" dir="ltr" value={formData.idNumber} onChange={(e) => setField('idNumber', e.target.value)} placeholder="1XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">رقم الإقامة</label>
                      <input type="text" dir="ltr" value={formData.residenceNumber} onChange={(e) => setField('residenceNumber', e.target.value)} placeholder="اختياري"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">رقم الجواز</label>
                      <input type="text" dir="ltr" value={formData.passportNumber} onChange={(e) => setField('passportNumber', e.target.value)} placeholder="A12345678"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* File Upload */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Upload size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">رفع المستندات</h2>
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
                  <p className="text-slate-700 font-medium mb-1">اسحب الملفات هنا أو اضغط للاختيار</p>
                  <p className="text-slate-400 text-xs">{uploadedFiles.length}/5 ملفات</p>
                </div>
                <AnimatePresence>
                  {uploadedFiles.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2">
                      {uploadedFiles.map((f) => (
                        <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          {f.preview
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover" />
                            : <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">{getFileIcon(f.type)}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{f.name}</p>
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

            {/* Discount Code */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Tag size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">كود الخصم</h2>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromoResult(null); }} placeholder="أدخل كود الخصم"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono uppercase" dir="ltr" />
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

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><CreditCard size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">طريقة الدفع</h2>
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
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm",
                          selectedGatewayId === method.id ? "bg-[#2580eb]/10 text-[#2580eb]" : "bg-slate-100 text-slate-500"
                        )}>
                          <Wallet size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{method.name}</p>
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

            {/* Notes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية <span className="text-slate-400">(اختياري)</span></label>
                <textarea value={formData.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="أي ملاحظات أو تفاصيل إضافية عن طلبك..." rows={3} maxLength={500}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all resize-none" />
                <p className="text-xs text-slate-400 mt-1 text-left">{formData.notes.length}/500</p>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">ملخص الطلب</h3>
                  <div className="space-y-3 pb-4 border-b border-slate-200">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">الخدمة</span><span className="font-medium text-slate-700">{service.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">المدة</span><span className="font-medium text-slate-700">{service.duration}</span></div>
                  </div>
                  <div className="space-y-3 py-4 border-b border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">السعر</span>
                      <span className="font-medium text-slate-900">{formatPrice(price, currency)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>الخصم {promoResult?.discountType === 'percentage' ? `(${promoResult.discount}%)` : ''}</span>
                        <span>-{formatPrice(discount, currency)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">الإجمالي</span>
                      <span className="text-2xl font-bold text-[#2580eb]">{formatPrice(total, currency)}</span>
                    </div>
                  </div>
                  <Button onClick={handleSubmit} variant="primary" fullWidth loading={loading} disabled={!selectedGatewayId || activeGateways.length === 0}
                    className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20"
                    iconLeft={!loading ? <Lock size={18} /> : undefined}>
                    {loading ? 'جار المعالجة...' : `إكمال الدفع ${formatPrice(total, currency)}`}
                  </Button>
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
