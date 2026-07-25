'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Package, Clock, CheckCircle, FileText, AlertCircle,
  User, Mail, Phone, CreditCard, Calendar, Hash, Download,
  File, Image, ChevronLeft
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { useSearchParams } from 'next/navigation';

function isImageFile(mt: string): boolean { return mt?.startsWith('image/') || false; }
function isPdfFile(mt: string): boolean { return mt === 'application/pdf'; }
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
const orderStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  UNDER_REVIEW: { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-700' },
  WAITING_CLIENT: { label: 'بانتظار العميل', color: 'bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'جار التنفيذ', color: 'bg-[#2580eb]/10 text-[#2580eb]' },
  COMPLETED: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700' },
  DELIVERED: { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
};
const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'بانتظار الدفع', color: 'bg-amber-100 text-amber-700' },
  PROCESSING: { label: 'جار المعالجة', color: 'bg-blue-100 text-blue-700' },
  PAID: { label: 'مدفوع', color: 'bg-emerald-100 text-emerald-700' },
  FAILED: { label: 'فشل', color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700' },
  REFUNDED: { label: 'مسترد', color: 'bg-amber-100 text-amber-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
};

interface TimelineEntry {
  id?: string;
  status: string;
  description?: string;
  createdAt: string;
}

interface FileAttachment {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
}

interface OrderData {
  id?: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  total?: number;
  baseAmount?: number;
  discount?: number;
  tax?: number;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  service?: { id?: string; name?: string; slug?: string };
  invoice?: { id?: string; invoiceNumber?: string };
  timeline?: TimelineEntry[];
  fileAttachments?: FileAttachment[];
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [foundOrder, setFoundOrder] = useState<OrderData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const { currency } = useCurrencyStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchVal?: string) => {
    const q = searchVal || orderNumber;
    if (!q.trim()) return;
    setSearching(true);
    setFoundOrder(null);
    setError('');
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setFoundOrder(data.data[0]);
      } else {
        setError('لم يتم العثور على الطلب');
      }
    } catch {
      setError('حدث خطأ أثناء البحث');
    } finally {
      setSearching(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    if (initialOrder) {
      setOrderNumber(initialOrder);
      handleSearch(initialOrder);
    }
  }, []);

  const sc = foundOrder ? (orderStatusConfig[foundOrder.status] || { label: foundOrder.status, color: 'bg-slate-100 text-slate-700' }) : null;
  const pc = foundOrder?.paymentStatus ? (paymentStatusConfig[foundOrder.paymentStatus] || { label: foundOrder.paymentStatus, color: 'bg-slate-100 text-slate-700' }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="تتبع طلبك" subtitle="ادخل رقم الطلب لمتابعة حالته" breadcrumbs={[{ label: 'الرئيسية', href: '/' }, { label: 'تتبع الطلب' }]} gradient />

        <Card glass className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ادخل رقم الطلب (مثال: AM-ABC-1234)"
                className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all font-mono"
                dir="ltr"
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={searching || !orderNumber.trim()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white font-semibold shadow-lg shadow-[#2580eb]/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري البحث...
                </span>
              ) : 'تتبع'}
            </button>
          </div>
        </Card>

        {searching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card glass className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-[#2580eb]/20 border-t-[#2580eb] rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">جاري البحث عن الطلب...</h3>
              <p className="text-slate-500 text-sm">يرجى الانتظار قليلاً</p>
            </Card>
          </motion.div>
        )}

        {foundOrder && !searching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card glass className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">الطلب #{foundOrder.orderNumber}</h3>
                  {foundOrder.invoice?.invoiceNumber && (
                    <p className="text-slate-500 text-sm mt-1 font-mono" dir="ltr">الفاتورة: {foundOrder.invoice.invoiceNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {sc && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${sc.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {sc.label}
                    </span>
                  )}
                  {pc && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${pc.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {pc.label}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <Card glass className="p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-[#2580eb]" />
                بيانات الطلب
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foundOrder.customerName && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <User size={16} className="text-[#7c3aed] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">العميل</p>
                      <p className="text-sm font-medium text-slate-900">{foundOrder.customerName}</p>
                    </div>
                  </div>
                )}
                {foundOrder.customerEmail && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Mail size={16} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">البريد</p>
                      <p className="text-sm font-medium text-slate-900" dir="ltr">{foundOrder.customerEmail}</p>
                    </div>
                  </div>
                )}
                {foundOrder.customerPhone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Phone size={16} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">الهاتف</p>
                      <p className="text-sm font-medium text-slate-900" dir="ltr">{foundOrder.customerPhone}</p>
                    </div>
                  </div>
                )}
                {foundOrder.service?.name && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Package size={16} className="text-[#2580eb] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">الخدمة</p>
                      <p className="text-sm font-medium text-slate-900">{foundOrder.service.name}</p>
                    </div>
                  </div>
                )}
                {foundOrder.baseAmount != null && foundOrder.baseAmount > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <CreditCard size={16} className="text-[#2580eb] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">المبلغ الأساسي</p>
                      <p className="text-sm font-medium text-slate-900">{formatPrice(foundOrder.baseAmount, currency)}</p>
                    </div>
                  </div>
                )}
                {foundOrder.discount != null && foundOrder.discount > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <CreditCard size={16} className="text-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">الخصم</p>
                      <p className="text-sm font-medium text-slate-900">{formatPrice(foundOrder.discount, currency)}</p>
                    </div>
                  </div>
                )}
                {foundOrder.tax != null && foundOrder.tax > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <CreditCard size={16} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">الضريبة</p>
                      <p className="text-sm font-medium text-slate-900">{formatPrice(foundOrder.tax, currency)}</p>
                    </div>
                  </div>
                )}
                {foundOrder.total != null && foundOrder.total > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <CreditCard size={16} className="text-[#7c3aed] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">الإجمالي</p>
                      <p className="text-sm font-bold text-slate-900">{formatPrice(foundOrder.total, currency)}</p>
                    </div>
                  </div>
                )}
                {foundOrder.paymentMethod && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <CreditCard size={16} className="text-[#14b8a6] shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">طريقة الدفع</p>
                      <p className="text-sm font-medium text-slate-900">{foundOrder.paymentMethod}</p>
                    </div>
                  </div>
                )}
                {foundOrder.transactionId && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Hash size={16} className="text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">رقم المعاملة</p>
                      <p className="text-sm font-medium text-slate-900 font-mono" dir="ltr">{foundOrder.transactionId}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">تاريخ الطلب</p>
                    <p className="text-sm font-medium text-slate-900">{new Date(foundOrder.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </div>
            </Card>

            {foundOrder.timeline && foundOrder.timeline.length > 0 && (
              <Card glass className="p-6">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock size={18} className="text-[#14b8a6]" />
                  جدول الأعمال
                </h4>
                <div className="space-y-0">
                  {foundOrder.timeline.map((entry, i) => (
                    <div key={entry.id || i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          i === 0 ? 'bg-[#2580eb] text-white ring-4 ring-[#2580eb]/20' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {i === 0 ? <Clock size={14} /> : <CheckCircle size={14} />}
                        </div>
                        {i < (foundOrder.timeline?.length || 0) - 1 && (
                          <div className="w-0.5 h-8 bg-slate-200" />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{entry.status}</p>
                        {entry.description && (
                          <p className="text-xs text-slate-500 mt-1">{entry.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(entry.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {foundOrder.fileAttachments && foundOrder.fileAttachments.length > 0 && (
              <Card glass className="p-6">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[#7c3aed]" />
                  الملفات المرفقة
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {foundOrder.fileAttachments.map((file) => (
                    <div key={file.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      {isImageFile(file.mimeType) ? (
                        <div
                          className="relative h-32 bg-slate-100 cursor-pointer group"
                          onClick={() => setPreviewImage(`/api/files/${file.id}`)}
                        >
                          <img
                            src={`/api/files/${file.id}`}
                            alt={file.originalName}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Image size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                          </div>
                        </div>
                      ) : isPdfFile(file.mimeType) ? (
                        <div className="h-32 bg-red-50 flex items-center justify-center">
                          <FileText size={40} className="text-red-400" />
                        </div>
                      ) : (
                        <div className="h-32 bg-slate-50 flex items-center justify-center">
                          <File size={40} className="text-slate-300" />
                        </div>
                      )}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.originalName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
                        </div>
                        <a
                          href={`/api/files/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-8 h-8 rounded-lg bg-[#2580eb]/10 text-[#2580eb] flex items-center justify-center hover:bg-[#2580eb]/20 transition-colors"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {error && !searching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card glass className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={36} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{error}</h3>
              <p className="text-slate-500 text-sm mb-6">تأكد من رقم الطلب وحاول مرة أخرى</p>
              <button
                onClick={() => { setError(''); setFoundOrder(null); }}
                className="px-6 py-2.5 rounded-xl bg-[#2580eb] text-white text-sm font-semibold hover:bg-[#2580eb]/90 transition-colors"
              >
                حاول مرة أخرى
              </button>
            </Card>
          </motion.div>
        )}

        {!foundOrder && !searching && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card glass className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#2580eb]/10 flex items-center justify-center mx-auto mb-6">
                <Search size={36} className="text-[#2580eb]/40" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">ابحث عن طلبك</h3>
              <p className="text-slate-500 text-sm">أدخل رقم الطلب في مربع البحث أعلاه لمتابعة حالته</p>
            </Card>
          </motion.div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 left-0 text-white flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
            >
              <ChevronLeft size={16} />
              إغلاق
            </button>
            <img
              src={previewImage}
              alt="معاينة"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
