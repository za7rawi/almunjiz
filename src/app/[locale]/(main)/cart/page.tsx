'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, ShieldCheck, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { useCartStore, useCartSubtotal, useCartCount } from '@/store/cart-store';
import { useDirection } from '@/hooks/use-direction';
import { ServiceIcon } from '@/components/ui/service-icon';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const { isRtl } = useDirection();
  const { items, setQty, removeItem, clear } = useCartStore();
  const subtotal = useCartSubtotal();
  const count = useCartCount();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[70vh] bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            {isAr ? `سلة الطلبات (${count})` : `Cart (${count})`}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full" />
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-5 py-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <ShoppingCart size={40} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                {isAr ? 'سلتك فارغة' : 'Your cart is empty'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAr ? 'أضف خدمات للبدء' : 'Add services to get started'}
              </p>
            </div>
            <Link href="/services">
              <Button size="lg">
                {isAr ? 'تصفح الخدمات' : 'Browse services'}
                <Arrow size={16} />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <motion.div
                  key={item.serviceId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                >
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-[#2580eb] via-[#2580eb] to-[#14b8a6] p-0.5">
                    <div className="w-full h-full rounded-[10px] flex items-center justify-center bg-white dark:bg-slate-900">
                      <ServiceIcon name={item.icon} size={24} className="text-[#2580eb]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/services/${item.serviceId}`}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-[#2580eb] transition-colors line-clamp-1"
                    >
                      {isAr ? item.nameAr : item.nameEn}
                    </Link>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.price.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                      </span>
                      {(item.duration || item.durationEn) && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock size={11} />
                          {isAr ? item.duration : item.durationEn}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setQty(item.serviceId, item.qty - 1)}
                        aria-label={isAr ? 'إنقاص الكمية' : 'Decrease quantity'}
                        className="p-2.5 text-slate-500 hover:text-[#2580eb] transition-colors"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-800 dark:text-white">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.serviceId, item.qty + 1)}
                        aria-label={isAr ? 'زيادة الكمية' : 'Increase quantity'}
                        className="p-2.5 text-slate-500 hover:text-[#2580eb] transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {(item.price * item.qty).toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.serviceId)}
                      aria-label={isAr ? 'حذف من السلة' : 'Remove from cart'}
                      className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}

              <button
                type="button"
                onClick={clear}
                className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors mt-2"
              >
                {isAr ? 'تفريغ السلة' : 'Clear cart'}
              </button>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sticky top-24 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 shadow-sm"
              >
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">
                  {isAr ? 'ملخص الطلب' : 'Order Summary'}
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{isAr ? 'الخدمات' : 'Services'}</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {count} {isAr ? 'عنصر' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{isAr ? 'الإجمالي الفرعي' : 'Subtotal'}</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {subtotal.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-5" />

                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-xl font-extrabold text-[#2580eb]">
                    {subtotal.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                <Link href="/checkout" className="block">
                  <Button fullWidth size="lg">
                    {isAr ? 'إتمام الطلب' : 'Checkout'}
                    <Arrow size={16} />
                  </Button>
                </Link>

                <Link href="/services" className="block mt-3">
                  <Button variant="secondary" fullWidth size="md">
                    {isAr ? 'متابعة التسوق' : 'Continue shopping'}
                  </Button>
                </Link>

                <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-4">
                  <ShieldCheck size={13} className="text-[#14b8a6]" />
                  {isAr
                    ? 'يتم التحقق من الأسعار النهائية على الخادم عند إتمام الطلب.'
                    : 'Final prices are verified on the server when you place your order.'}
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}