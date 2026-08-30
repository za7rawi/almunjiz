'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { useCartStore, useCartSubtotal } from '@/store/cart-store';
import { ServiceIcon } from '@/components/ui/service-icon';
import { useDirection } from '@/hooks/use-direction';

export function CartDrawer() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const { isRtl } = useDirection();
  const { open, setOpen, items, setQty, removeItem } = useCartStore();
  const subtotal = useCartSubtotal();
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 bottom-0 z-[75] flex w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl"
            style={isRtl ? { left: 0 } : { right: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'سلة الطلبات' : 'Cart'}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                  <ShoppingCart size={18} className="text-[#2580eb]" />
                  {isAr
                    ? `سلة الطلبات (${count})`
                    : `Cart (${count})`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={isAr ? 'إغلاق' : 'Close'}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ShoppingCart size={32} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'سلتك فارغة' : 'Your cart is empty'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {isAr ? 'أضف خدمات للبدء' : 'Add services to get started'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#2580eb] text-white text-sm font-semibold hover:bg-[#1d6fd0] transition-colors"
                >
                  {isAr ? 'تصفح الخدمات' : 'Browse services'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.serviceId}
                      className="flex gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                    >
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#2580eb] via-[#2580eb] to-[#14b8a6] p-0.5">
                        <div className="w-full h-full rounded-[10px] flex items-center justify-center bg-white dark:bg-slate-900">
                          <ServiceIcon name={item.icon} size={22} className="text-[#2580eb]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                          {isAr ? item.nameAr : item.nameEn}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.price.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => setQty(item.serviceId, item.qty - 1)}
                              aria-label={isAr ? 'إنقاص الكمية' : 'Decrease quantity'}
                              className="p-1.5 text-slate-500 hover:text-[#2580eb] transition-colors"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-800 dark:text-white">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.serviceId, item.qty + 1)}
                              aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
                              className="p-1.5 text-slate-500 hover:text-[#2580eb] transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {(item.price * item.qty).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.serviceId)}
                          aria-label={isAr ? 'حذف من السلة' : 'Remove from cart'}
                          className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {isAr ? 'الإجمالي الفرعي' : 'Subtotal'}
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {subtotal.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? 'يتم التحقق من الأسعار النهائية على الخادم عند إتمام الطلب.'
                      : 'Final prices are verified on the server when you place your order.'}
                  </p>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    {isAr ? 'إتمام الطلب' : 'Checkout'}
                    <Arrow size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
                  >
                    {isAr ? 'متابعة التسوق' : 'Continue shopping'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}