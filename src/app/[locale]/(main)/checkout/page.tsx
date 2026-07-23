'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, FileText, Upload, X, CreditCard,
  CheckCircle2, ArrowRight, ArrowLeft, Banknote,
  File, FileSpreadsheet, Archive, ImageIcon,
  Tag, Shield, Clock, Star, Copy, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { servicesData } from '@/lib/services-data';
import { useAuthStore } from '@/store/auth-store';
import { useOrderStore } from '@/store/order-store';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

type PaymentMethodType = 'mada' | 'apple_pay' | 'visa_mc' | 'bank_transfer';

const steps = [
  { id: 1, label: 'الخدمة', icon: Star },
  { id: 2, label: 'البيانات', icon: User },
  { id: 3, label: 'المستندات', icon: FileText },
  { id: 4, label: 'الدفع', icon: CreditCard },
  { id: 5, label: 'التأكيد', icon: CheckCircle2 },
];

const countries = [
  { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان' },
  { code: '+974', flag: '🇶🇦', name: 'قطر' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  { code: '+20', flag: '🇪🇬', name: 'مصر' },
  { code: '+964', flag: '🇮🇶', name: 'العراق' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان' },
];

const paymentMethods: { id: PaymentMethodType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'mada', label: 'مدى', icon: <Banknote size={24} />, description: 'البطاقة البنكية المحلية' },
  { id: 'visa_mc', label: 'فيزا / ماستركارد', icon: <CreditCard size={24} />, description: 'البطاقات الائتمانية الدولية' },
  { id: 'apple_pay', label: 'Apple Pay', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>, description: 'الدفع السريع من آبل' },
  { id: 'bank_transfer', label: 'تحويل بنكي', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>, description: 'التحويل المباشر للحساب البنكي' },
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

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AM-${ts}-${rand}`;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const { user } = useAuthStore();
  const { addOrder } = useOrderStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>('visa_mc');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvvc: '' });
  const { currency } = useCurrencyStore();

  const [formData, setFormData] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? sessionStorage.getItem('orderFormData') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        sessionStorage.removeItem('orderFormData');
        return { name: parsed.name || user?.name || '', email: parsed.email || user?.email || '', phone: parsed.phone || '', country: parsed.country || '+966', city: parsed.city || '', idNumber: parsed.idNumber || '', notes: parsed.notes || '' };
      }
    } catch {}
    return { name: user?.name || '', email: user?.email || '', phone: '', country: '+966', city: '', idNumber: '', notes: '' };
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const service = useMemo(() => servicesData.find((s) => s.id === serviceId), [serviceId]);
  const halfPrice = useMemo(() => service ? Math.round(service.price / 2) : 0, [service]);
  const remainingPrice = useMemo(() => service ? service.price - halfPrice : 0, [service, halfPrice]);
  const discount = useMemo(() => service && promoApplied ? halfPrice * 0.1 : 0, [service, promoApplied, halfPrice]);
  const total = useMemo(() => service ? halfPrice - discount : 0, [service, halfPrice, discount]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
    else if (formData.name.trim().length < 3) errors.name = 'الاسم قصير جداً';
    if (!formData.email) errors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.phone) errors.phone = 'رقم الجوال مطلوب';
    else if (formData.phone.length < 7) errors.phone = 'رقم الجوال غير صحيح';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'ALMUNJIZ10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('كود الخصم غير صحيح');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      if (uploadedFiles.length >= 5) return;
      const uploaded: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36),
        file, name: file.name, size: file.size, type: file.type,
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
    });
    e.target.value = '';
  };

  const removeFile = (id: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      if (uploadedFiles.length >= 5) return;
      const uploaded: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36),
        file, name: file.name, size: file.size, type: file.type,
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
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total, currency: 'sar', serviceId: service?.id || '',
          customerEmail: formData.email, customerName: formData.name,
          description: formData.notes, halfPrice: true,
          originalPrice: service?.price, paidAmount: halfPrice, remainingAmount: remainingPrice,
        }),
      });
      await new Promise((r) => setTimeout(r, 2000));
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);
      addOrder({
        id: Date.now().toString(), orderNumber: newOrderNumber,
        serviceName: service?.name || '', serviceId: service?.id || '',
        amount: service?.price || 0, tax: 0, total,
        status: 'PENDING', statusAr: 'قيد الانتظار',
        description: formData.notes,
        attachments: uploadedFiles.map((f) => f.name),
        paymentMethod: selectedPayment,
        createdAt: new Date().toISOString(),
        timeline: [{ status: 'PENDING', label: 'تم استلام الطلب', date: new Date().toISOString() }],
      });
      setCurrentStep(5);
    } catch {
      alert('حدث خطأ أثناء الدفع');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 2 && !validateForm()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 hidden sm:block" />
            <div className="absolute top-5 right-0 h-0.5 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] hidden sm:block transition-all duration-500" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
                  currentStep >= step.id ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] border-transparent text-white shadow-lg shadow-[#2580eb]/25' : 'bg-white border-slate-200 text-slate-400'
                )} animate={currentStep === step.id ? { scale: [1, 1.1, 1] } : {}}>
                  {currentStep > step.id ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                </motion.div>
                <span className={cn('text-xs mt-2 font-medium hidden sm:block', currentStep >= step.id ? 'text-[#2580eb]' : 'text-slate-400')}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <Card glass className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">خدمة مختارة</h2>
                    <div className="bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 rounded-2xl p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white shrink-0"><Star size={24} /></div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                          <p className="text-slate-600 text-sm leading-relaxed mb-4">{service.description}</p>
                          <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2580eb]/10 text-[#2580eb] text-sm font-medium"><Clock size={14} /> {service.duration}</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium"><Tag size={14} /> يبدأ من {formatPrice(service.price, currency)}</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-sm font-medium"><Banknote size={14} /> الدفع الآن: {formatPrice(halfPrice, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {service.features.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-slate-700 mb-3">ما تتضمنه الخدمة:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" />{f}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end"><Button onClick={nextStep} variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>التالي</Button></div>
                  </Card>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <Card glass className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">البيانات الشخصية</h2>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل *</label>
                        <div className="relative">
                          <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="محمد أحمد"
                            className={cn("w-full pr-10 pl-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all", formErrors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                        </div>
                        {formErrors.name && <p className="text-xs text-red-500 mt-1.5">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني *</label>
                        <div className="relative">
                          <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" value={formData.email} dir="ltr" onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="example@email.com"
                            className={cn("w-full pr-10 pl-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all text-left", formErrors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                        </div>
                        {formErrors.email && <p className="text-xs text-red-500 mt-1.5">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">رقم الجوال *</label>
                        <div className="flex gap-2">
                          <select
                            value={formData.country}
                            onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                            className="w-28 px-2 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all"
                          >
                            {countries.map((c) => (
                              <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="tel" dir="ltr" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 15) }))} placeholder="5XXXX XXXX"
                              className={cn("w-full pr-10 pl-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all text-left font-mono", formErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                          </div>
                        </div>
                        {formErrors.phone && <p className="text-xs text-red-500 mt-1.5">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات <span className="text-slate-400">(اختياري)</span></label>
                        <div className="relative">
                          <MessageSquare size={16} className="absolute right-3.5 top-3 text-slate-400" />
                          <textarea value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} placeholder="أي ملاحظات أو تفاصيل إضافية عن طلبك..." rows={4} maxLength={500}
                            className="w-full pr-10 pl-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all resize-none" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-left">{formData.notes.length}/500</p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <Button onClick={prevStep} variant="secondary" iconRight={<ArrowRight size={18} className="rtl:rotate-180" />}>رجوع</Button>
                      <Button onClick={nextStep} variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>التالي</Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <Card glass className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">المستندات المطلوبة</h2>
                    <p className="text-slate-500 text-sm mb-6">ارفع الملفات والمستندات المطلوبة (اختياري)</p>
                    {service.requirements.length > 0 && (
                      <div className="mb-6 bg-sky-50 border border-sky-100 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-sky-700 mb-2">المستندات المطلوبة لهذه الخدمة:</h4>
                        <ul className="space-y-1.5">
                          {service.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-sky-600">
                              <CheckCircle2 size={14} className="shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); }} className="border-2 border-dashed border-slate-300 hover:border-[#2580eb] rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group" onClick={() => document.getElementById('file-upload')?.click()}>
                      <input id="file-upload" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" onChange={handleFileUpload} className="hidden" />
                      <div className="w-16 h-16 rounded-2xl bg-[#2580eb]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Upload size={28} className="text-[#2580eb]" /></div>
                      <p className="text-slate-700 font-medium mb-1">اسحب الملفات هنا أو اضغط للاختيار</p>
                      <p className="text-slate-400 text-sm">PDF, Word, Excel, JPG, PNG, ZIP — حد أقصى 10 ميجا — حتى 5 ملفات</p>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <p className="text-sm font-medium text-slate-700">الملفات المرفقة ({uploadedFiles.length}/5)</p>
                        {uploadedFiles.map((f) => (
                          <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview from user upload */}
                            {f.preview ? <img src={f.preview} alt={f.name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">{getFileIcon(f.type)}</div>}
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 truncate">{f.name}</p><p className="text-xs text-slate-400">{formatFileSize(f.size)}</p></div>
                            <button onClick={() => removeFile(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between mt-8">
                      <Button onClick={prevStep} variant="secondary" iconRight={<ArrowRight size={18} className="rtl:rotate-180" />}>رجوع</Button>
                      <Button onClick={nextStep} variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>التالي</Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <div className="space-y-6">
                    <Card glass className="p-6 sm:p-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">طريقة الدفع</h2>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <motion.button key={method.id} onClick={() => setSelectedPayment(method.id)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-right", selectedPayment === method.id ? "border-[#2580eb] bg-[#2580eb]/5 shadow-lg shadow-[#2580eb]/10" : "border-slate-200 bg-white hover:border-slate-300")}>
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", selectedPayment === method.id ? "bg-[#2580eb]/10 text-[#2580eb]" : "bg-slate-100 text-slate-500")}>{method.icon}</div>
                            <div className="flex-1"><p className="font-bold text-slate-900">{method.label}</p><p className="text-sm text-slate-500">{method.description}</p></div>
                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", selectedPayment === method.id ? "border-[#2580eb]" : "border-slate-300")}>
                              {selectedPayment === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2580eb]" />}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </Card>
                    {(selectedPayment === 'visa_mc' || selectedPayment === 'mada') && (
                      <Card glass className="p-6 sm:p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">بيانات البطاقة</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">رقم البطاقة</label>
                            <input type="text" dir="ltr" placeholder="XXXX XXXX XXXX XXXX" maxLength={19} value={cardData.number}
                              onChange={(e) => { let val = e.target.value.replace(/\D/g, '').slice(0, 16); val = val.replace(/(\d{4})/g, '$1 ').trim(); setCardData((p) => ({ ...p, number: val })); }}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الانتهاء</label>
                              <input type="text" dir="ltr" placeholder="MM/YY" maxLength={5} value={cardData.expiry}
                                onChange={(e) => { let val = e.target.value.replace(/\D/g, '').slice(0, 4); if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2); setCardData((p) => ({ ...p, expiry: val })); }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">CVC</label>
                              <input type="text" dir="ltr" placeholder="123" maxLength={4} value={cardData.cvvc}
                                onChange={(e) => setCardData((p) => ({ ...p, cvvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500"><Shield size={14} className="text-emerald-500" />بياناتك مشفرة وآمنة بتقنية SSL</div>
                        </div>
                      </Card>
                    )}
                    {selectedPayment === 'bank_transfer' && (
                      <Card glass className="p-6 sm:p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">معلومات التحويل البنكي</h3>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">البنك:</span><span className="font-medium">البنك الأهلي السعودي</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">اسم الحساب:</span><span className="font-medium">المنجز للخدمات الإلكترونية</span></div>
                          <div className="flex justify-between items-center"><span className="text-slate-500">رقم IBAN:</span>
                            <div className="flex items-center gap-2"><span className="font-mono font-medium" dir="ltr">SA03 8000 0000 6080 1016 7519</span><button onClick={() => navigator.clipboard.writeText('SA0380000000608010167519')} className="text-[#2580eb] hover:text-[#1d6bd8]"><Copy size={14} /></button></div>
                          </div>
                          <div className="flex justify-between"><span className="text-slate-500">الإجمالي:</span><span className="font-bold text-[#2580eb]">{formatPrice(total, currency)}</span></div>
                        </div>
                      </Card>
                    )}
                    {selectedPayment === 'apple_pay' && (
                      <Card glass className="p-6 sm:p-8 text-center">
                        <div className="py-8">
                          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto mb-4"><svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg></div>
                          <p className="text-slate-600 font-medium">اضغط على الزر أدناه لإتمام الدفع عبر Apple Pay</p>
                        </div>
                      </Card>
                    )}
                  </div>
                  <div className="flex justify-start mt-6"><Button onClick={prevStep} variant="secondary" iconRight={<ArrowRight size={18} className="rtl:rotate-180" />}>رجوع</Button></div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
                  <Card glass className="p-8 sm:p-12 text-center max-w-lg mx-auto">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30"><CheckCircle2 size={48} className="text-white" /></motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">تم تأكيد طلبك بنجاح!</motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-500 mb-8">تم إرسال تفاصيل طلبك إلى بريدك الإلكتروني</motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-slate-500">رقم الطلب</span><span className="font-bold text-[#2580eb] font-mono" dir="ltr">{orderNumber}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">الخدمة</span><span className="font-medium">{service.name}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">المبلغ</span><span className="font-bold">{formatPrice(total, currency)}</span></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mb-8">
                      <h4 className="text-sm font-bold text-slate-700 mb-3">مراحل التنفيذ:</h4>
                      <div className="space-y-2 text-right">
                        {['تم استلام الطلب', 'قيد المراجعة', 'جار التنفيذ', 'جاهز للتسليم'].map((step, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {i === 0 ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                            </div>
                            <span className={i === 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row gap-3">
                      <Link href="/track-order" className="flex-1"><Button variant="primary" fullWidth iconLeft={<FileText size={18} />}>تتبع الطلب</Button></Link>
                      <Link href="/" className="flex-1"><Button variant="secondary" fullWidth iconLeft={<ArrowRight size={18} className="rtl:rotate-180" />}>العودة للرئيسية</Button></Link>
                    </motion.div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentStep < 5 && (
            <div className="hidden lg:block">
              <Card glass className="p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">ملخص الطلب</h3>
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">الخدمة</span><span className="font-medium text-slate-700">{service.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">المدة</span><span className="font-medium text-slate-700">{service.duration}</span></div>
                </div>
                <div className="space-y-3 py-4 border-b border-slate-200">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">السعر الأصلي</span><span className="font-medium text-slate-400 line-through">{formatPrice(service.price, currency)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">الدفع الآن (50%)</span><span className="font-bold text-[#2580eb]">{formatPrice(halfPrice, currency)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">المتبقي عند الاستلام (50%)</span><span className="font-medium text-emerald-600">{formatPrice(remainingPrice, currency)}</span></div>
                  {promoApplied && <div className="flex justify-between text-sm text-emerald-600"><span>خصم ALMUNJIZ10</span><span>-{formatPrice(discount, currency)}</span></div>}
                </div>
                <div className="py-4 border-b border-slate-200">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">كود الخصم</label>
                  <div className="flex gap-2">
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="أدخل الكود" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] text-left font-mono uppercase" dir="ltr" />
                    <button onClick={handleApplyPromo} className="px-4 py-2 rounded-lg bg-[#2580eb]/10 text-[#2580eb] text-sm font-medium hover:bg-[#2580eb]/20 transition-colors">تطبيق</button>
                  </div>
                  {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                  {promoApplied && <p className="text-xs text-emerald-600 mt-1">تم تطبيق الخصم بنجاح!</p>}
                </div>
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-slate-900">المبلغ المطلوب</span>
                    <span className="text-2xl font-bold gradient-text">{formatPrice(total, currency)}</span>
                  </div>
                  <div className="bg-[#2580eb]/5 border border-[#2580eb]/10 rounded-xl p-3 mb-4">
                    <p className="text-xs text-[#2580eb] text-center font-medium">يُخصم 50% كدفعة مقدمة، والباقي يُدفع عند استلام الخدمة</p>
                  </div>
                  <Button onClick={handlePayment} variant="primary" fullWidth loading={loading} className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20" iconLeft={!loading ? <Shield size={18} /> : undefined}>
                    {selectedPayment === 'bank_transfer' ? 'تأكيد الطلب' : `ادفع ${formatPrice(total, currency)}`}
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400"><Shield size={12} />دفع آمن ومشفر</div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {currentStep === 4 && (
          <div className="lg:hidden mt-6">
            <Card glass className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">ملخص الطلب</h3>
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <div className="flex justify-between text-sm"><span className="text-slate-500">الخدمة</span><span className="font-medium text-slate-700">{service.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">المدة</span><span className="font-medium text-slate-700">{service.duration}</span></div>
              </div>
              <div className="space-y-3 py-4 border-b border-slate-200">
                <div className="flex justify-between text-sm"><span className="text-slate-500">السعر الأصلي</span><span className="font-medium text-slate-400 line-through">{formatPrice(service.price, currency)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">الدفع الآن (50%)</span><span className="font-bold text-[#2580eb]">{formatPrice(halfPrice, currency)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">المتبقي عند الاستلام (50%)</span><span className="font-medium text-emerald-600">{formatPrice(remainingPrice, currency)}</span></div>
                {promoApplied && <div className="flex justify-between text-sm text-emerald-600"><span>خصم ALMUNJIZ10</span><span>-{formatPrice(discount, currency)}</span></div>}
              </div>
              <div className="py-4 border-b border-slate-200">
                <label className="text-sm font-medium text-slate-700 mb-2 block">كود الخصم</label>
                <div className="flex gap-2">
                  <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="أدخل الكود" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] text-left font-mono uppercase" dir="ltr" />
                  <button onClick={handleApplyPromo} className="px-4 py-2 rounded-lg bg-[#2580eb]/10 text-[#2580eb] text-sm font-medium hover:bg-[#2580eb]/20 transition-colors">تطبيق</button>
                </div>
                {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
                {promoApplied && <p className="text-xs text-emerald-600 mt-1">تم تطبيق الخصم بنجاح!</p>}
              </div>
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-slate-900">المبلغ المطلوب</span>
                  <span className="text-2xl font-bold gradient-text">{formatPrice(total, currency)}</span>
                </div>
                <div className="bg-[#2580eb]/5 border border-[#2580eb]/10 rounded-xl p-3 mb-4">
                  <p className="text-xs text-[#2580eb] text-center font-medium">يُخصم 50% كدفعة مقدمة، والباقي يُدفع عند استلام الخدمة</p>
                </div>
                <Button onClick={handlePayment} variant="primary" fullWidth loading={loading} className="py-4 text-base font-bold rounded-2xl shadow-xl shadow-[#2580eb]/20" iconLeft={!loading ? <Shield size={18} /> : undefined}>
                  {selectedPayment === 'bank_transfer' ? 'تأكيد الطلب' : `ادفع ${formatPrice(total, currency)}`}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400"><Shield size={12} />دفع آمن ومشفر</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
