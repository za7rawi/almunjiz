'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Package,
  Download,
  Calendar,
  ShoppingCart,
  BarChart3,
  Star,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language-store';
import { toast } from '@/components/ui/toast';

interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  amount: unknown;
  total: unknown;
  tax: unknown;
  discount: unknown;
  createdAt: string;
  paymentStatus: string;
  service?: { name: string };
  customerName?: string;
  customerEmail?: string;
}

interface ApiUser {
  id: string;
  role: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', labelEn: 'Pending', color: '#f59e0b', bg: '#f59e0b15' },
  UNDER_REVIEW: { label: 'قيد المراجعة', labelEn: 'Under Review', color: '#2580eb', bg: '#2580eb15' },
  WAITING_CLIENT: { label: 'بانتظار العميل', labelEn: 'Waiting for Client', color: '#8b5cf6', bg: '#8b5cf615' },
  IN_PROGRESS: { label: 'جار التنفيذ', labelEn: 'In Progress', color: '#2580eb', bg: '#2580eb15' },
  COMPLETED: { label: 'مكتمل', labelEn: 'Completed', color: '#16a34a', bg: '#16a34a15' },
  DELIVERED: { label: 'تم التسليم', labelEn: 'Delivered', color: '#16a34a', bg: '#16a34a15' },
  CANCELLED: { label: 'ملغى', labelEn: 'Cancelled', color: '#ef4444', bg: '#ef444415' },
};

const monthLabelsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const monthLabelsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const serviceColors = [
  { color: '#2580eb', gradientFrom: '#2580eb', gradientTo: '#14b8a6' },
  { color: '#7c3aed', gradientFrom: '#7c3aed', gradientTo: '#a78bfa' },
  { color: '#14b8a6', gradientFrom: '#14b8a6', gradientTo: '#5eead4' },
  { color: '#f59e0b', gradientFrom: '#f59e0b', gradientTo: '#fbbf24' },
  { color: '#ef4444', gradientFrom: '#ef4444', gradientTo: '#f87171' },
];

