'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, Check, Info } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { cn } from '@/lib/utils';

interface Permission {
  id: string;
  role: string;
  roleEn: string;
  dashboard: boolean;
  services: boolean;
  orders: boolean;
  customers: boolean;
  employees: boolean;
  invoices: boolean;
  payments: boolean;
  notifications: boolean;
  reviews: boolean;
  news: boolean;
  pages: boolean;
  banners: boolean;
  offers: boolean;
  coupons: boolean;
  permissions: boolean;
  reports: boolean;
  settings: boolean;
}

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

const defaultPermissions: Permission[] = [
  { id: 'perm1', role: 'مدير النظام', roleEn: 'Admin', dashboard: true, services: true, orders: true, customers: true, employees: true, invoices: true, payments: true, notifications: true, reviews: true, news: true, pages: true, banners: true, offers: true, coupons: true, permissions: true, reports: true, settings: true },
  { id: 'perm2', role: 'مدير قسم', roleEn: 'Manager', dashboard: true, services: true, orders: true, customers: true, employees: false, invoices: true, payments: true, notifications: true, reviews: true, news: true, pages: false, banners: false, offers: true, coupons: true, permissions: false, reports: true, settings: false },
  { id: 'perm3', role: 'موظف', roleEn: 'Employee', dashboard: true, services: true, orders: true, customers: false, employees: false, invoices: false, payments: false, notifications: true, reviews: false, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
  { id: 'perm4', role: 'دعم فني', roleEn: 'Support', dashboard: true, services: false, orders: true, customers: true, employees: false, invoices: false, payments: false, notifications: true, reviews: true, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
];

const roleColors = [
  'from-[#2580eb] to-[#14b8a6]',
  'from-[#7c3aed] to-[#a78bfa]',
  'from-[#14b8a6] to-[#06b6d4]',
  'from-[#f59e0b] to-[#fbbf24]',
  'from-[#ef4444] to-[#f87171]',
];

export default function PermissionsPage() {
  const { language } = useLanguageStore();
  const { dir } = useDirection();

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/settings');
      const json = await res.json();
      if (json.success && json.data?.permissions) {
        setLocalPermissions(json.data.permissions);
      }
    } catch {
      // Use defaults
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const [localPermissions, setLocalPermissions] = useState<Permission[]>(defaultPermissions);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleToggle = (permId: string, key: string) => {
    setLocalPermissions((prev) =>
      prev.map((p) =>
        p.id === permId ? { ...p, [key]: !p[key as keyof typeof p] } : p,
      ),
    );
  };

  const handleSave = async (permId: string) => {
    const perm = localPermissions.find((p) => p.id === permId);
    if (!perm) return;

    const updates: Record<string, boolean> = {};
    for (const col of permissionColumns) {
      updates[col.key] = perm[col.key as keyof typeof perm] as boolean;
    }

    try {
      await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: localPermissions }),
      });
    } catch {
      // Save locally even if API fails
    }

    setSavedId(permId);
    setTimeout(() => setSavedId(null), 2000);
  };

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

      <Card>
        <CardContent>
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
                  <th className="text-center py-3 px-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    الحفظ
                  </th>
                </tr>
              </thead>
              <tbody>
                {localPermissions.map((perm, idx) => (
                  <motion.tr
                    key={perm.id}
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
                        <div
                          className={cn(
                            'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-md',
                            roleColors[idx % roleColors.length],
                          )}
                        >
                          {perm.role.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {perm.role}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {perm.roleEn}
                          </p>
                        </div>
                      </div>
                    </td>
                    {permissionColumns.map((col) => {
                      const value = perm[col.key as keyof typeof perm] as boolean;
                      return (
                        <td key={col.key} className="text-center py-4 px-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(perm.id, col.key)}
                            className={cn(
                              'mx-auto flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200 cursor-pointer',
                              'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
                              value
                                ? 'bg-[#14b8a6] shadow-sm shadow-[#14b8a6]/30 focus:ring-[#14b8a6]/50'
                                : 'bg-slate-300 dark:bg-slate-600 focus:ring-slate-400/50',
                            )}
                          >
                            {value && <Check size={12} className="text-white" />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-center py-4 px-3">
                      <div className="flex items-center justify-center gap-2">
                        {savedId === perm.id && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-[#14b8a6] font-semibold flex items-center gap-1"
                          >
                            <Check size={12} />
                            تم الحفظ
                          </motion.span>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSave(perm.id)}
                          iconRight={<Save size={14} />}
                        >
                          حفظ
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <Info size={14} />
            <p className="text-xs">
              انقر على الدائرة لتبديل الصلاحية. الأخضر تعني مفعّل، والرمادي تعني معطّل.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
