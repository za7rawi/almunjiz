'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Clock, CheckCircle, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';

interface TimelineStep { status: string; date: string | null; done: boolean }
interface OrderData {
  orderNumber: string; service: string; status: string; progress: number;
  createdAt: string; total?: number; timeline: TimelineStep[];
}

const statusColors: Record<string, string> = { PENDING: 'warning', IN_PROGRESS: 'info', COMPLETED: 'success', DELIVERED: 'success' };

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const { currency } = useCurrencyStore();

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setSearching(true);
    setFoundOrder(null);
    setError('');
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(orderNumber.trim())}&limit=1`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        const o = data.data[0];
        const timeline = (o.timeline || []).map((t: { status: string; description: string; createdAt: string }) => ({
          status: t.description || t.status,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('ar-SA') : null,
          done: true,
        }));
        timeline.push(
          { status: 'تم الانجاز', date: null, done: o.status === 'COMPLETED' || o.status === 'DELIVERED' },
          { status: 'تم التسليم', date: null, done: o.status === 'DELIVERED' },
        );
        const completedSteps = timeline.filter((s: TimelineStep) => s.done).length;
        setFoundOrder({
          orderNumber: o.orderNumber,
          service: o.service?.name || '-',
          status: o.status,
          progress: Math.min(Math.round((completedSteps / 6) * 100), 100),
          createdAt: new Date(o.createdAt).toLocaleDateString('ar-SA'),
          total: o.total,
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
  };

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
            <button onClick={handleSearch} disabled={searching || !orderNumber.trim()} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white font-semibold shadow-lg shadow-[#2580eb]/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {searching ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري البحث...</span> : 'تتبع'}
            </button>
          </div>
        </Card>

        {foundOrder && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card glass className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div><h3 className="text-lg font-bold text-slate-900">الطلب #{foundOrder.orderNumber}</h3><p className="text-slate-500 text-sm mt-1">{foundOrder.service}</p></div>
                <Badge variant={(statusColors[foundOrder.status] as 'warning' | 'info' | 'success') || 'warning'} dot>
                  {foundOrder.status === 'PENDING' ? 'قيد الانتظار' : foundOrder.status === 'IN_PROGRESS' ? 'جار التنفيذ' : foundOrder.status === 'COMPLETED' ? 'تم الانجاز' : 'تم التسليم'}
                </Badge>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center"><Package size={24} className="mx-auto text-[#2580eb] mb-2" /><p className="text-xs text-slate-500">رقم الطلب</p><p className="font-bold text-slate-900 text-sm font-mono" dir="ltr">{foundOrder.orderNumber}</p></div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center"><FileText size={24} className="mx-auto text-[#14b8a6] mb-2" /><p className="text-xs text-slate-500">الخدمة</p><p className="font-bold text-slate-900 text-sm">{foundOrder.service}</p></div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-center"><Clock size={24} className="mx-auto text-[#7c3aed] mb-2" /><p className="text-xs text-slate-500">تاريخ الإنشاء</p><p className="font-bold text-slate-900 text-sm">{foundOrder.createdAt}</p></div>
            </div>
            {foundOrder.total && (
              <div className="flex justify-center"><div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2580eb]/5 to-[#14b8a6]/5 border border-[#2580eb]/10"><span className="text-sm text-slate-500">المبلغ الإجمالي:</span><span className="text-lg font-bold gradient-text">{formatPrice(foundOrder.total, currency)}</span></div></div>
            )}
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
