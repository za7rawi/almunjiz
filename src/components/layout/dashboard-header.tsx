'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { getInitials } from '@/lib/utils';

interface DashboardHeaderProps {
  userName?: string;
  userAvatar?: string | null;
  notificationCount?: number;
  onMenuToggle?: () => void;
}

export function DashboardHeader({
  userName = 'مستخدم',
  userAvatar,
  notificationCount = 0,
  onMenuToggle,
}: DashboardHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguageStore();
  const { dir, isRtl } = useDirection();

  const initials = getInitials(userName);

  return (
    <header
      dir={dir}
      className={cn(
        'sticky top-0 z-30 h-16 md:h-18',
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
        'border-b border-slate-200/50 dark:border-slate-700/50',
        'shadow-sm',
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6 gap-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
          >
            <Menu size={20} />
          </motion.button>

          <motion.div
            animate={{ width: searchFocused ? 320 : 240 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'relative hidden sm:block',
            )}
          >
            <Search
              size={16}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-slate-400 transition-colors',
                isRtl ? 'right-3' : 'left-3',
                searchFocused ? 'text-[#2580eb]' : '',
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              className={cn(
                'w-full h-10 pl-10 pr-4 rounded-xl text-sm',
                'bg-slate-100 dark:bg-slate-800 border border-transparent',
                'focus:bg-white dark:focus:bg-slate-800',
                'focus:border-[#2580eb]/30 focus:ring-2 focus:ring-[#2580eb]/20',
                'text-slate-900 dark:text-white placeholder:text-slate-400',
                'transition-all duration-200 outline-none',
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4',
              )}
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-slate-600 dark:text-slate-300" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center',
                  'bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full',
                  'px-1 shadow-lg shadow-red-500/30',
                )}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </motion.span>
            )}
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                'flex items-center gap-2 md:gap-3 p-1.5 md:pr-3 rounded-xl',
                'hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200',
                'border border-transparent hover:border-slate-200 dark:hover:border-slate-700',
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">
                {userName}
              </span>
              <motion.span
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block"
              >
                <ChevronDown size={14} className="text-slate-400" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={cn(
                      'absolute top-full mt-2 w-56 z-20',
                      'bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/10',
                      'border border-slate-200 dark:border-slate-700',
                      'overflow-hidden',
                      isRtl ? 'left-0' : 'right-0',
                    )}
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">user@example.com</p>
                    </div>
                    <div className="p-1.5">
                      <UserMenuItem
                        icon={<User size={16} />}
                        label={language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        onClick={() => setShowUserMenu(false)}
                      />
                      <UserMenuItem
                        icon={<Settings size={16} />}
                        label={language === 'ar' ? 'الإعدادات' : 'Settings'}
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                      <UserMenuItem
                        icon={<LogOut size={16} />}
                        label={language === 'ar' ? 'تسجيل خروج' : 'Logout'}
                        onClick={() => setShowUserMenu(false)}
                        danger
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function UserMenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white',
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}
