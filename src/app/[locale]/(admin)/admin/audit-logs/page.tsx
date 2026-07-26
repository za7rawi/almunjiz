'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, RefreshCw, Filter, Clock, User, Package, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

type ResourceFilter = 'all' | 'orders' | 'payments' | 'invoices' | 'users' | 'gateways';

const actionLabels: Record<string, { label: string; color: string }> = {
  'order.created': { label: 'إنشاء طلب', color: 'bg-blue-100 text-blue-700' },
  'order.status_changed': { label: 'تغيير حالة', color: 'bg-amber-100 text-amber-700' },
  'order.note_added': { label: 'إضافة ملاحظة', color: 'bg-purple-100 text-purple-700' },
  'order.file_uploaded': { label: 'رفع ملف', color: 'bg-indigo-100 text-indigo-700' },
  'order.email_sent': { label: 'إرسال بريد', color: 'bg-cyan-100 text-cyan-700' },
  'payment.created': { label: 'إنشاء دفع', color: 'bg-emerald-100 text-emerald-700' },
  'payment.completed': { label: 'اكتمال الدفع', color: 'bg-emerald-100 text-emerald-700' },
  'payment.verified': { label: 'تحقق من الدفع', color: 'bg-emerald-100 text-emerald-700' },
  'payment.failed': { label: 'فشل الدفع', color: 'bg-red-100 text-red-700' },
  'payment.refunded': { label: 'استرداد', color: 'bg-orange-100 text-orange-700' },
  'invoice.created': { label: 'إنشاء فاتورة', color: 'bg-sky-100 text-sky-700' },
  'invoice.paid': { label: 'دفع فاتورة', color: 'bg-emerald-100 text-emerald-700' },
  'user.registered': { label: 'تسجيل مستخدم', color: 'bg-teal-100 text-teal-700' },
  'user.login': { label: 'تسجيل دخول', color: 'bg-slate-100 text-slate-700' },
  'gateway.created': { label: 'إنشاء بوابة', color: 'bg-violet-100 text-violet-700' },
  'gateway.updated': { label: 'تحديث بوابة', color: 'bg-violet-100 text-violet-700' },
  'gateway.deleted': { label: 'حذف بوابة', color: 'bg-red-100 text-red-700' },
  'gateway.tested': { label: 'اختبار بوابة', color: 'bg-cyan-100 text-cyan-700' },
  'webhook.received': { label: 'استلام Webhook', color: 'bg-slate-100 text-slate-700' },
};

const resourceLabels: Record<string, string> = {
  orders: 'طلب',
  payments: 'دفع',
  invoices: 'فاتورة',
  users: 'مستخدم',
  gateways: 'بوابة',
};

const filterTabs: { id: ResourceFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'payments', label: 'المدفوعات' },
  { id: 'invoices', label: 'الفواتير' },
  { id: 'users', label: 'المستخدمين' },
  { id: 'gateways', label: 'الأبواب' },
];

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ResourceFilter>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/audit-logs');
      const json = await res.json();
      if (json.success && json.data) {
        const mapped: AuditLog[] = json.data.map((l: Record<string, unknown>) => ({
          id: l.id as string,
          action: l.action as string,
          resource: l.resource as string,
          resourceId: l.resourceId as string | undefined,
          userId: l.userId as string | undefined,
          userName: l.userName as string | undefined,
          metadata: l.metadata as Record<string, unknown> | undefined,
          createdAt: l.createdAt as string,
        }));
        setLogs(mapped);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filtered = activeFilter === 'all'
    ? logs
    : logs.filter((l) => l.resource === activeFilter.replace(/s$/, '').replace('gateways', 'gateway').replace('users', 'user'));

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed = filtered.slice(0, page * PAGE_SIZE);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((l) => l.createdAt?.startsWith(today));
  const todayOrders = todayLogs.filter((l) => l.resource === 'order' || l.action?.startsWith('order.')).length;
  const todayPayments = todayLogs.filter((l) => l.resource === 'payment' || l.action?.startsWith('payment.')).length;

  const statCards = [
    { label: 'إجمالي السجلات', value: logs.length, icon: Activity, color: '#2580eb' },
    { label: 'سجلات اليوم', value: todayLogs.length, icon: Clock, color: '#14b8a6' },
    { label: 'طلبات اليوم', value: todayOrders, icon: Package, color: '#7c3aed' },
    { label: 'مدفوعات اليوم', value: todayPayments, icon: CreditCard, color: '#f59e0b' },
  ];

  const formatArabicDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل النشاطات"
        subtitle="تتبع جميع العمليات في النظام"
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'سجل النشاطات' },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span className="me-2">تحديث</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glass>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value.toLocaleString('ar-SA')}</p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setActiveFilter(tab.id); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeFilter === tab.id
                ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#2580eb]" size={32} />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">التاريخ والوقت</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">العملية</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">المستخدم</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">المورد</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                      className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {formatArabicDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${actionLabels[log.action]?.color || 'bg-slate-100 text-slate-700'}`}>
                          {actionLabels[log.action]?.label || log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {log.userName ? log.userName.charAt(0) : 'ن'}
                          </div>
                          <span className="text-slate-900 dark:text-white text-xs font-medium">
                            {log.userName || 'النظام'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 dark:text-slate-300 text-xs">
                            {resourceLabels[log.resource] || log.resource}
                          </span>
                          {log.resourceId && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                              {log.resourceId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <details className="group">
                            <summary className="text-xs text-[#2580eb] cursor-pointer hover:underline select-none">
                              عرض التفاصيل
                            </summary>
                            <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-[10px] font-mono text-slate-500 dark:text-slate-400 max-w-xs overflow-x-auto">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </details>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {displayed.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Activity size={48} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد سجلات نشاط</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && displayed.length < filtered.length && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => p + 1)}
          >
            تحميل المزيد ({filtered.length - displayed.length} سجل)
          </Button>
        </div>
      )}
    </div>
  );
}
