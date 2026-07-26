'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Package, Clock, CheckCircle, FileText, AlertCircle,
  User, Mail, Phone, CreditCard, Calendar, Hash, Download,
  File, Image, ChevronLeft, X, Sparkles, MapPin, CircleDollarSign,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrencyStore } from '@/store/currency-store';
import { useLanguageStore } from '@/store/language-store';
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

const orderStatusConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'; color: string }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning', color: '#f59e0b' },
  UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'info', color: '#0ea5e9' },
  WAITING_CLIENT: { label: 'بانتظار العميل', variant: 'warning', color: '#f59e0b' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary', color: '#2580eb' },
  COMPLETED: { label: 'مكتمل', variant: 'success', color: '#10b981' },
  DELIVERED: { label: 'تم التسليم', variant: 'success', color: '#10b981' },
  CANCELLED: { label: 'ملغي', variant: 'danger', color: '#ef4444' },
};

const paymentStatusConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDING: { label: 'بانتظار الدفع', variant: 'warning' },
  PROCESSING: { label: 'جار المعالجة', variant: 'info' },
  PAID: { label: 'مدفوع', variant: 'success' },
  FAILED: { label: 'فشل', variant: 'danger' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  REFUNDED: { label: 'مسترد', variant: 'warning' },
  CANCELLED: { label: 'ملغي', variant: 'danger' },
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
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
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
  const { language } = useLanguageStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isAr = language === 'ar';

  const handleSearch = useCallback(async (searchVal?: string) => {
    const q = searchVal || orderNumber;
    if (!q.trim()) return;
    setSearching(true);
    setFoundOrder(null);
    setError('');
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setFoundOrder(data.data);
      } else {
        setError(data.message || (isAr ? 'لم يتم العثور على الطلب' : 'Order not found'));
      }
    } catch {
      setError(isAr ? 'حدث خطأ أثناء البحث' : 'An error occurred while searching');
    } finally {
      setSearching(false);
    }
  }, [orderNumber, isAr]);

  useEffect(() => {
    if (initialOrder) {
      setOrderNumber(initialOrder);
      handleSearch(initialOrder);
    }
  }, []);

  const sc = foundOrder ? orderStatusConfig[foundOrder.status] || { label: foundOrder.status, variant: 'info' as const, color: '#94a3b8' } : null;
  const pc = foundOrder?.paymentStatus ? paymentStatusConfig[foundOrder.paymentStatus] || { label: foundOrder.paymentStatus, variant: 'info' as const } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'تتبع طلبك' : 'Track Your Order'}
          subtitle={isAr ? 'ادخل رقم الطلب لمتابعة حالته' : 'Enter your order number to track its status'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'تتبع الطلب' : 'Track Order' }]}
          gradient
        />

        {/* Search Section */}
        <Card glass className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={isAr ? 'ادخل رقم الطلب (مثال: AM-ABC-1234)' : 'Enter order number (e.g. AM-ABC-1234)'}
                className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all font-mono"
                dir="ltr"
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <Button
              variant="primary"
              onClick={() => handleSearch()}
              disabled={searching || !orderNumber.trim()}
              loading={searching}
              iconLeft={!searching ? <Search size={18} /> : undefined}
            >
              {isAr ? 'تتبع' : 'Track'}
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {searching && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card glass className="p-12 text-center">
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="w-16 h-16 border-4 border-[#2580eb]/20 border-t-[#2580eb] rounded-full animate-spin" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#14b8a6] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {isAr ? 'جاري البحث عن الطلب...' : 'Searching for your order...'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isAr ? 'يرجى الانتظار قليلاً' : 'Please wait a moment'}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Order Found */}
          {foundOrder && !searching && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Order Header Card */}
              <Card glass className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] text-white">
                        <Package size={18} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isAr ? 'الطلب' : 'Order'} #{foundOrder.orderNumber}
                      </h3>
                    </div>
                    {foundOrder.invoice?.invoiceNumber && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-mono ps-10" dir="ltr">
                        {isAr ? 'الفاتورة:' : 'Invoice:'} {foundOrder.invoice.invoiceNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ps-10 sm:ps-0">
                    {sc && <Badge variant={sc.variant} size="md" dot>{sc.label}</Badge>}
                    {pc && <Badge variant={pc.variant} size="md" dot>{pc.label}</Badge>}
                  </div>
                </div>
              </Card>

              {/* Order Details Card */}
              <Card glass className="p-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#2580eb]/10 text-[#2580eb]">
                    <User size={16} />
                  </div>
                  {isAr ? 'بيانات الطلب' : 'Order Details'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {foundOrder.customerName && (
                    <InfoItem icon={<User size={16} />} iconColor="text-[#7c3aed]" label={isAr ? 'العميل' : 'Customer'} value={foundOrder.customerName} />
                  )}
                  {foundOrder.customerEmail && (
                    <InfoItem icon={<Mail size={16} />} iconColor="text-amber-500" label={isAr ? 'البريد' : 'Email'} value={foundOrder.customerEmail} ltr />
                  )}
                  {foundOrder.customerPhone && (
                    <InfoItem icon={<Phone size={16} />} iconColor="text-emerald-500" label={isAr ? 'الهاتف' : 'Phone'} value={foundOrder.customerPhone} ltr />
                  )}
                  {foundOrder.service?.name && (
                    <InfoItem icon={<Package size={16} />} iconColor="text-[#2580eb]" label={isAr ? 'الخدمة' : 'Service'} value={foundOrder.service.name} />
                  )}
                  {foundOrder.baseAmount != null && foundOrder.baseAmount > 0 && (
                    <InfoItem icon={<CircleDollarSign size={16} />} iconColor="text-[#2580eb]" label={isAr ? 'المبلغ الأساسي' : 'Subtotal'} value={formatPrice(foundOrder.baseAmount, currency)} />
                  )}
                  {foundOrder.discount != null && foundOrder.discount > 0 && (
                    <InfoItem icon={<CreditCard size={16} />} iconColor="text-red-500" label={isAr ? 'الخصم' : 'Discount'} value={formatPrice(foundOrder.discount, currency)} />
                  )}
                  {foundOrder.tax != null && foundOrder.tax > 0 && (
                    <InfoItem icon={<CreditCard size={16} />} iconColor="text-amber-500" label={isAr ? 'الضريبة' : 'Tax'} value={formatPrice(foundOrder.tax, currency)} />
                  )}
                  {foundOrder.total != null && foundOrder.total > 0 && (
                    <InfoItem icon={<CreditCard size={16} />} iconColor="text-[#7c3aed]" label={isAr ? 'الإجمالي' : 'Total'} value={formatPrice(foundOrder.total, currency)} bold />
                  )}
                  {foundOrder.paymentMethod && (
                    <InfoItem icon={<CreditCard size={16} />} iconColor="text-[#14b8a6]" label={isAr ? 'طريقة الدفع' : 'Payment Method'} value={foundOrder.paymentMethod} ltr />
                  )}
                  {foundOrder.transactionId && (
                    <InfoItem icon={<Hash size={16} />} iconColor="text-slate-400" label={isAr ? 'رقم المعاملة' : 'Transaction ID'} value={foundOrder.transactionId} ltr mono />
                  )}
                  <InfoItem
                    icon={<Calendar size={16} />}
                    iconColor="text-slate-400"
                    label={isAr ? 'تاريخ الطلب' : 'Order Date'}
                    value={new Date(foundOrder.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                </div>
              </Card>

              {/* Timeline Card */}
              {foundOrder.timeline && foundOrder.timeline.length > 0 && (
                <Card glass className="p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#14b8a6]/10 text-[#14b8a6]">
                      <Clock size={16} />
                    </div>
                    {isAr ? 'جدول الأعمال' : 'Timeline'}
                  </h4>
                  <div className="space-y-0">
                    {foundOrder.timeline.map((entry, i) => {
                      const isLatest = i === 0;
                      return (
                        <div key={entry.id || i} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                isLatest
                                  ? 'bg-gradient-to-br from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/20'
                                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-500/20'
                              }`}
                            >
                              {isLatest ? <Sparkles size={16} /> : <CheckCircle size={16} />}
                            </motion.div>
                            {i < (foundOrder.timeline?.length || 0) - 1 && (
                              <div className="w-0.5 h-10 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-600 dark:to-slate-700 mt-1" />
                            )}
                          </div>
                          <div className="pb-8 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.status}</p>
                              {isLatest && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#2580eb]/10 text-[#2580eb]">
                                  {isAr ? 'الأحدث' : 'Latest'}
                                </span>
                              )}
                            </div>
                            {entry.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{entry.description}</p>
                            )}
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                              {new Date(entry.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Files Card */}
              {foundOrder.fileAttachments && foundOrder.fileAttachments.length > 0 && (
                <Card glass className="p-6">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed]">
                      <FileText size={16} />
                    </div>
                    {isAr ? 'الملفات المرفقة' : 'Attached Files'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {foundOrder.fileAttachments.map((file) => (
                      <div key={file.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        {isImageFile(file.mimeType) ? (
                          <div
                            className="relative h-32 bg-slate-100 dark:bg-slate-700 cursor-pointer group"
                            onClick={() => setPreviewImage(`/api/files/${file.id}`)}
                          >
                            <img
                              src={`/api/files/${file.id}`}
                              alt={file.fileName}
                              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Image size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                            </div>
                          </div>
                        ) : isPdfFile(file.mimeType) ? (
                          <div className="h-32 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 flex items-center justify-center">
                            <FileText size={40} className="text-red-400" />
                          </div>
                        ) : (
                          <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 flex items-center justify-center">
                            <File size={40} className="text-slate-300 dark:text-slate-500" />
                          </div>
                        )}
                        <div className="p-3 flex items-center justify-between gap-2 bg-white dark:bg-slate-800">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.fileName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.fileSize)}</p>
                          </div>
                          <a
                            href={`/api/files/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 w-9 h-9 rounded-xl bg-[#2580eb]/10 text-[#2580eb] flex items-center justify-center hover:bg-[#2580eb]/20 transition-colors"
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

          {/* Error State */}
          {error && !searching && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card glass className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={36} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{error}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  {isAr ? 'تأكد من رقم الطلب وحاول مرة أخرى' : 'Please verify the order number and try again'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => { setError(''); setFoundOrder(null); }}
                  iconLeft={<Search size={16} />}
                >
                  {isAr ? 'حاول مرة أخرى' : 'Try Again'}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!foundOrder && !searching && !error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card glass className="p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center mx-auto mb-6">
                  <Search size={36} className="text-[#2580eb]/40" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {isAr ? 'ابحث عن طلبك' : 'Search for Your Order'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {isAr ? 'أدخل رقم الطلب في مربع البحث أعلاه لمتابعة حالته' : 'Enter your order number above to track its status'}
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview Modal */}
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
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <img
              src={previewImage}
              alt={isAr ? 'معاينة' : 'Preview'}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  icon,
  iconColor,
  label,
  value,
  ltr = false,
  mono = false,
  bold = false,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  ltr?: boolean;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
      <div className={`shrink-0 ${iconColor}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className={`text-sm ${bold ? 'font-bold' : 'font-medium'} text-slate-900 dark:text-white truncate ${mono ? 'font-mono' : ''}`} dir={ltr ? 'ltr' : undefined}>
          {value}
        </p>
      </div>
    </div>
  );
}
