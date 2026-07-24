'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  FileText,
  CreditCard,
  Bell,
  Star,
  Newspaper,
  File,
  Images,
  Tag,
  Percent,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Layers,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { useIsMobile } from '@/hooks/use-media-query';
import { getInitials } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { useAuthStore } from '@/store/auth-store';

interface AdminSidebarItem {
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  href: string;
}

const adminSidebarItems: AdminSidebarItem[] = [
  { label: 'لوحة التحكم', labelEn: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
  { label: 'الخدمات', labelEn: 'Services', icon: <Layers size={20} />, href: '/admin/services' },
  { label: 'الطلبات', labelEn: 'Orders', icon: <Package size={20} />, href: '/admin/orders' },
  { label: 'العملاء', labelEn: 'Customers', icon: <Users size={20} />, href: '/admin/customers' },
  { label: 'الموظفون', labelEn: 'Employees', icon: <UserCog size={20} />, href: '/admin/employees' },
  { label: 'الفواتير', labelEn: 'Invoices', icon: <FileText size={20} />, href: '/admin/invoices' },
  { label: 'المدفوعات', labelEn: 'Payments', icon: <CreditCard size={20} />, href: '/admin/payments' },
  { label: 'بوابات الدفع', labelEn: 'Gateways', icon: <Wallet size={20} />, href: '/admin/gateways' },
  { label: 'الإشعارات', labelEn: 'Notifications', icon: <Bell size={20} />, href: '/admin/notifications' },
  { label: 'التقييمات', labelEn: 'Reviews', icon: <Star size={20} />, href: '/admin/reviews' },
  { label: 'الأخبار', labelEn: 'News', icon: <Newspaper size={20} />, href: '/admin/news' },
  { label: 'الصفحات', labelEn: 'Pages', icon: <File size={20} />, href: '/admin/pages' },
  { label: 'البانرات', labelEn: 'Banners', icon: <Images size={20} />, href: '/admin/banners' },
  { label: 'العروض', labelEn: 'Offers', icon: <Tag size={20} />, href: '/admin/offers' },
  { label: 'الكوبونات', labelEn: 'Coupons', icon: <Percent size={20} />, href: '/admin/coupons' },
  { label: 'الصلاحيات', labelEn: 'Permissions', icon: <Shield size={20} />, href: '/admin/permissions' },
  { label: 'التقارير', labelEn: 'Reports', icon: <BarChart3 size={20} />, href: '/admin/reports' },
  { label: 'الإعدادات', labelEn: 'Settings', icon: <Settings size={20} />, href: '/admin/settings' },
];

interface AdminSidebarProps {
  adminName?: string;
  adminEmail?: string;
  adminAvatar?: string | null;
}

export function AdminSidebar({ adminName = 'مدير', adminEmail = 'admin@almunjiz.com', adminAvatar }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguageStore();
  const { dir, isRtl } = useDirection();
  const isMobile = useIsMobile();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    const locale = pathname.split('/')[1] || 'ar';
    router.push(`/${locale}/admin/login`);
  };

  const initials = getInitials(adminName);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link
          href="/admin"
          onClick={() => isMobile && setMobileOpen(false)}
          className={cn(
            'transition-all duration-300',
            collapsed && !isMobile ? 'mx-auto' : '',
          )}
        >
          {collapsed && !isMobile ? (
            <Logo size="sm" white />
          ) : (
            <Logo size="sm" showText white />
          )}
        </Link>
        {!isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'hover:bg-white/10 text-slate-400 hover:text-white',
            )}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.div>
          </motion.button>
        )}
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {adminSidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-[#2580eb]/15 to-[#14b8a6]/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className={cn(
                    'absolute inset-y-1 w-0.5 rounded-full bg-gradient-to-b from-[#2580eb] to-[#14b8a6]',
                    isRtl ? 'right-0' : 'left-0',
                  )}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={cn('shrink-0', isActive ? 'text-[#2580eb]' : '')}>
                {item.icon}
              </span>
              <AnimatePresence>
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {language === 'ar' ? item.label : item.labelEn}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className={cn('p-3 border-t border-white/10', collapsed && !isMobile ? 'text-center' : '')}>
        <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-white/5', collapsed && !isMobile ? 'justify-center' : '')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2580eb] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {adminAvatar ? (
              <img src={adminAvatar} alt={adminName} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{adminName}</p>
                <p className="text-xs text-slate-400 truncate">{adminEmail}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full mt-2 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200',
            collapsed && !isMobile ? 'justify-center' : '',
          )}
        >
          <LogOut size={18} />
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                {language === 'ar' ? 'تسجيل خروج' : 'Logout'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 z-40 p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
          style={{ [isRtl ? 'right' : 'left']: '16px' }}
        >
          <Menu size={20} className="text-slate-700 dark:text-slate-200" />
        </motion.button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: isRtl ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? '100%' : '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                  'fixed inset-y-0 z-50 w-72',
                  'bg-slate-900 border-l border-white/10',
                  isRtl ? 'right-0 border-l' : 'left-0 border-r',
                )}
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed inset-y-0 z-20 bg-slate-900 border-r border-white/5',
        'shadow-2xl shadow-black/20',
        isRtl ? 'right-0' : 'left-0',
      )}
    >
      {sidebarContent}
    </motion.aside>
  );
}
