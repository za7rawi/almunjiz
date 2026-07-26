'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import { countries, type Country } from '@/lib/countries';
import { cn } from '@/lib/utils';

interface CountrySelectProps {
  value: string;
  onChange: (country: Country) => void;
  className?: string;
}

export function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = countries.find(c => c.code === value) || countries[0];

  const filtered = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      c =>
        c.name.includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClose]);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-3 rounded-xl border transition-all duration-200 cursor-pointer',
          'bg-white/[0.05] text-white text-sm',
          open
            ? 'border-[#2580eb]/50 ring-2 ring-[#2580eb]/20'
            : 'border-white/[0.08] hover:border-white/[0.15]',
        )}
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="text-white/60 text-sm font-medium" dir="ltr">{selected.dialCode}</span>
        <ChevronDown
          size={14}
          className={cn('text-white/30 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 w-72 max-h-80 rounded-2xl bg-[#111827]/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="p-2.5 border-b border-white/[0.08]">
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث..."
                  className="w-full pr-8 pl-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#2580eb]/50 transition-colors"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-60 p-1.5 scrollbar-thin">
              {filtered.length === 0 ? (
                <p className="text-center text-white/30 text-sm py-6">لا توجد نتائج</p>
              ) : (
                filtered.map(country => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onChange(country);
                      handleClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer',
                      country.code === value
                        ? 'bg-[#2580eb]/15 text-white'
                        : 'text-white/70 hover:bg-white/[0.06] hover:text-white',
                    )}
                  >
                    <span className="text-lg leading-none shrink-0">{country.flag}</span>
                    <div className="flex-1 text-right min-w-0">
                      <p className="font-medium truncate">{country.name}</p>
                      <p className="text-xs text-white/35 truncate">{country.nameEn}</p>
                    </div>
                    <span className="text-xs text-white/40 font-medium shrink-0" dir="ltr">{country.dialCode}</span>
                    {country.code === value && (
                      <Check size={14} className="text-[#2580eb] shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
