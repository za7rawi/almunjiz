'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  MessageCircle,
  Menu,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { NAVIGATION_LINKS, CONTACT_INFO } from '@/constants';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { SearchTrigger } from '@/components/shared/search-trigger';
import { CurrencyToggle } from '@/components/ui/currency-toggle';
import { useAuthStore } from '@/store/auth-store';
import { getInitials } from '@/lib/utils';

interface SiteSettings {
  whatsapp?: string;
  phone?: string;
  email?: string;
  logo?: string;
  siteName?: string;
  siteNameEn?: string;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const pathname = usePathname();
  const { language, setLanguage } = useLanguageStore();
  const { dir, isRtl } = useDirection();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/cms/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteSettings({
            whatsapp: json.data.whatsapp || json.data.contact_whatsapp,
            phone: json.data.phone || json.data.contact_phone,
            email: json.data.email || json.data.contact_email,
            logo: json.data.logo,
            siteName: json.data.siteName || json.data.site_name,
            siteNameEn: json.data.siteNameEn || json.data.site_name_en,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setMobileOpen(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  const phone = siteSettings.phone || CONTACT_INFO.phone;
  const email = siteSettings.email || CONTACT_INFO.email;
  const whatsapp = siteSettings.whatsapp || CONTACT_INFO.whatsapp;
  const whatsappMessage = encodeURIComponent(CONTACT_INFO.whatsappMessage);

  const handleLangToggle = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.replace('/');
  };

  const initials = user ? getInitials(user.name) : '';
  const hoveredNav = activeHover || pathname;

  const mobileMenuVariants = {
    closed: {
      x: isRtl ? '-100%' : '100%',
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
    open: {
      x: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  };

  return (
    <>
      <header
        dir={dir}
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#0f172a]/98 backdrop-blur-2xl shadow-2xl shadow-black/20 border-b border-white/5'
            : 'bg-[#0f172a]/95 backdrop-blur-2xl border-b border-white/[0.06]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18 lg:h-20">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Logo size="md" showText white />
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center gap-1 relative"
              onMouseLeave={() => setActiveHover(null)}
            >
              {NAVIGATION_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const isHovered = hoveredNav === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setActiveHover(link.href)}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 z-10',
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    )}
                  >
                    {language === 'ar' ? link.label : link.labelEn}
                    {(isActive || isHovered) && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 rounded-lg bg-white/[0.08]"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* WhatsApp */}
              <motion.a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 transition-all duration-300 border border-[#25D366]/20 hover:border-[#25D366]/40"
                title="WhatsApp"
              >
                <MessageCircle size={18} />
              </motion.a>

              <SearchTrigger />

              {/* Auth */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 md:gap-2.5 p-1.5 md:pr-3 rounded-xl hover:bg-white/[0.08] transition-all duration-300 border border-transparent hover:border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-[#2580eb]/30 relative">
                      {user.avatar ? (
                        <Image fill src={user.avatar} alt={user.name} sizes="32px" className="rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-white/80 max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <motion.span
                      animate={{ rotate: showUserMenu ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="hidden md:block"
                    >
                      <ChevronDown size={14} className="text-white/40" />
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
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={cn(
                            'absolute top-full mt-3 w-60 z-20',
                            'bg-[#1e293b]/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/30',
                            'border border-white/10 overflow-hidden',
                            isRtl ? 'left-0' : 'right-0'
                          )}
                        >
                          <div className="p-4 border-b border-white/[0.08]">
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                          </div>
                          <div className="p-2">
                            <UserMenuItem
                              icon={<LayoutDashboard size={16} />}
                              label={language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                              onClick={() => { setShowUserMenu(false); router.push('/dashboard'); }}
                            />
                            <UserMenuItem
                              icon={<Settings size={16} />}
                              label={language === 'ar' ? 'إعدادات الحساب' : 'Settings'}
                              onClick={() => { setShowUserMenu(false); router.push('/dashboard/settings'); }}
                            />
                            <div className="h-px bg-white/[0.08] my-1.5" />
                            <UserMenuItem
                              icon={<LogOut size={16} />}
                              label={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                              onClick={handleLogout}
                              danger
                            />
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="inline-flex">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30"
                    iconLeft={<LogIn size={16} />}
                  >
                    {language === 'ar' ? 'دخول' : 'Login'}
                  </Button>
                </Link>
              )}

              {/* Mobile hamburger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/[0.08]"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              dir={dir}
              className={cn(
                'fixed inset-y-0 z-50 w-full max-w-sm',
                'bg-[#0f172a] backdrop-blur-xl shadow-2xl',
                'border-white/10',
                isRtl ? 'left-0 border-r' : 'right-0 border-l'
              )}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                  <Link href="/" onClick={() => setMobileOpen(false)}>
                    <Logo size="sm" showText white />
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X size={22} className="text-white/70" />
                  </motion.button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {NAVIGATION_LINKS.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200',
                            isActive
                              ? 'bg-gradient-to-r from-[#2580eb]/15 to-[#14b8a6]/15 text-white'
                              : 'text-white/60 hover:bg-white/5 hover:text-white',
                            isActive && (isRtl ? 'border-r-2 border-[#2580eb]' : 'border-l-2 border-[#2580eb]')
                          )}
                        >
                          {language === 'ar' ? link.label : link.labelEn}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Bottom actions */}
                <div className="p-4 space-y-3 border-t border-white/[0.08]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1"
                    >
                      <Button variant="primary" size="md" fullWidth className="font-semibold">
                        {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                      </Button>
                    </Link>
                    <motion.button
                      onClick={handleLangToggle}
                      className="flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border-2 border-[#2580eb]/30 text-[#2580eb] bg-transparent hover:bg-[#2580eb]/5"
                    >
                      {language === 'ar' ? 'English' : 'العربية'}
                    </motion.button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.33 }}
                  >
                    <div className="flex items-center justify-center">
                      <CurrencyToggle />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-2 pt-2"
                  >
                    <p className="text-xs text-white/40 font-medium">
                      {language === 'ar' ? 'معلومات الاتصال' : 'Contact Info'}
                    </p>
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-3 text-sm text-white/60 hover:text-[#2580eb] transition-colors py-1.5"
                    >
                      <Phone size={15} className="text-[#2580eb]" />
                      {phone}
                    </a>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 text-sm text-white/60 hover:text-[#14b8a6] transition-colors py-1.5"
                    >
                      <Mail size={15} className="text-[#14b8a6]" />
                      {email}
                    </a>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-white/60 hover:text-[#25D366] transition-colors py-1.5"
                    >
                      <MessageCircle size={15} className="text-[#25D366]" />
                      WhatsApp
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
        'flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-white/60 hover:bg-white/[0.08] hover:text-white'
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}
