'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Users, FileText, CreditCard, Layers, X, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'order' | 'customer' | 'invoice' | 'payment' | 'service';
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  order: <Package size={14} />,
  customer: <Users size={14} />,
  invoice: <FileText size={14} />,
  payment: <CreditCard size={14} />,
  service: <Layers size={14} />,
};

const typeLabels: Record<string, { ar: string; en: string }> = {
  order: { ar: 'طلب', en: 'Order' },
  customer: { ar: 'عميل', en: 'Customer' },
  invoice: { ar: 'فاتورة', en: 'Invoice' },
  payment: { ar: 'دفع', en: 'Payment' },
  service: { ar: 'خدمة', en: 'Service' },
};

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setQuery('');
        setResults([]);
        setActiveType('all');
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const [ordersRes, usersRes, invoicesRes, servicesRes] = await Promise.allSettled([
        fetch(`/api/orders?search=${encodeURIComponent(q)}&limit=5`),
        fetch(`/api/users?search=${encodeURIComponent(q)}&limit=5`),
        fetch(`/api/invoices?search=${encodeURIComponent(q)}&limit=5`),
        fetch(`/api/services?search=${encodeURIComponent(q)}&limit=5`),
      ]);

      const all: SearchResult[] = [];

      if (ordersRes.status === 'fulfilled') {
        const data = await ordersRes.value.json();
        if (data.success && data.data) {
          for (const o of data.data.slice(0, 5)) {
            all.push({
              type: 'order', id: o.id,
              title: o.orderNumber,
              subtitle: o.customerName || o.customerEmail || '',
              href: '/admin/orders',
            });
          }
        }
      }

      if (usersRes.status === 'fulfilled') {
        const data = await usersRes.value.json();
        if (data.success && data.data) {
          for (const u of data.data.filter((u: { role: string }) => u.role === 'CUSTOMER').slice(0, 5)) {
            all.push({
              type: 'customer', id: u.id,
              title: u.name,
              subtitle: u.email,
              href: '/admin/customers',
            });
          }
        }
      }

      if (invoicesRes.status === 'fulfilled') {
        const data = await invoicesRes.value.json();
        if (data.success && data.data) {
          for (const inv of data.data.slice(0, 5)) {
            all.push({
              type: 'invoice', id: inv.id,
              title: inv.invoiceNumber,
              subtitle: inv.user?.name || '',
              href: '/admin/invoices',
            });
          }
        }
      }

      if (servicesRes.status === 'fulfilled') {
        const data = await servicesRes.value.json();
        if (data.success && data.data) {
          for (const s of data.data.slice(0, 5)) {
            all.push({
              type: 'service', id: s.id,
              title: isAr ? s.name : (s.nameEn || s.name),
              subtitle: `${s.price} SAR`,
              href: '/admin/services',
            });
          }
        }
      }

      setResults(all);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) performSearch(query);
      else setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const filteredResults = activeType === 'all' ? results : results.filter((r) => r.type === activeType);
  const types = ['all', ...new Set(results.map((r) => r.type))];

  const handleSelect = (result: SearchResult) => {
    onClose();
    router.push(result.href);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? 'بحث عن عملاء، طلبات، فواتير...' : 'Search customers, orders, invoices...'}
              className="flex-1 text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
            />
            <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>

          {types.length > 1 && (
            <div className="flex gap-1.5 px-4 py-2 border-b border-slate-50 overflow-x-auto">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors',
                    activeType === type
                      ? 'bg-[#2580eb]/10 text-[#2580eb]'
                      : 'text-slate-500 hover:bg-slate-100',
                  )}
                >
                  {type !== 'all' && typeIcons[type]}
                  {type === 'all' ? (isAr ? 'الكل' : 'All') : (isAr ? typeLabels[type]?.ar : typeLabels[type]?.en)}
                </button>
              ))}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#2580eb]" />
              </div>
            )}

            {!loading && query.length >= 2 && filteredResults.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                {isAr ? 'لا توجد نتائج' : 'No results found'}
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="py-8 text-center text-sm text-slate-400">
                {isAr ? 'اكتب حرفين على الأقل للبحث' : 'Type at least 2 characters to search'}
              </div>
            )}

            {!loading && filteredResults.length > 0 && (
              <div className="py-2">
                {filteredResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-slate-50 transition-colors text-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      {typeIcons[result.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{result.title}</p>
                      <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 shrink-0">
                      {isAr ? typeLabels[result.type]?.ar : typeLabels[result.type]?.en}
                    </span>
                    <ArrowRight size={14} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="px-1 py-0.5 rounded border border-slate-200 bg-white font-mono">ESC</span>
              <span>{isAr ? 'إغلاق' : 'Close'}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
