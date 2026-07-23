'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  suggestions = [],
  onSelectSuggestion,
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(query), debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [query, onSearch, debounceMs]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    onSelectSuggestion?.(suggestion);
  };

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <div className="relative flex items-center">
        <Search className="absolute start-3 text-slate-400 pointer-events-none" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full ps-10 pe-10 py-2.5 text-sm rounded-xl transition-all duration-200',
            'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
            'text-slate-900 dark:text-white placeholder:text-slate-400',
            'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('');
              setShowSuggestions(false);
            }}
            className="absolute end-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-1 py-1 rounded-xl overflow-hidden',
              'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10',
              'shadow-xl max-h-60 overflow-y-auto',
            )}
          >
            {suggestions.map((suggestion, i) => (
              <li key={suggestion}>
                <button
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  className={cn(
                    'w-full text-start px-4 py-2.5 text-sm cursor-pointer transition-colors',
                    i === highlightedIndex
                      ? 'bg-[#2580eb]/10 text-[#2580eb]'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5',
                  )}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export { type SearchInputProps };
