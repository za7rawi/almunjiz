'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { SearchModal } from '@/components/shared/search-modal';

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] text-white/50 hover:text-white/80 hover:bg-white/10 transition-all duration-200 border border-white/[0.08] hover:border-white/[0.15]"
        title="Search (Ctrl+K)"
      >
        <Search size={18} />
      </motion.button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
