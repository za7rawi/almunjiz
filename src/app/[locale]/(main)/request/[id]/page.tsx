'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Upload, X, CreditCard, CheckCircle,
  Shield, Tag, FileText, File, FileSpreadsheet, Archive,
  ImageIcon, MapPin, Globe, Hash, Lock, Wallet, ChevronDown,
  AlertCircle, Trash2, Star, Clock, ArrowLeft, ArrowRight,
  ClipboardList, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRequestProgressStore } from '@/store/request-progress-store';
import { useAuthStore } from '@/store/auth-store';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { getAvailablePaymentMethods, type PaymentMethodDisplay } from '@/lib/payment-providers';
import type { ServiceData } from '@/lib/services-data';

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

const STEPS = ['بيانات العميل', 'المستندات', 'مراجعة الطلب', 'الدفع'];

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

const inputClass = "w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all";
const inputLtrClass = cn(inputClass, "text-left font-mono", "direction: ltr");

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { currency } = useCurrencyStore();
  const { saveProgress, getProgress, clearProgress } = useRequestProgressStore();

  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [activeGateways, setActiveGateways] = useState<GatewayData[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services?limit=100')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) { const items = data.data.data || data.data; setServicesData(Array.isArray(items) ? items : []); } })
      .catch(() => {});
    fetch('/api/admin/gateways')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActiveGateways(data.data.filter((g: GatewayData) => g.isActive));
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
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/request/${id}`);
    } else {
      setRedirecting(false);
      if (user) {
        const saved = getProgress(id);
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
        } else {
          setFormData((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
        }
      }
    }
  }, [isAuthenticated, user, router, id]);

  useEffect(() => {
    if (!service || !isAuthenticated || redirecting) return;
    const timer = setTimeout(() => {
      saveProgress(id, {
        serviceId: id,
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
      if (!formData.name.trim() || formData.name.trim().length < 3) errors.name = 'الاسم مطلوب (3 أحرف على الأقل)';
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'البريد الإلكتروني غير صحيح';
      if (!formData.phone || formData.phone.length < 7) errors.phone = 'رقم الجوال غير صحيح';
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
        setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: data.error || 'خطأ في التحقق من الكوبون' });
      }
    } catch {
      setPromoResult({ valid: false, discount: 0, discountType: 'percentage', message: 'خطأ في الاتصال' });
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
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');

      const orderId = orderData.data.id;

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
          router.push(`/payment/success?orderId=${orderId}&gatewayId=${selectedGatewayId}&clientSecret=${payData.data.clientSecret}`);
          return;
        }
      }

      clearProgress(id);
      router.push(`/payment/success?orderId=${orderId}`);
    } catch {
      router.push('/payment/failed');
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2580eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><X size={32} className="text-red-500" /></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">خدمة غير موجودة</h2>
          <p className="text-slate-500 mb-6">الخدمة المحددة غير موجودة</p>
          <Link href="/services"><Button variant="primary">العودة للخدمات</Button></Link>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/services" className="hover:text-[#2580eb] transition-colors">الخدمات</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <Link href={`/services/${service.id}`} className="hover:text-[#2580eb] transition-colors">{service.name}</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span className="text-slate-900 font-medium">طلب خدمة</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900">طلب خدمة: {service.name}</h1>
          <p className="text-slate-500 mt-1">{formatPrice(service.price, currency)} — {service.duration}</p>
        </motion.div>

        {/* Steps Indicator */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[320px] max-w-2xl mx-auto px-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all",
                    i < step ? "bg-emerald-500 text-white" : i === step ? "bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/30" : "bg-slate-200 text-slate-500"
                  )}>
                    {i < step ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={cn("text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium hidden sm:block", i <= step ? "text-slate-900" : "text-slate-400")}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("w-16 sm:w-24 h-0.5 mx-2 mb-6", i < step ? "bg-emerald-500" : "bg-slate-200")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 0: Customer Info */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><User size={18} className="sm:w-5 sm:h-5" /></div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">بيانات العميل</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل *</label>
                        <div className="relative">
                          <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" value={formData.name} onChange={(e) => setField('name', e.target.value)} placeholder="محمد أحمد"
                            className={cn(inputClass, formErrors.name && 'border-red-400 bg-red-50/50')} />
                        </div>
                        {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني *</label>
                          <div className="relative">
                            <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="email" dir="ltr" value={formData.email} onChange={(e) => setField('email', e.target.value)} placeholder="email@example.com"
                              className={cn(inputLtrClass, formErrors.email && 'border-red-400 bg-red-50/50')} />
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
                                className={cn(inputLtrClass, formErrors.phone && 'border-red-400 bg-red-50/50')} />
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
                              className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Service-specific fields */}
                  {(service.category === 'VISAS' || service.category === 'GOVERNMENT' || service.category === 'DOCUMENTS') && (
                    <Card className="p-6 mt-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Hash size={20} /></div>
                        <h2 className="text-lg font-bold text-slate-900">بيانات إضافية</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهوية</label>
                          <input type="text" dir="ltr" value={formData.idNumber} onChange={(e) => setField('idNumber', e.target.value)} placeholder="1XXXXXXXXX"
                            className={inputLtrClass} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">رقم الإقامة</label>
                          <input type="text" dir="ltr" value={formData.residenceNumber} onChange={(e) => setField('residenceNumber', e.target.value)} placeholder="اختياري"
                            className={inputLtrClass} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">رقم الجواز</label>
                          <input type="text" dir="ltr" value={formData.passportNumber} onChange={(e) => setField('passportNumber', e.target.value)} placeholder="A12345678"
                            className={inputLtrClass} />
                        </div>
                      </div>
                    </Card>
                  )}

                  {service.category === 'CONTRACTS' && (
                    <Card className="p-6 mt-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Hash size={20} /></div>
                        <h2 className="text-lg font-bold text-slate-900">بيانات العقد</h2>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">اسم الشركة</label>
                          <input type="text" value={formData.companyName} onChange={(e) => setField('companyName', e.target.value)} placeholder="اسم الشركة"
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">المهنة</label>
                          <input type="text" value={formData.profession} onChange={(e) => setField('profession', e.target.value)} placeholder="المهنة المطلوبة"
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">بيانات العامل</label>
                          <textarea value={formData.workerData} onChange={(e) => setField('workerData', e.target.value)} placeholder="اسم العامل، الجنسية، رقم الجواز..." rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all resize-none" />
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات إضافية <span className="text-slate-400">(اختياري)</span></label>
                    <textarea value={formData.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="أي ملاحظات أو تفاصيل إضافية عن طلبك..." rows={3} maxLength={500}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all resize-none" />
                    <p className="text-xs text-slate-400 mt-1 text-left">{formData.notes.length}/500</p>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Documents */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Upload size={20} /></div>
                      <h2 className="text-lg font-bold text-slate-900">رفع المستندات</h2>
                    </div>
                    {service.requiredDocuments && service.requiredDocuments.length > 0 && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-2">المستندات المطلوبة:</p>
                        <ul className="space-y-1">
                          {service.requiredDocuments.map((doc, i) => (
                            <li key={i} className="text-sm text-blue-600 flex items-center gap-2">
                              <CheckCircle size={12} /> {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm text-slate-500 mb-4">ارفع الملفات المطلوبة — PDF, DOC, XLS, JPG, PNG, ZIP — حد أقصى 10 ميجا، 5 ملفات</p>
                    <div
                      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
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
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle size={20} /></div>
                      <h2 className="text-lg font-bold text-slate-900">مراجعة الطلب</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">الخدمة</p>
                        <p className="font-bold text-slate-900">{service.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{service.duration}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">الاسم</p>
                          <p className="font-medium text-slate-900">{formData.name}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">البريد</p>
                          <p className="font-medium text-slate-900" dir="ltr">{formData.email}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">الجوال</p>
                          <p className="font-medium text-slate-900" dir="ltr">{formData.phoneCode} {formData.phone}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">المدينة</p>
                          <p className="font-medium text-slate-900">{formData.city || formData.country}</p>
                        </div>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-2">المستندات المرفوعة ({uploadedFiles.length})</p>
                          <div className="space-y-1">
                            {uploadedFiles.map((f) => (
                              <p key={f.id} className="text-sm text-slate-700 flex items-center gap-2">
                                <FileText size={14} className="text-slate-400" /> {f.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {formData.notes && (
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">ملاحظات</p>
                          <p className="text-sm text-slate-700">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Discount Code */}
                  <Card className="p-6 mt-6">
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
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><CreditCard size={20} /></div>
                      <h2 className="text-lg font-bold text-slate-900">طريقة الدفع</h2>
                    </div>
                    {displayMethods.length === 0 ? (
                      <div className="text-center py-8">
                        <Wallet size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">لا توجد بوابات دفع مفعلة حالياً</p>
                        <p className="text-slate-400 text-sm mt-1">يمكنك إكمال الطلب وسيتم التواصل معك لترتيب الدفع</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayMethods.map((method) => (
                          <motion.button key={method.id} onClick={() => { setSelectedGatewayId(method.id); setFormErrors((p) => { const n = { ...p }; delete n.gateway; return n; }); }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
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
                    {formErrors.gateway && <p className="text-xs text-red-500 mt-2">{formErrors.gateway}</p>}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">ملخص الطلب</h3>
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center shrink-0">
                      <Star size={20} className="text-[#2580eb]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.duration}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 py-4 border-b border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">السعر</span>
                    <span className="font-medium text-slate-900">{formatPrice(price, currency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>الخصم</span>
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
                <div className="space-y-2">
                  {step < 3 ? (
                    <Button onClick={nextStep} variant="primary" fullWidth className="py-3 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20"
                      iconRight={<ArrowLeft size={18} className="rtl:rotate-180" />}>
                      {step === 2 ? 'متابعة إلى الدفع' : 'التالي'}
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} variant="primary" fullWidth loading={loading}
                      disabled={activeGateways.length > 0 && !selectedGatewayId}
                      className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20"
                      iconLeft={!loading ? <Lock size={18} /> : undefined}>
                      {loading ? 'جار المعالجة...' : 'إتمام الطلب'}
                    </Button>
                  )}
                  {step > 0 && (
                    <Button onClick={prevStep} variant="ghost" fullWidth className="py-3"
                      iconRight={<ArrowRight size={18} className="rtl:rotate-180" />}>
                      السابق
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                  <Shield size={12} />دفع آمن ومشفر بتقنية SSL
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
