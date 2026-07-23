'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, ArrowLeft, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAVIGATION_LINKS } from '@/constants';
import { servicesData } from '@/lib/services-data';
import { useLanguageStore } from '@/store/language-store';

interface SearchResult {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  href: string;
  category: string;
  categoryEn: string;
  icon: string;
}

function buildSearchIndex(): SearchResult[] {
  const pages: SearchResult[] = NAVIGATION_LINKS.map((link) => ({
    id: `page-${link.href}`,
    title: link.label,
    titleEn: link.labelEn,
    description: `صفحة ${link.label}`,
    descriptionEn: `${link.labelEn} page`,
    href: link.href,
    category: 'الصفحات',
    categoryEn: 'Pages',
    icon: '📄',
  }));

  const extraPages: SearchResult[] = [
    { id: 'page-faq', title: 'الأسئلة الشائعة', titleEn: 'FAQ', description: 'الأسئلة الشائعة والإجابات', descriptionEn: 'Frequently asked questions', href: '/faq', category: 'الصفحات', categoryEn: 'Pages', icon: '❓' },
    { id: 'page-privacy', title: 'سياسة الخصوصية', titleEn: 'Privacy Policy', description: 'سياسة الخصوصية للمنصة', descriptionEn: 'Platform privacy policy', href: '/privacy', category: 'الصفحات', categoryEn: 'Pages', icon: '🔒' },
    { id: 'page-terms', title: 'الشروط والأحكام', titleEn: 'Terms & Conditions', description: 'الشروط والأحكام', descriptionEn: 'Terms and conditions', href: '/terms', category: 'الصفحات', categoryEn: 'Pages', icon: '📜' },
    { id: 'page-about', title: 'من نحن', titleEn: 'About Us', description: 'تعرف على المنجز', descriptionEn: 'About AL-MUNJIZ', href: '/about', category: 'الصفحات', categoryEn: 'Pages', icon: 'ℹ️' },
    { id: 'page-offers', title: 'العروض', titleEn: 'Offers', description: 'عروض وخصومات حصرية', descriptionEn: 'Exclusive offers and discounts', href: '/offers', category: 'الصفحات', categoryEn: 'Pages', icon: '🏷️' },
  ];

  const serviceResults: SearchResult[] = servicesData
    .filter((s) => s.isActive)
    .map((service) => ({
      id: `service-${service.id}`,
      title: service.name,
      titleEn: service.nameEn,
      description: service.categoryAr,
      descriptionEn: service.category,
      href: `/services/${service.id}`,
      category: 'الخدمات',
      categoryEn: 'Services',
      icon: service.icon,
    }));

  return [...pages, ...extraPages, ...serviceResults];
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[#2580eb]/30 text-white rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.15 } },
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const filtered = query.trim()
    ? searchIndex.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.descriptionEn.toLowerCase().includes(q)
        );
      })
    : [];

  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, item) => {
    const key = language === 'ar' ? item.category : item.categoryEn;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const flatResults = Object.values(grouped).flat();

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
        e.preventDefault();
        router.push(flatResults[selectedIndex].href);
        setQuery('');
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, flatResults, selectedIndex, onClose, router]);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl"
          >
            <div className="rounded-2xl bg-[#1e293b] border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <Search size={20} className="text-white/40 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder={language === 'ar' ? 'ابحث عن خدمة أو صفحة...' : 'Search for a service or page...'}
                  className="flex-1 bg-transparent text-white text-base placeholder:text-white/30 focus:outline-none"
                  dir="rtl"
                />
                <button
                  onClick={() => { setQuery(''); onClose(); }}
                  className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
                {query.trim() && flatResults.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-white/30 text-sm">
                      {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                    </p>
                  </div>
                )}

                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-5 py-2 bg-white/[0.03] border-b border-white/5">
                      <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">
                        {category}
                      </span>
                    </div>
                    {items.map((item) => {
                      const globalIndex = flatResults.indexOf(item);
                      return (
                        <motion.button
                          key={item.id}
                          data-index={globalIndex}
                          onClick={() => handleSelect(item.href)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-5 py-3 text-right transition-colors',
                            globalIndex === selectedIndex ? 'bg-[#2580eb]/10' : 'hover:bg-white/5',
                          )}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {highlightMatch(language === 'ar' ? item.title : item.titleEn, query)}
                            </p>
                            <p className="text-xs text-white/40 truncate mt-0.5">
                              {highlightMatch(language === 'ar' ? item.description : item.descriptionEn, query)}
                            </p>
                          </div>
                          <ArrowLeft size={14} className="text-white/20 shrink-0 rtl:rotate-180" />
                        </motion.button>
                      );
                    })}
                  </div>
                ))}

                {!query.trim() && (
                  <div className="py-12 text-center">
                    <FileText size={32} className="mx-auto mb-3 text-white/10" />
                    <p className="text-white/30 text-sm">
                      {language === 'ar' ? 'ابدأ الكتابة للبحث...' : 'Start typing to search...'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/20">
                      <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">↑↓</kbd>
                      <span>{language === 'ar' ? 'للتنقل' : 'to navigate'}</span>
                      <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">
                        <CornerDownLeft size={10} />
                      </kbd>
                      <span>{language === 'ar' ? 'للاختيار' : 'to select'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
