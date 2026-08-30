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
import { useCartStore } from '@/store/cart-store';
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

interface LineItem {
  serviceId: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  duration?: string;
  durationEn?: string;
  image?: string | null;
  qty: number;
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

interface GatewayInfo {
  slug: string;
  displayName: string;
  displayNameEn: string;
  logo?: string | null;
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
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const [servicesMap, setServicesMap] = useState<Record<string, Partial<ServiceData>>>({});
  const [serviceLoading, setServiceLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(true);

  const [step, setStep] = useState<'customer_info' | 'documents' | 'confirm' | 'payment'>('customer_info');
  const [orderResults, setOrderResults] = useState<OrderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [gateways, setGateways] = useState<GatewayInfo[]>([]);
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
        router.replace(`/login?redirect=${encodeURIComponent(`/checkout${serviceId ? `?service=${serviceId}` : ''}`)}`);
      } else if (_hydrated) {
        setRedirecting(false);
      }
    };
    sync();
  }, [_hydrated, isAuthenticated, router, serviceId]);

  const lines = useMemo<LineItem[]>(() => {
    if (serviceId) {
      return [{ serviceId, slug: serviceId, nameAr: '', nameEn: '', price: 0, qty: 1 }];
    }
    return cartItems.map((i) => ({
      serviceId: i.serviceId,
      slug: i.slug,
      nameAr: i.nameAr,
      nameEn: i.nameEn,
      price: i.price,
      duration: i.duration,
      durationEn: i.durationEn,
      image: i.image,
      qty: i.qty,
    }));
  }, [serviceId, cartItems]);

  useEffect(() => {
    const idArr = Array.from(new Set<string>(serviceId ? [serviceId] : cartItems.map((i) => i.serviceId)));
    Promise.all(
      idArr.map((id) =>
        fetch(`/api/services/${id}?brief=true`)
          .then((r) => r.json())
          .then((d) => (d.success ? d.data : null))
          .catch(() => null)
      )
    )
      .then((results) => {
        const map: Record<string, Partial<ServiceData>> = {};
        results.forEach((service, i) => {
          if (service) map[idArr[i]] = service;
        });
        setServicesMap(map);
      })
      .finally(() => setServiceLoading(false));
  }, [serviceId, cartItems]);

  useEffect(() => {
    fetch('/api/storefront')
      .then((r) => r.json())
      .then((d) => {
        if (d?.meta?.payments) setGateways(d.meta.payments as GatewayInfo[]);
      })
      .catch(() => {});
  }, []);

  const resolved = useMemo<LineItem[]>(
    () =>
      lines.map((l) => {
        const s = servicesMap[l.serviceId];
        if (!s) return l;
        return {
          ...l,
          nameAr: s.name || l.nameAr,
          nameEn: s.nameEn || l.nameEn,
          price: Number(s.price) ?? l.price,
          duration: s.duration || l.duration,
          durationEn: s.durationEn || l.durationEn,
          image: s.image || l.image,
        };
      }),
    [lines, servicesMap]
  );

  const missingService = !serviceLoading && resolved.some((l) => !l.nameAr && !l.nameEn);
  const totalUnits = resolved.reduce((sum, l) => sum + l.qty, 0);
  const singleUnit = totalUnits === 1;

  const discount = useMemo(() => {
    if (!promoResult?.valid || !singleUnit) return 0;
    const linePrice = resolved[0]?.price || 0;
    if (promoResult.discountType === 'percentage') return Math.round(linePrice * promoResult.discount / 100);
    return Math.min(promoResult.discount, linePrice);
  }, [promoResult, singleUnit, resolved]);

  const subtotal = resolved.reduce((s, l) => s + l.price * l.qty, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const requiredDocsList = useMemo(
    () =>
      resolved
        .map((l) => {
          const s = servicesMap[l.serviceId];
          const docs = (isAr ? s?.requiredDocuments : s?.requiredDocumentsEn) || s?.requiredDocuments || [];
          return { serviceId: l.serviceId, nameAr: l.nameAr, nameEn: l.nameEn, docs: docs as string[] };
        })
        .filter((g) => g.docs.length > 0),
    [resolved, servicesMap, isAr]
  );

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const goToStep = (idx: number) => {
    const locked = orderResults.length > 0;
    const maxReachable = locked ? 3 : 2;
    if (idx <= maxReachable && idx >= 0 && !loading && (!locked || idx === 3)) {
      setStep(STEPS[idx].key as typeof step);
      setError('');
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
    if (!promoCode.trim() || !singleUnit || !resolved[0]) return;
    const linePrice = resolved[0].price || 0;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: linePrice, serviceId: resolved[0].serviceId }),
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

  const mapOrderResult = (data: Record<string, unknown>, line: LineItem): OrderResult => ({
    id: data.id as string,
    orderNumber: data.orderNumber as string,
    invoiceNumber: data.invoiceNumber as string,
    amount: Number(data.amount),
    discount: Number(data.discount),
    total: Number(data.total),
    currency: (data.currency as string) || 'SAR',
    status: (data.status as string) || 'PENDING',
    paymentStatus: (data.paymentStatus as string) || 'PENDING',
    createdAt: (data.createdAt as string) || new Date().toISOString(),
    customerName: formData.name,
    serviceName: isAr ? line.nameAr : line.nameEn || line.nameAr,
  });

  const handleCreateOrder = async () => {
    if (!validate() || resolved.length === 0) return;
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

      const units = resolved.flatMap((l) => Array<LineItem>(l.qty).fill(l));
      const created: OrderResult[] = [];

      for (let i = 0; i < units.length; i++) {
        const line = units[i];
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: line.serviceId,
            amount: line.price,
            discount: 0,
            total: line.price,
            currency: 'SAR',
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: `${formData.phoneCode}${formData.phone}`,
            notes: '',
            attachments: uploadedFiles.map((f) => f.name),
            fileAttachmentIds,
            promoCode: i === 0 && singleUnit && promoResult?.valid ? promoCode : undefined,
          }),
        });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || (isAr ? 'فشل إنشاء الطلب' : 'Failed to create order'));
        }
        created.push(mapOrderResult(data.data, line));
      }

      if (created.length === 0) {
        throw new Error(isAr ? 'لم يتم إنشاء أي طلب' : 'No orders were created');
      }

      setOrderResults(created);
      if (!serviceId) {
        clearCart();
        setCartOpen(false);
      }
      setStep('payment');
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

  if (missingService || resolved.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-20">
        <div>
          <Card className="max-w-md w-full mx-4 p-10 text-center dark:bg-slate-800">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center mx-auto mb-5">
              <X size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'لا توجد خدمات للطلب' : 'Nothing to order'}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{isAr ? 'سلة التسوق فارغة أو الخدمة غير متوفرة' : 'Your cart is empty or the service is unavailable'}</p>
            <Link href="/services">
              <Button variant="primary" className="rounded-xl px-8">{isAr ? 'تصفح الخدمات' : 'Browse Services'}</Button>
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

  function renderLineItems() {
    return (
      <div className="space-y-2.5">
        {resolved.map((l) => (
          <div key={l.serviceId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
            {l.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.image} alt={isAr ? l.nameAr : l.nameEn} loading="lazy" className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-600" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <Zap size={18} className="text-[#2580eb]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{isAr ? l.nameAr : l.nameEn}</p>
              <p className="text-xs text-slate-400">{isAr ? 'الكمية' : 'Qty'}: {l.qty}</p>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">{formatPrice(l.price * l.qty, currency)}</span>
          </div>
        ))}
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

        {singleUnit && (
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
        )}

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
    return (
      <div className="space-y-6">
        {requiredDocsList.length > 0 && (
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
            <div className="space-y-3">
              {requiredDocsList.map((group) => (
                <div key={group.serviceId} className="rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{isAr ? group.nameAr : group.nameEn}</p>
                  </div>
                  <div className="space-y-2 p-3">
                    {group.docs.map((doc: string, i: number) => {
                      const matched = uploadedFiles.some((f) => f.uploaded && f.name.toLowerCase().includes(doc.substring(0, 10).toLowerCase()));
                      return (
                        <div key={i} className="flex items-center gap-3">
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
                </div>
              ))}
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
                <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'عدد الطلبات' : 'Orders'}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{totalUnits}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-2">{isAr ? 'الخدمات المطلوبة' : 'Services'}</p>
              {renderLineItems()}
              <div className="flex justify-between items-center text-sm font-bold mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <span className="text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="text-[#2580eb]">{formatPrice(subtotal, currency)}</span>
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
            {loading ? (isAr ? 'جاري إنشاء الطلبات...' : 'Creating orders...') : (isAr ? 'تأكيد الطلبات' : 'Confirm Orders')}
          </Button>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          {isAr ? 'يتم التحقق من الأسعار النهائية على الخادم عند تأكيد الطلب.' : 'Final prices are verified on the server when you confirm.'}
        </p>
      </div>
    );
  }

  function renderPaymentStep() {
    if (orderResults.length === 0) return null;
    const ordersTotal = orderResults.reduce((s, o) => s + Number(o.total), 0);
    const createdDate = new Date(orderResults[0].createdAt);
    const dateStr = createdDate.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = createdDate.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="space-y-6">
        <Card className="p-6 sm:p-8 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-900/20 dark:via-slate-800 dark:to-emerald-900/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'تم إرسال طلبك بنجاح' : 'Orders Submitted Successfully'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'شكراً لك، تم استلام طلباتك وسيتم مراجعتها من قبل فريقنا' : 'Thank you, your orders have been received and will be reviewed by our team'}</p>
          </div>

          <div className="space-y-3 mb-6">
            {orderResults.map((o, i) => (
              <div key={o.id} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الطلب' : 'Order'} #{i + 1} — {o.serviceName}</p>
                  <p className="text-lg font-bold text-[#2580eb] font-mono" dir="ltr">{o.orderNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</p>
                  <p className="text-lg font-bold text-[#7c3aed] font-mono" dir="ltr">{o.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الحالة' : 'Status'}</p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm">{isAr ? 'قيد المراجعة' : 'Under Review'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium mb-1">{isAr ? 'الإجمالي' : 'Total'}</p>
                  <p className="font-bold text-[#2580eb]">{formatPrice(o.total, currency)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 dark:text-slate-500">{dateStr} — {timeStr}</span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-600 pt-4 mb-4">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">{isAr ? 'ملخص الفواتير' : 'Invoice Summary'}</h4>
            <div className="space-y-2">
{orderResults.map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{o.serviceName}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(o.total, currency)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                <span className="text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="text-[#2580eb]">{formatPrice(ordersTotal, currency)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 flex items-center justify-center">
              <Wallet size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{isAr ? 'بوابة الدفع' : 'Payment Gateway'}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{isAr ? 'خيارات الدفع المتاحة' : 'Available payment options'}</p>
            </div>
          </div>

          <div className="space-y-2.5 mb-4">
            {gateways.length > 0 ? (
              gateways.map((g) => (
                <div key={g.slug} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  {g.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.logo} alt="" className="w-9 h-9 rounded-lg object-contain border border-slate-200 dark:border-slate-600 bg-white" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                      <Wallet size={16} className="text-[#2580eb]" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">{isAr ? g.displayName : g.displayNameEn}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                    {isAr ? 'متاح عبر لوحة التحكم' : 'Available via dashboard'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 inline-flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'قريباً' : 'Coming Soon'}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            {isAr
              ? 'سيتم إشعاركم بالدفع الإلكتروني فور توفره. حالياً تتم متابعة الطلبات من خلال لوحة التحكم وسيتواصل معكم فريقنا لإتمام الدفع إذا لزم.'
              : 'You will be notified once online payment is enabled. Orders are currently tracked from the dashboard and our team will contact you to finalize payment if needed.'}
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.print()}
            variant="secondary"
            className="px-6 py-3 rounded-xl font-medium"
            iconLeft={<Printer size={18} />}
          >
            {isAr ? 'طباعة الفواتير' : 'Print Invoices'}
          </Button>
          <Link href="/dashboard/invoices">
            <Button
              variant="secondary"
              className="px-6 py-3 rounded-xl font-medium"
              iconLeft={<FileText size={18} />}
            >
              {isAr ? 'عرض الفواتير' : 'View Invoices'}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {step === 'payment' && orderResults.length > 0 ? (isAr ? 'تم بنجاح' : 'Success') : (isAr ? 'إتمام الطلب' : 'Checkout')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {step === 'payment' && orderResults.length > 0
              ? (isAr ? 'تفاصيل طلباتك' : 'Your orders details')
              : (isAr ? `${resolved.length} ${resolved.length === 1 ? 'خدمة' : 'خدمات'} لإتمام الطلب` : `${resolved.length} ${resolved.length === 1 ? 'service' : 'services'} to check out`)}
          </p>
        </div>

        {!(step === 'payment' && orderResults.length > 0) && renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'customer_info' && renderCustomerInfoStep()}
            {step === 'documents' && renderDocumentsStep()}
            {step === 'confirm' && renderConfirmStep()}
            {step === 'payment' && renderPaymentStep()}
          </div>

          {!(step === 'payment' && orderResults.length > 0) && (
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
                        <p className="font-bold text-sm mt-0.5">{totalUnits} {isAr ? 'إجمالي الخدمات' : 'total services'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="space-y-2 mb-4">
                      {resolved.map((l) => (
                        <div key={l.serviceId} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={12} className="text-emerald-500 mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700 dark:text-slate-300 truncate">{isAr ? l.nameAr : l.nameEn}</p>
                            <p className="text-xs text-slate-400">×{l.qty} — {formatPrice(l.price * l.qty, currency)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(subtotal, currency)}</span>
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
                          {formatPrice(grandTotal, currency)}
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
          )}
        </div>
      </div>
    </div>
  );
}