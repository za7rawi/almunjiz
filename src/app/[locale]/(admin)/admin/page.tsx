'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Wrench,
  Clock,
  CalendarDays,
  TrendingUp,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Ban,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/components/ui/toast';
import { useLanguageStore } from '@/store/language-store';

interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  total: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  paymentStatus?: string;
  service?: { name: string };
}

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const statusConfig: Record<
  string,
  { labelAr: string; labelEn: string; variant: 'warning' | 'primary' | 'success' | 'info' | 'danger'; color: string }
> = {
  PENDING: { labelAr: 'قيد الانتظار', labelEn: 'Pending', variant: 'warning', color: '#f59e0b' },
  UNDER_REVIEW: { labelAr: 'قيد المراجعة', labelEn: 'Under Review', variant: 'info', color: '#0ea5e9' },
  IN_PROGRESS: { labelAr: 'جار التنفيذ', labelEn: 'In Progress', variant: 'primary', color: '#2580eb' },
  COMPLETED: { labelAr: 'مكتمل', labelEn: 'Completed', variant: 'success', color: '#10b981' },
  DELIVERED: { labelAr: 'تم التسليم', labelEn: 'Delivered', variant: 'success', color: '#10b981' },
  CANCELLED: { labelAr: 'ملغى', labelEn: 'Cancelled', variant: 'danger', color: '#ef4444' },
};

const quickActions = [
  { labelAr: 'إضافة خدمة', labelEn: 'Add Service', href: '/admin/services', icon: Wrench, color: '#2580eb' },
  { labelAr: 'إدارة الطلبات', labelEn: 'Manage Orders', href: '/admin/orders', icon: Package, color: '#14b8a6' },
  { labelAr: 'المدفوعات', labelEn: 'Payments', href: '/admin/payments', icon: DollarSign, color: '#7c3aed' },
  { labelAr: 'العملاء', labelEn: 'Customers', href: '/admin/customers', icon: Users, color: '#f59e0b' },
  { labelAr: 'السجلات', labelEn: 'Audit Logs', href: '/admin/audit-logs', icon: FileText, color: '#ef4444' },
];

const auditActionLabels: Record<string, { ar: string; en: string }> = {
  CREATE: { ar: 'إنشاء', en: 'Create' },
  UPDATE: { ar: 'تعديل', en: 'Update' },
  DELETE: { ar: 'حذف', en: 'Delete' },
  LOGIN: { ar: 'تسجيل دخول', en: 'Login' },
  LOGOUT: { ar: 'تسجيل خروج', en: 'Logout' },
};

