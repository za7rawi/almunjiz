'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  ShoppingCart,
  Wrench,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminCMSStore } from '@/store/admin-cms-store';

const recentOrders = [
  { id: 'AM-XYZ-1234', customer: 'محمد أحمد', service: 'تأشيرة سياحية', status: 'PENDING', amount: 250, date: '2026-07-23' },
  { id: 'AM-ABC-5678', customer: 'خالد سعيد', service: 'تسجيل مركبة', status: 'IN_PROGRESS', amount: 300, date: '2026-07-22' },
  { id: 'AM-DEF-9012', customer: 'فهد العلي', service: 'عقد إيجار', status: 'COMPLETED', amount: 200, date: '2026-07-22' },
  { id: 'AM-GHI-3456', customer: 'أحمد الشمري', service: 'تأشيرة عمل', status: 'PENDING', amount: 450, date: '2026-07-21' },
  { id: 'AM-JKL-7890', customer: 'سعد الدوسري', service: 'ترجمة وثائق', status: 'IN_PROGRESS', amount: 180, date: '2026-07-21' },
];

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'info' | 'danger' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  CANCELLED: { label: 'ملغى', variant: 'danger' },
};

const revenueData = [
  { day: 'السبت', value: 4200 },
  { day: 'الأحد', value: 5800 },
  { day: 'الاثنين', value: 4900 },
  { day: 'الثلاثاء', value: 7200 },
  { day: 'الأربعاء', value: 6100 },
  { day: 'الخميس', value: 8500 },
  { day: 'الجمعة', value: 7800 },
];

const statusBreakdown = [
  { label: 'قيد الانتظار', count: 42, color: '#f59e0b', percentage: 22 },
  { label: 'جار التنفيذ', count: 35, color: '#2580eb', percentage: 19 },
  { label: 'مكتمل', count: 98, color: '#14b8a6', percentage: 52 },
  { label: 'ملغى', count: 12, color: '#ef4444', percentage: 7 },
];

const quickActions = [
  { label: 'إضافة خدمة', href: '/admin/services', icon: Wrench, color: '#2580eb' },
  { label: 'إدارة الطلبات', href: '/admin/orders', icon: Package, color: '#14b8a6' },
  { label: 'إضافة كوبون', href: '/admin/coupons', icon: DollarSign, color: '#7c3aed' },
];

function EditableStat({
  label,
  value,
  icon: Icon,
  color,
  onChange,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const save = () => {
    onChange(tempValue);
    setEditing(false);
  };

  return (
    <Card glass>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && save()}
                  autoFocus
                  className="w-full text-2xl font-bold bg-transparent border-b-2 border-[#2580eb] text-slate-900 dark:text-white focus:outline-none py-0.5"
                />
                <button
                  onClick={save}
                  className="p-1 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => {
                    setTempValue(value);
                    setEditing(false);
                  }}
                  className="p-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <button
                  onClick={() => {
                    setTempValue(value);
                    setEditing(true);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-[#2580eb] transition-colors"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { stats, updateStats } = useAdminCMSStore();
  const maxRevenue = Math.max(...revenueData.map((d) => d.value));

  const statCards = [
    { label: 'إجمالي الطلبات', key: 'totalOrders' as const, icon: Package, color: '#2580eb' },
    { label: 'الإيرادات', key: 'totalRevenue' as const, icon: DollarSign, color: '#14b8a6' },
    { label: 'العملاء النشطين', key: 'activeCustomers' as const, icon: Users, color: '#7c3aed' },
    { label: 'الطلبات الجديدة', key: 'newOrders' as const, icon: ShoppingCart, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">لوحة تحكم المدير</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">مرحباً بك في لوحة التحكم</p>
      </div>

      {/* Editable Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <EditableStat
              label={stat.label}
              value={stats[stat.key]}
              icon={stat.icon}
              color={stat.color}
              onChange={(value) => updateStats({ [stat.key]: value })}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">الطلبات الأخيرة</h3>
              <Link href="/admin/orders" className="text-sm text-[#2580eb] hover:underline flex items-center gap-1">
                عرض الكل <ArrowUpRight size={14} />
              </Link>
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold">
                              {order.customer.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{order.customer}</p>
                              <p className="text-xs text-slate-400">{order.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{order.service}</td>
                        <td className="py-3 px-2">
                          <Badge variant={statusConfig[order.status]?.variant || 'primary'} size="sm">
                            {statusConfig[order.status]?.label || order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-end font-bold text-slate-900 dark:text-white">{order.amount} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">الطلبات حسب الحالة</h3>
            </CardHeader>
            <CardContent>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {statusBreakdown.reduce<{ offset: number; items: React.ReactElement[] }>(
                    (acc, item, idx) => {
                      const circumference = 2 * Math.PI * 40;
                      const dashLength = (item.percentage / 100) * circumference;
                      const gapLength = circumference - dashLength;
                      acc.items.push(
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="12"
                          strokeDasharray={`${dashLength} ${gapLength}`}
                          strokeDashoffset={-acc.offset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      );
                      return { offset: acc.offset + dashLength, items: acc.items };
                    },
                    { offset: 0, items: [] }
                  ).items}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">187</span>
                  <span className="text-xs text-slate-400">إجمالي</span>
                </div>
              </div>
              <div className="space-y-2">
                {statusBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">إجراءات سريعة</h3>
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
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{action.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white">إيرادات آخر 7 أيام</h3>
        </CardHeader>
        <CardContent>
          <div className="h-52 flex items-end justify-between gap-3 px-2">
            {revenueData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxRevenue) * 100}%` }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#2580eb] to-[#14b8a6] hover:opacity-80 transition-opacity cursor-pointer relative group"
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