function MonthlyRevenueChart({ data, isAr }: { data: { month: string; label: string; value: number }[]; isAr: boolean }) {
  const maxRevenue = Math.max(...data.map((d) => d.value), 1);
  const svgWidth = 700;
  const svgHeight = 240;
  const paddingX = 50;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const barWidth = Math.max(Math.floor(chartWidth / data.length) - 8, 16);

  return (
    <div className="relative h-72">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="reportBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2580eb" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <g key={i}>
            <line
              x1={paddingX}
              y1={paddingY + chartHeight - pct * chartHeight}
              x2={svgWidth - paddingX}
              y2={paddingY + chartHeight - pct * chartHeight}
              stroke="currentColor"
              className="text-slate-100 dark:text-white/5"
              strokeWidth="0.5"
            />
            <text
              x={paddingX - 8}
              y={paddingY + chartHeight - pct * chartHeight + 3}
              textAnchor="end"
              fill="currentColor"
              className="text-slate-400 dark:text-slate-500"
              fontSize="8"
            >
              {Math.round(pct * maxRevenue).toLocaleString()}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const barHeight = maxRevenue > 0 ? (d.value / maxRevenue) * chartHeight : 0;
          const x = paddingX + (i / data.length) * chartWidth + 4;
          const y = paddingY + chartHeight - barHeight;
          return (
            <g key={i}>
              <motion.rect
                x={x}
                y={paddingY + chartHeight}
                width={barWidth}
                height={0}
                rx="4"
                fill="url(#reportBarGrad)"
                initial={{ height: 0, y: paddingY + chartHeight }}
                animate={{ height: barHeight, y }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 120, damping: 14 }}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <title>{`${d.label}: ${d.value.toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}`}</title>
              </motion.rect>
              {d.value > 0 && (
                <motion.text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="#2580eb"
                  fontSize="8"
                  fontWeight="600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value.toLocaleString()}
                </motion.text>
              )}
              <text
                x={x + barWidth / 2}
                y={svgHeight - 5}
                textAnchor="middle"
                fill="currentColor"
                className="text-slate-500 dark:text-slate-400"
                fontSize="7"
              >
                {d.label.slice(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TopServicesChart({
  data,
  isAr,
}: {
  data: { name: string; revenue: number; count: number; color: string; gradientFrom: string; gradientTo: string }[];
  isAr: boolean;
}) {
  const maxRevenue = Math.max(...data.map((s) => s.revenue), 1);

  return (
    <div className="space-y-5">
      {data.map((service, i) => (
        <div key={service.name}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{service.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{service.count} {isAr ? 'طلب' : 'orders'}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{service.revenue.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(to left, ${service.gradientFrom}, ${service.gradientTo})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(service.revenue / maxRevenue) * 100}%` }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-center text-slate-400 dark:text-slate-500 py-8">{isAr ? 'لا توجد بيانات بعد' : 'No data yet'}</p>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders?limit=10000').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ])
      .then(([ordersRes, usersRes]) => {
        if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
        if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      })
      .catch(() => { toast.error(isAr ? 'فشل تحميل التقارير' : 'Failed to load reports'); })
      .finally(() => setLoading(false));
  }, [isAr]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (dateFrom) {
      result = result.filter((o) => o.createdAt >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((o) => o.createdAt <= dateTo + 'T23:59:59');
    }
    return result;
  }, [orders, dateFrom, dateTo]);

  const paidOrders = useMemo(
    () => filteredOrders.filter((o) => o.paymentStatus === 'PAID'),
    [filteredOrders],
  );

  const now = useMemo(() => new Date(), []);

  const totalRevenue = useMemo(
    () => paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    [paidOrders],
  );

  const monthlyRevenue = useMemo(() => {
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return paidOrders
      .filter((o) => o.createdAt.startsWith(prefix))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [paidOrders, now]);

  const totalOrders = filteredOrders.length;

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [filteredOrders]);

  const avgOrderValue = totalOrders > 0 ? totalRevenue / paidOrders.length || 0 : 0;

  const newCustomersThisMonth = useMemo(() => {
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return users.filter(
      (u) => (u.role === 'CUSTOMER' || u.role === 'customer') && u.createdAt.startsWith(prefix),
    ).length;
  }, [users, now]);

  const totalCustomers = useMemo(
    () => users.filter((u) => u.role === 'CUSTOMER' || u.role === 'customer').length,
    [users],
  );

  const revenueByMonth = useMemo(() => {
    const months: { month: string; label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = isAr ? monthLabelsAr[d.getMonth()] : monthLabelsEn[d.getMonth()];
      const value = paidOrders
        .filter((o) => o.createdAt.startsWith(prefix))
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      months.push({ month: prefix, label, value });
    }
    return months;
  }, [paidOrders, now, isAr]);

  const topServices = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    paidOrders.forEach((o) => {
      const name = o.service?.name || (isAr ? 'غير محدد' : 'Unspecified');
      if (!map[name]) map[name] = { revenue: 0, count: 0 };
      map[name].revenue += Number(o.total) || 0;
      map[name].count += 1;
    });
    return Object.entries(map)
      .map(([name, data], idx) => ({
        name,
        revenue: data.revenue,
        count: data.count,
        ...serviceColors[idx % serviceColors.length],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [paidOrders, isAr]);

  const statsCards = [
    {
      label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: totalRevenue,
      prefix: '',
      suffix: ` ${isAr ? 'ر.س' : 'SAR'}`,
      icon: DollarSign,
      numericValue: totalRevenue,
    },
    {
      label: isAr ? 'إيرادات الشهر' : 'Monthly Revenue',
      value: monthlyRevenue,
      prefix: '',
      suffix: ` ${isAr ? 'ر.س' : 'SAR'}`,
      icon: BarChart3,
      numericValue: monthlyRevenue,
    },
    {
      label: isAr ? 'إجمالي الطلبات' : 'Total Orders',
      value: totalOrders,
      prefix: '',
      suffix: '',
      icon: Package,
      numericValue: totalOrders,
    },
    {
      label: isAr ? 'متوسط الطلب' : 'Avg Order Value',
      value: Math.round(avgOrderValue),
      prefix: '',
      suffix: ` ${isAr ? 'ر.س' : 'SAR'}`,
      icon: ShoppingCart,
      numericValue: Math.round(avgOrderValue),
    },
    {
      label: isAr ? 'العملاء' : 'Customers',
      value: totalCustomers,
      prefix: '',
      suffix: '',
      icon: Users,
      numericValue: totalCustomers,
    },
    {
      label: isAr ? 'عملاء جدد (الشهر)' : 'New Customers (Month)',
      value: newCustomersThisMonth,
      prefix: '',
      suffix: '',
      icon: Star,
      numericValue: newCustomersThisMonth,
    },
  ];

  const handleExport = () => {
    setExporting(true);

    setTimeout(() => {
      const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

      const rows: string[] = [];

      rows.push(isAr ? 'التقرير العام' : 'General Report');
      rows.push('');
      rows.push(isAr ? 'المقياس,القيمة' : 'Metric,Value');
      statsCards.forEach((s) => {
        rows.push(`${escapeCsv(s.label)},${escapeCsv(`${s.numericValue.toLocaleString()}${s.suffix}`)}`);
      });

      rows.push('');
      rows.push(isAr ? 'إيرادات المبيعات الشهرية' : 'Monthly Sales Revenue');
      rows.push(isAr ? 'الشهر,الإيرادات (ر.س)' : 'Month,Revenue (SAR)');
      revenueByMonth.forEach((m) => {
        rows.push(`${escapeCsv(m.label)},${m.value}`);
      });

      rows.push('');
      rows.push(isAr ? 'أعلى الخدمات إيراداً' : 'Top Services by Revenue');
      rows.push(isAr ? 'الخدمة,الإيرادات (ر.س),عدد الطلبات' : 'Service,Revenue (SAR),Order Count');
      topServices.forEach((s) => {
        rows.push(`${escapeCsv(s.name)},${s.revenue},${s.count}`);
      });

      rows.push('');
      rows.push(isAr ? 'توزيع الطلبات حسب الحالة' : 'Orders by Status');
      rows.push(isAr ? 'الحالة,العدد,النسبة المئوية' : 'Status,Count,Percentage');
      Object.entries(ordersByStatus)
        .sort((a, b) => b[1] - a[1])
        .forEach(([status, count]) => {
          const cfg = statusConfig[status] || { label: status, labelEn: status };
          const statusLabel = isAr ? cfg.label : cfg.labelEn;
          const pct = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : '0';
          rows.push(`${escapeCsv(statusLabel)},${count},${pct}%`);
        });

      rows.push('');
      rows.push(isAr ? 'تفاصيل الطلبات' : 'Order Details');
      rows.push(isAr ? 'رقم الطلب,الحالة,المبلغ,حالة الدفع,تاريخ الإنشاء,الخدمة,اسم العميل,البريد الإلكتروني' : 'Order Number,Status,Amount,Payment Status,Created At,Service,Customer Name,Customer Email');
      filteredOrders.forEach((o) => {
        const cfg = statusConfig[o.status] || { label: o.status, labelEn: o.status };
        const statusLabel = isAr ? cfg.label : cfg.labelEn;
        rows.push([
          escapeCsv(o.orderNumber),
          escapeCsv(statusLabel),
          Number(o.total) || 0,
          o.paymentStatus === 'PAID' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid'),
          o.createdAt,
          escapeCsv(o.service?.name || (isAr ? 'غير محدد' : 'Unspecified')),
          escapeCsv(o.customerName || ''),
          escapeCsv(o.customerEmail || ''),
        ].join(','));
      });

      const csvContent = '\uFEFF' + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${isAr ? 'تقرير' : 'report'}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAr ? 'التقارير' : 'Reports'}
        gradient
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'التقارير' : 'Reports' },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              dir="ltr"
            />
          </div>
          <span className="text-slate-400 text-sm">{isAr ? 'إلى' : 'to'}</span>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <Card glass>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {stat.prefix}{stat.numericValue.toLocaleString()}{stat.suffix}
                      </p>
                    </div>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#2580eb15' }}
                    >
                      <stat.icon size={20} style={{ color: '#2580eb' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{isAr ? 'إيرادات المبيعات الشهرية' : 'Monthly Sales Revenue'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isAr ? 'إيرادات آخر 12 شهر (المدفوعة فقط)' : 'Revenue for last 12 months (paid only)'}</p>
                </div>
                <Badge variant="success" size="sm">
                  {paidOrders.length} {isAr ? 'طلب مدفوع' : 'paid orders'}
                </Badge>
              </div>
              <MonthlyRevenueChart data={revenueByMonth} isAr={isAr} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{isAr ? 'أعلى الخدمات إيراداً' : 'Top Services by Revenue'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isAr ? 'ترتيب الخدمات حسب الإيرادات' : 'Services ranked by revenue'}</p>
                </div>
                <Badge variant="primary" size="sm">{topServices.length} {isAr ? 'خدمات' : 'services'}</Badge>
              </div>
              <TopServicesChart data={topServices} isAr={isAr} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{isAr ? 'توزيع الطلبات حسب الحالة' : 'Orders by Status'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{isAr ? 'عدد الطلبات في كل حالة' : 'Number of orders per status'}</p>
              </div>
              <Badge variant="info" size="sm">{totalOrders} {isAr ? 'طلب' : 'orders'}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(ordersByStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count], i) => {
                  const cfg = statusConfig[status] || { label: status, labelEn: status, color: '#6b7280', bg: '#6b728015' };
                  const statusLabel = isAr ? cfg.label : cfg.labelEn;
                  const pct = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : '0';
                  return (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{statusLabel}</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
                      <p className="text-xs text-slate-400 mt-1">{pct}% {isAr ? 'من الإجمالي' : 'of total'}</p>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: cfg.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.6 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              {Object.keys(ordersByStatus).length === 0 && !loading && (
                <p className="col-span-full text-center text-slate-400 dark:text-slate-500 py-8">{isAr ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-end"
      >
        <Button onClick={handleExport} disabled={exporting} className="gap-2">
          <Download size={16} />
          {exporting ? (isAr ? 'جاري التصدير...' : 'Exporting...') : (isAr ? 'تصدير التقرير' : 'Export Report')}
        </Button>
      </motion.div>
    </div>
  );
}