export default function AdminDashboardPage() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [newCustomerCount, setNewCustomerCount] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; value: number }[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes, logsRes] = await Promise.all([
          fetch('/api/orders?limit=200'),
          fetch('/api/users'),
          fetch('/api/admin/audit-logs?limit=5'),
        ]);

        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();
        const logsData = await logsRes.json();

        if (ordersData.success && ordersData.data) {
          const allOrders: ApiOrder[] = ordersData.data;
          setOrders(allOrders);

          const paidOrders = allOrders.filter(
            (o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED'
          );
          const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayNames = isAr ? dayNamesAr : dayNamesEn;
          const now = new Date();
          const weekData: { day: string; value: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            const dayTotal = paidOrders
              .filter((o) => o.createdAt.startsWith(dayStr))
              .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            weekData.push({ day: dayNames[d.getDay()], value: dayTotal });
          }
          setWeeklyRevenue(weekData);
        }

        if (usersData.success && usersData.data) {
          const customers = usersData.data.filter(
            (u: { role: string }) => u.role === 'CUSTOMER' || u.role === 'customer'
          );
          setCustomerCount(customers.length);

          const todayStr = new Date().toISOString().split('T')[0];
          const newToday = usersData.data.filter((u: { createdAt?: string }) => {
            return u.createdAt && u.createdAt.startsWith(todayStr);
          }).length;
          setNewCustomerCount(newToday);
        }

        if (logsData.success && logsData.data) {
          setAuditLogs(logsData.data);
        }
      } catch {
        toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAr]);

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.value), 1);
  const recentOrders = orders.slice(0, 5);
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const newOrders = orders.filter((o) => o.status === 'PENDING').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayOrdersCount = todayOrders.length;
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const weekOrdersCount = orders.filter((o) => new Date(o.createdAt) >= startOfWeek).length;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthRevenue = orders
    .filter(
      (o) =>
        new Date(o.createdAt) >= startOfMonth &&
        (o.paymentStatus === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED')
    )
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const inProgressOrders = orders.filter((o) => o.status === 'IN_PROGRESS').length;

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const totalOrdersForStatus = orders.length || 1;

  const serviceCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const name = o.service?.name || (isAr ? 'أخرى' : 'Other');
    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxServiceCount = Math.max(...topServices.map(([, c]) => c), 1);

  const statCards = [
    { label: isAr ? 'إجمالي الطلبات' : 'Total Orders', value: orders.length, suffix: '', icon: Package, color: '#2580eb', numeric: orders.length },
    { label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue', value: totalRevenue, suffix: ' ر.س', icon: DollarSign, color: '#14b8a6', numeric: totalRevenue },
    { label: isAr ? 'عدد العملاء' : 'Customers', value: customerCount, suffix: '', icon: Users, color: '#7c3aed', numeric: customerCount },
    { label: isAr ? 'طلبات جديدة' : 'New Orders', value: newOrders, suffix: '', icon: ShoppingCart, color: '#f59e0b', numeric: newOrders },
    { label: isAr ? 'طلبات اليوم' : "Today's Orders", value: todayOrdersCount, suffix: '', icon: CalendarDays, color: '#06b6d4', numeric: todayOrdersCount },
    { label: isAr ? 'طلبات هذا الأسبوع' : 'This Week Orders', value: weekOrdersCount, suffix: '', icon: Clock, color: '#4f46e5', numeric: weekOrdersCount },
    { label: isAr ? 'إيرادات هذا الشهر' : "This Month Revenue", value: monthRevenue, suffix: ' ر.س', icon: TrendingUp, color: '#10b981', numeric: monthRevenue },
    { label: isAr ? 'طلبات قيد التنفيذ' : 'In Progress Orders', value: inProgressOrders, suffix: '', icon: Loader2, color: '#f97316', numeric: inProgressOrders },
  ];

  const getStatusLabel = (status: string) => statusConfig[status]?.[isAr ? 'labelAr' : 'labelEn'] || status;

  return (
    <div className="space-y-8">
      <PageHeader
        title={isAr ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
        subtitle={isAr ? 'مرحباً بك في لوحة التحكم' : 'Welcome to the dashboard'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                      {stat.numeric.toLocaleString()}{stat.suffix}
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'الطلبات الأخيرة' : 'Recent Orders'}</h3>
              <Link href="/admin/orders" className="text-sm text-[#2580eb] hover:underline flex items-center gap-1">
                {isAr ? 'عرض الكل' : 'View All'} <ArrowUpRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5">
                      <th className="text-start py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'العميل' : 'Customer'}</th>
                      <th className="text-start py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الخدمة' : 'Service'}</th>
                      <th className="text-start py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="text-end py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'المبلغ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                              {(order.customerName || (isAr ? 'م' : 'C')).charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{order.customerName || (isAr ? 'عميل' : 'Customer')}</p>
                              <p className="text-xs text-slate-400">{order.orderNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{order.service?.name || '-'}</td>
                        <td className="py-3 px-2">
                          <Badge variant={statusConfig[order.status]?.variant || 'primary'} size="sm" dot>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-end font-bold text-slate-900 dark:text-white">
                          {Number(order.total || 0).toLocaleString()} ر.س
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                          {isAr ? 'لا توجد طلبات بعد' : 'No orders yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'توزيع حالات الطلبات' : 'Order Status Distribution'}</h3>
            </CardHeader>
            <CardContent>
              <div className="w-full h-8 rounded-full overflow-hidden flex bg-slate-100 dark:bg-white/10">
                {Object.entries(statusCounts).map(([status, count], i) => {
                  const pct = (count / totalOrdersForStatus) * 100;
                  const cfg = statusConfig[status];
                  if (!cfg || pct === 0) return null;
                  return (
                    <motion.div
                      key={status}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                      className="h-full relative group cursor-pointer"
                      style={{ backgroundColor: cfg.color }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {getStatusLabel(status)}: {pct.toFixed(1)}%
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const cfg = statusConfig[status];
                  if (!cfg) return null;
                  return (
                    <div key={status} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {getStatusLabel(status)}: {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'الخدمات الأكثر طلباً' : 'Top Services'}</h3>
            </CardHeader>
            <CardContent>
              {topServices.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-slate-500 py-6">{isAr ? 'لا توجد بيانات' : 'No data yet'}</p>
              ) : (
                <div className="space-y-4">
                  {topServices.map(([name, count], i) => (
                    <div key={name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-[#f59e0b]" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{count} {isAr ? 'طلب' : 'orders'}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxServiceCount) * 100}%` }}
                          transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 100 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'ملخص اليوم' : "Today's Summary"}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#2580eb]/10 flex items-center justify-center">
                      <ShoppingCart size={18} className="text-[#2580eb]" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{isAr ? 'طلبات اليوم' : "Today's Orders"}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{todayOrdersCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign size={18} className="text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{isAr ? 'إيرادات اليوم' : "Today's Revenue"}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{todayRevenue.toLocaleString()} ر.س</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
                      <Users size={18} className="text-[#7c3aed]" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{isAr ? 'عملاء جدد اليوم' : 'New Customers Today'}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{newCustomerCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${action.color}15` }}
                      >
                        <action.icon size={18} style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{isAr ? action.labelAr : action.labelEn}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'النشاط الأخير' : 'Recent Activity'}</h3>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-slate-500 py-4 text-sm">{isAr ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => {
                    const actionIcon = log.action === 'CREATE' ? CheckCircle2 : log.action === 'DELETE' ? Ban : AlertCircle;
                    const actionColor = log.action === 'CREATE' ? '#10b981' : log.action === 'DELETE' ? '#ef4444' : '#f59e0b';
                    const LogIcon = actionIcon;
                    const timeAgo = getTimeAgo(log.createdAt, isAr);
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${actionColor}15` }}
                        >
                          <LogIcon size={16} style={{ color: actionColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            <span className="font-medium">{log.user?.name || (isAr ? 'مستخدم' : 'User')}</span>{' '}
                            {auditActionLabels[log.action]?.[isAr ? 'ar' : 'en'] || log.action}{' '}
                            <span className="font-medium">{log.resource}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'إيرادات آخر 7 أيام (المدفوعة فقط)' : 'Last 7 Days Revenue (Paid Only)'}</h3>
        </CardHeader>
        <CardContent>
          <div className="h-52 flex items-end justify-between gap-3 px-2">
            {weeklyRevenue.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: item.value > 0 ? `${(item.value / maxRevenue) * 100}%` : '4px' }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#2580eb] to-[#14b8a6] hover:opacity-80 transition-opacity cursor-pointer relative group min-h-[4px]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.value.toLocaleString()} ر.س
                  </div>
                </motion.div>
                <span className="text-xs text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeAgo(dateStr: string, isAr: boolean): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (isAr) {
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `منذ ${diffH} ساعة`;
    const diffD = Math.floor(diffH / 24);
    return `منذ ${diffD} يوم`;
  }
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}
