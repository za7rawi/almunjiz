'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { NAVIGATION_LINKS, CONTACT_INFO } from '@/constants';
import { Logo } from '@/components/ui/logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

const menuVariants = {
  closed: {
    x: '100%',
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
  open: {
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
};

const overlayVariants = {
  closed: { opacity: 0, transition: { duration: 0.2 } },
  open: { opacity: 1, transition: { duration: 0.2 } },
};

const itemVariants = {
  closed: { opacity: 0, x: 50 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: 'spring' as const, stiffness: 300, damping: 24 },
  }),
};

export function MobileMenu({ isOpen, onClose, currentPath = '' }: MobileMenuProps) {
  const { language, setLanguage } = useLanguageStore();
  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLangToggle = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            dir={dir}
            className={cn(
              'fixed inset-y-0 z-50 w-full max-w-sm',
              'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl',
              'shadow-2xl border-l border-white/20',
              isRtl ? 'left-auto right-0 border-l' : 'right-auto left-0 border-r',
            )}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
                <Link href="/" onClick={onClose}>
                  <Logo size="sm" showText />
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={22} className="text-slate-600 dark:text-slate-300" />
                </motion.button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAVIGATION_LINKS.map((link, i) => {
                  const isActive = currentPath === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      custom={i}
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-[#2580eb]/10 to-[#14b8a6]/10 text-[#2580eb] border-r-2 border-[#2580eb]'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
                          isRtl ? 'border-r-2' : 'border-l-2',
                        )}
                      >
                        {language === 'ar' ? link.label : link.labelEn}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="p-4 space-y-3 border-t border-slate-200/50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <Link
                    href="/login"
                    onClick={onClose}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl',
                      'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white',
                      'shadow-lg shadow-[#2580eb]/25 hover:shadow-xl hover:shadow-[#2580eb]/30',
                      'transition-all duration-200',
                    )}
                  >
                    {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                  <motion.button
                    onClick={handleLangToggle}
                    className={cn(
                      'flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
                      'border-2 border-[#2580eb]/30 text-[#2580eb] bg-transparent hover:bg-[#2580eb]/5',
                    )}
                  >
                    {language === 'ar' ? 'English' : 'العربية'}
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-2 pt-2"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'معلومات الاتصال' : 'Contact Info'}
                  </p>
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-[#2580eb] transition-colors py-1.5"
                  >
                    <Phone size={15} className="text-[#2580eb]" />
                    {CONTACT_INFO.phone}
                  </a>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-[#2580eb] transition-colors py-1.5"
                  >
                    <Mail size={15} className="text-[#14b8a6]" />
                    {CONTACT_INFO.email}
                  </a>
                  <a
                    href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 hover:text-[#2580eb] transition-colors py-1.5"
                  >
                    <MessageCircle size={15} className="text-[#7c3aed]" />
                    +962791038472
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
