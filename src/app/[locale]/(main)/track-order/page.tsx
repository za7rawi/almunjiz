'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Clock, CheckCircle, FileText, AlertCircle, User, Mail, Phone, CreditCard, Calendar, Hash } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { useSearchParams } from 'next/navigation';

interface TimelineStep { status: string; description?: string; date: string | null; done: boolean }
interface OrderData {
  orderNumber: string; service: string; status: string; progress: number;
  createdAt: string; total?: number; customerName?: string; customerEmail?: string;
  customerPhone?: string; paymentStatus?: string; timeline: TimelineStep[];
  invoiceNumber?: string;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'info' },
  WAITING_CLIENT: { label: 'بانتظار العميل', variant: 'secondary' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'تم الإنجاز', variant: 'success' },
  DELIVERED: { label: 'تم التسليم', variant: 'success' },
  CANCELLED: { label: 'ملغي', variant: 'danger' },
};

const paymentStatusConfig: Record<string, string> = {
  PENDING: 'بانتظار الدفع', PAID: 'مدفوع', FAILED: 'فشل', REFUNDED: 'مسترد', CANCELLED: 'ملغي',
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [foundOrder, setFoundOrder] = useState<OrderData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const { currency } = useCurrencyStore();

  const handleSearch = useCallback(async (searchVal?: string) => {
    const q = searchVal || orderNumber;
    if (!q.trim()) return;
    setSearching(true);
    setFoundOrder(null);
    setError('');
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(q.trim())}&limit=1`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        const o = data.data[0];
        const rawTimeline = (o.timeline || []) as { status: string; description: string; createdAt: string }[];
        const timeline: TimelineStep[] = rawTimeline.map((t) => ({
          status: t.description || t.status,
          description: t.description,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('ar-SA') : null,
          done: true,
        }));
        const statusSteps = ['PENDING', 'UNDER_REVIEW', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
        const currentIdx = statusSteps.indexOf(o.status);
        statusSteps.forEach((s, i) => {
          const exists = timeline.find((t) => t.status === (statusConfig[s]?.label || s));
          if (!exists && i <= currentIdx) {
            timeline.push({ status: statusConfig[s]?.label || s, date: null, done: i < currentIdx });
          }
        });
        const completedSteps = timeline.filter((s) => s.done).length;
        const totalSteps = Math.max(timeline.length, 1);
        setFoundOrder({
          orderNumber: o.orderNumber,
          service: o.service?.name || '-',
          status: o.status,
          progress: Math.min(Math.round((completedSteps / totalSteps) * 100), 100),
          createdAt: new Date(o.createdAt).toLocaleDateString('ar-SA'),
          total: Number(o.total || 0),
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          paymentStatus: o.paymentStatus,
          invoiceNumber: o.invoice?.invoiceNumber,
          timeline,
        });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sc = statusConfig[foundOrder?.status || ''] || { label: foundOrder?.status || '', variant: 'warning' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="تتبع طلبك" subtitle="ادخل رقم الطلب لمتابعة حالته" breadcrumbs={[{ label: 'الرئيسية', href: '/' }, { label: 'تتبع الطلب' }]} gradient />

        <Card glass className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="ادخل رقم الطلب (مثال: AM-ABC-1234)" className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all font-mono" dir="ltr" />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button onClick={() => handleSearch()} disabled={searching || !orderNumber.trim()} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white font-semibold shadow-lg shadow-[#2580eb]/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {searching ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري البحث...</span> : 'تتبع'}
            </button>
          </div>
        </Card>

        {foundOrder && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card glass className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div><h3 className="text-lg font-bold text-slate-900">الطلب #{foundOrder.orderNumber}</h3><p className="text-slate-500 text-sm mt-1">{foundOrder.service}</p></div>
                <Badge variant={(sc.variant as 'warning' | 'info' | 'success' | 'primary' | 'secondary' | 'danger') || 'warning'} dot>{sc.label}</Badge>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2"><span className="text-slate-500">نسبة الإنجاز</span><span className="font-bold text-[#2580eb]">{foundOrder.progress}%</span></div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${foundOrder.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full" /></div>
              </div>
              <h4 className="font-bold text-slate-900 mb-4">مراحل التنفيذ</h4>
              <div className="space-y-0">
                {foundOrder.timeline.map((step: TimelineStep, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-emerald-500 text-white' : i === foundOrder.timeline.findIndex((s: TimelineStep) => !s.done) ? 'bg-[#2580eb] text-white ring-4 ring-[#2580eb]/20' : 'bg-slate-100 text-slate-400'}`}>
                        {step.done ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      {i < foundOrder.timeline.length - 1 && <div className={`w-0.5 h-8 ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.status}</p>
                      {step.date && <p className="text-xs text-slate-400 mt-0.5">{step.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card glass className="p-6">
              <h4 className="font-bold text-slate-900 mb-4">تفاصيل الطلب</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Hash size={16} className="text-[#2580eb] shrink-0" /><div><p className="text-[10px] text-slate-400">رقم الطلب</p><p className="text-sm font-medium text-slate-900 font-mono" dir="ltr">{foundOrder.orderNumber}</p></div></div>
                {foundOrder.invoiceNumber && <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><FileText size={16} className="text-[#14b8a6] shrink-0" /><div><p className="text-[10px] text-slate-400">رقم الفاتورة</p><p className="text-sm font-medium text-slate-900 font-mono" dir="ltr">{foundOrder.invoiceNumber}</p></div></div>}
                {foundOrder.customerName && <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><User size={16} className="text-[#7c3aed] shrink-0" /><div><p className="text-[10px] text-slate-400">اسم العميل</p><p className="text-sm font-medium text-slate-900">{foundOrder.customerName}</p></div></div>}
                {foundOrder.customerEmail && <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Mail size={16} className="text-amber-500 shrink-0" /><div><p className="text-[10px] text-slate-400">البريد الإلكتروني</p><p className="text-sm font-medium text-slate-900" dir="ltr">{foundOrder.customerEmail}</p></div></div>}
                {foundOrder.customerPhone && <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Phone size={16} className="text-emerald-500 shrink-0" /><div><p className="text-[10px] text-slate-400">رقم الجوال</p><p className="text-sm font-medium text-slate-900" dir="ltr">{foundOrder.customerPhone}</p></div></div>}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Package size={16} className="text-[#2580eb] shrink-0" /><div><p className="text-[10px] text-slate-400">الخدمة</p><p className="text-sm font-medium text-slate-900">{foundOrder.service}</p></div></div>
                {foundOrder.total ? <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><CreditCard size={16} className="text-[#7c3aed] shrink-0" /><div><p className="text-[10px] text-slate-400">المبلغ الإجمالي</p><p className="text-sm font-bold text-slate-900">{formatPrice(foundOrder.total, currency)}</p></div></div> : null}
                {foundOrder.paymentStatus && <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><CreditCard size={16} className="text-emerald-500 shrink-0" /><div><p className="text-[10px] text-slate-400">حالة الدفع</p><p className="text-sm font-medium text-slate-900">{paymentStatusConfig[foundOrder.paymentStatus] || foundOrder.paymentStatus}</p></div></div>}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Calendar size={16} className="text-slate-400 shrink-0" /><div><p className="text-[10px] text-slate-400">تاريخ الطلب</p><p className="text-sm font-medium text-slate-900">{foundOrder.createdAt}</p></div></div>
              </div>
            </Card>
          </motion.div>
        )}

        {error && !searching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card glass className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6"><AlertCircle size={36} className="text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{error}</h3>
              <p className="text-slate-500 text-sm mb-6">تأكد من رقم الطلب وحاول مرة أخرى</p>
            </Card>
          </motion.div>
        )}

        {!foundOrder && !searching && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card glass className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#2580eb]/10 flex items-center justify-center mx-auto mb-6"><Search size={36} className="text-[#2580eb]/40" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">ابحث عن طلبك</h3>
              <p className="text-slate-500 text-sm">أدخل رقم الطلب في مربع البحث أعلاه لمتابعة حالته</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
