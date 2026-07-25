'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Users, DollarSign, ArrowUpRight, ShoppingCart, Wrench, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/store/language-store';

interface ApiOrder {
  id: string; orderNumber: string; status: string; amount: number; total: number;
  customerName: string; customerEmail: string; createdAt: string;
  paymentStatus?: string;
  service?: { name: string };
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'info' | 'danger' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'info' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  DELIVERED: { label: 'تم التسليم', variant: 'success' },
  CANCELLED: { label: 'ملغى', variant: 'danger' },
};

const quickActions = [
  { label: 'إضافة خدمة', href: '/admin/services', icon: Wrench, color: '#2580eb' },
  { label: 'إدارة الطلبات', href: '/admin/orders', icon: Package, color: '#14b8a6' },
  { label: 'المدفوعات', href: '/admin/payments', icon: DollarSign, color: '#7c3aed' },
];

export default function AdminDashboardPage() {
  const { language } = useLanguageStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; value: number }[]>([]);

  useEffect(() => {
    fetch('/api/orders?limit=200')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrders(data.data);
          const paidOrders = data.data.filter((o: ApiOrder) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED');
          const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          const now = new Date();
          const weekData: { day: string; value: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            const dayTotal = paidOrders
              .filter((o: ApiOrder) => o.createdAt.startsWith(dayStr))
              .reduce((sum: number, o: ApiOrder) => sum + (Number(o.total) || 0), 0);
            weekData.push({ day: dayNames[d.getDay()], value: dayTotal });
          }
          setWeeklyRevenue(weekData);
        }
      })
      .catch(() => {});
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setCustomerCount(data.data.filter((u: { role: string }) => u.role === 'CUSTOMER' || u.role === 'customer').length);
        }
      })
      .catch(() => {});
  }, []);

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.value), 1);
  const recentOrders = orders.slice(0, 5);
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const newOrders = orders.filter((o) => o.status === 'PENDING').length;

  const statCards = [
    { label: 'إجمالي الطلبات', value: orders.length.toString(), icon: Package, color: '#2580eb' },
    { label: 'الإيرادات', value: `${totalRevenue.toLocaleString()} ر.س`, icon: DollarSign, color: '#14b8a6' },
    { label: 'العملاء', value: customerCount.toString(), icon: Users, color: '#7c3aed' },
    { label: 'طلبات جديدة', value: newOrders.toString(), icon: ShoppingCart, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">لوحة تحكم المدير</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">مرحباً بك في لوحة التحكم</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-lg">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stat.value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">الطلبات الأخيرة</h3>
              <Link href="/admin/orders" className="text-sm text-[#2580eb] hover:underline flex items-center gap-1">عرض الكل <ArrowUpRight size={14} /></Link>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5">
                      <th className="text-start py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">العميل</th>
                      <th className="text-start py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">الخدمة</th>
                      <th className="text-start py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">الحالة</th>
                      <th className="text-end py-3 px-2 text-slate-500 dark:text-slate-400 font-medium">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">{(order.customerName || 'م').charAt(0)}</div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{order.customerName || 'عميل'}</p>
                              <p className="text-xs text-slate-400">{order.orderNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{order.service?.name || '-'}</td>
                        <td className="py-3 px-2"><Badge variant={statusConfig[order.status]?.variant || 'primary'} size="sm">{statusConfig[order.status]?.label || order.status}</Badge></td>
                        <td className="py-3 px-2 text-end font-bold text-slate-900 dark:text-white">{Number(order.total || 0).toLocaleString()} ر.س</td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">لا توجد طلبات بعد</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">إجراءات سريعة</h3></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}><action.icon size={18} style={{ color: action.color }} /></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">إيرادات آخر 7 أيام (المدفوعة فقط)</h3></CardHeader>
        <CardContent>
          <div className="h-52 flex items-end justify-between gap-3 px-2">
            {weeklyRevenue.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: item.value > 0 ? `${(item.value / maxRevenue) * 100}%` : '4px' }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }} className="w-full rounded-t-lg bg-gradient-to-t from-[#2580eb] to-[#14b8a6] hover:opacity-80 transition-opacity cursor-pointer relative group min-h-[4px]">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.value.toLocaleString()} ر.س</div>
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
