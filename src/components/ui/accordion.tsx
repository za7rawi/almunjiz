'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ items, multiple = false, defaultOpen = [], className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(multiple ? prev : []);
        if (prev.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [multiple],
  );

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              'rounded-xl border overflow-hidden transition-all duration-200',
              isOpen
                ? 'border-[#2580eb]/20 bg-white dark:bg-white/5'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2580eb]/10',
            )}
          >
            <button
              onClick={() => !item.disabled && toggle(item.id)}
              disabled={item.disabled}
              className={cn(
                'flex items-center justify-between w-full px-5 py-4 text-start cursor-pointer',
                'text-sm font-medium text-slate-900 dark:text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <span>{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400 shrink-0"
              >
                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export { type AccordionProps, type AccordionItem };
