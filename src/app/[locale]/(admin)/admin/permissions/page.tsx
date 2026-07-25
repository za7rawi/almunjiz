'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Info, Users, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
}

interface RoleInfo {
  key: string;
  label: string;
  labelEn: string;
  color: string;
}

const roleDefinitions: RoleInfo[] = [
  { key: 'admin', label: 'مدير النظام', labelEn: 'Admin', color: 'from-[#2580eb] to-[#14b8a6]' },
  { key: 'manager', label: 'مدير قسم', labelEn: 'Manager', color: 'from-[#7c3aed] to-[#a78bfa]' },
  { key: 'employee', label: 'موظف', labelEn: 'Employee', color: 'from-[#14b8a6] to-[#06b6d4]' },
  { key: 'support', label: 'دعم فني', labelEn: 'Support', color: 'from-[#f59e0b] to-[#fbbf24]' },
  { key: 'customer', label: 'عميل', labelEn: 'Customer', color: 'from-[#ef4444] to-[#f87171]' },
];

const permissionColumns: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'لوحة التحكم' },
  { key: 'services', label: 'الخدمات' },
  { key: 'orders', label: 'الطلبات' },
  { key: 'customers', label: 'العملاء' },
  { key: 'employees', label: 'الموظفين' },
  { key: 'invoices', label: 'الفواتير' },
  { key: 'payments', label: 'المدفوعات' },
  { key: 'notifications', label: 'الإشعارات' },
  { key: 'reviews', label: 'التقييمات' },
  { key: 'news', label: 'الأخبار' },
  { key: 'pages', label: 'الصفحات' },
  { key: 'banners', label: 'البانرات' },
  { key: 'offers', label: 'العروض' },
  { key: 'coupons', label: 'الكوبونات' },
  { key: 'permissions', label: 'الصلاحيات' },
  { key: 'reports', label: 'التقارير' },
  { key: 'settings', label: 'الإعدادات' },
] as const;

const defaultAccess: Record<string, Record<string, boolean>> = {
  admin: Object.fromEntries(permissionColumns.map(c => [c.key, true])),
  manager: { dashboard: true, services: true, orders: true, customers: true, employees: false, invoices: true, payments: true, notifications: true, reviews: true, news: true, pages: false, banners: false, offers: true, coupons: true, permissions: false, reports: true, settings: false },
  employee: { dashboard: true, services: true, orders: true, customers: false, employees: false, invoices: false, payments: false, notifications: true, reviews: false, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
  support: { dashboard: true, services: false, orders: true, customers: true, employees: false, invoices: false, payments: false, notifications: true, reviews: true, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
  customer: { dashboard: true, services: true, orders: true, customers: false, employees: false, invoices: false, payments: false, notifications: true, reviews: true, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
};

export default function PermissionsPage() {
  const { language } = useLanguageStore();
  const { dir } = useDirection();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setUsers(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const usersByRole = roleDefinitions.map(role => ({
    ...role,
    users: users.filter(u => u.role === role.key),
  }));

  return (
    <div dir={dir}>
      <PageHeader
        title="إدارة الصلاحيات"
        subtitle="تحديد صلاحيات الوصول لكل دور في النظام"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'الصلاحيات' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {usersByRole.map((role, i) => (
          <motion.div
            key={role.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-md', role.color)}>
                    {role.label.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{role.label}</p>
                    <p className="text-xs text-slate-400">{role.labelEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{role.users.length}</p>
                  <p className="text-xs text-slate-500">{language === 'ar' ? 'مستخدم' : 'users'}</p>
                </div>
                {role.users.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {role.users.slice(0, 3).map(u => (
                      <p key={u.id} className="text-xs text-slate-500 truncate">{u.name || u.email}</p>
                    ))}
                    {role.users.length > 3 && <p className="text-xs text-slate-400">+{role.users.length - 3} {language === 'ar' ? 'آخرين' : 'more'}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#2580eb]" size={24} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="text-right py-3 px-3 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      الدور
                    </th>
                    {permissionColumns.map((col) => (
                      <th
                        key={col.key}
                        className="text-center py-3 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersByRole.map((role, idx) => (
                    <motion.tr
                      key={role.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'border-b border-slate-100 dark:border-white/5 transition-colors',
                        'hover:bg-slate-50 dark:hover:bg-white/5',
                      )}
                    >
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-md', role.color)}>
                            {role.label.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{role.label}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{role.labelEn}</p>
                          </div>
                        </div>
                      </td>
                      {permissionColumns.map((col) => {
                        const hasAccess = defaultAccess[role.key]?.[col.key] ?? false;
                        return (
                          <td key={col.key} className="text-center py-4 px-2">
                            <span
                              className={cn(
                                'mx-auto flex items-center justify-center w-5 h-5 rounded-full',
                                hasAccess
                                  ? 'bg-[#14b8a6] shadow-sm shadow-[#14b8a6]/30'
                                  : 'bg-slate-300 dark:bg-slate-600',
                              )}
                            >
                              {hasAccess && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </span>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Info size={14} />
            <p className="text-xs">
              الأخضر تعني مفعّل، والرمادي تعني معطّل. هذه مرجعية بصرية لصلاحيات الأدوار.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
