'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Receipt,
  CreditCard,
  FolderOpen,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { useIsMobile } from '@/hooks/use-media-query';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Logo } from '@/components/ui/logo';

interface SidebarItem {
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'لوحة التحكم', labelEn: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
  { label: 'طلباتي', labelEn: 'My Orders', icon: <Package size={20} />, href: '/dashboard/orders' },
  { label: 'الفواتير', labelEn: 'Invoices', icon: <Receipt size={20} />, href: '/dashboard/invoices' },
  { label: 'المدفوعات', labelEn: 'Payments', icon: <CreditCard size={20} />, href: '/dashboard/payments' },
  { label: 'ملفاتي', labelEn: 'My Files', icon: <FolderOpen size={20} />, href: '/dashboard/files' },
  { label: 'الإشعارات', labelEn: 'Notifications', icon: <Bell size={20} />, href: '/dashboard/notifications' },
  { label: 'المحادثات', labelEn: 'Chat', icon: <MessageSquare size={20} />, href: '/dashboard/chat' },
  { label: 'الإعدادات', labelEn: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings' },
];

interface SidebarProps {
  user?: { name: string; email: string; avatar: string | null; role: string } | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, isOpen: externalOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const { isRtl } = useDirection();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { logout } = useAuthStore();

  const userName = user?.name || 'مستخدم';
  const userEmail = user?.email || 'user@example.com';
  const userAvatar = user?.avatar;
  const initials = getInitials(userName);

  const isOpen = externalOpen !== undefined ? externalOpen : mobileOpen;
  const handleClose = onClose || (() => setMobileOpen(false));

  const handleLogout = () => {
    logout();
    handleClose();
    router.replace('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link
          href="/dashboard"
          onClick={handleClose}
          className={cn(
            'transition-all duration-300',
            collapsed && !isMobile ? 'text-center w-full' : '',
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
              collapsed ? 'rotate-180' : '',
            )}
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
        )}
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-[#2580eb]/15 to-[#14b8a6]/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden relative">
            {userAvatar ? (
              <Image fill src={userAvatar} alt={userName} sizes="36px" className="rounded-full object-cover" />
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
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
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
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.aside
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'fixed inset-y-0 z-50 w-72',
                'bg-slate-900 border-l border-white/10',
                'shadow-2xl shadow-black/30',
                isRtl ? 'right-0 border-l' : 'left-0 border-r',
              )}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
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
