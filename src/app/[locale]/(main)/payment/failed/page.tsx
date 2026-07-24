'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  XCircle,
  RefreshCw,
  ArrowRight,
  Home,
  ShieldAlert,
  CreditCard,
  Wifi,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { useOrderStore } from '@/store/order-store';

const tipsAr = [
  {
    icon: CreditCard,
    text: 'تأكد من صحة بيانات البطاقة المدخلة',
  },
  {
    icon: Wallet,
    text: 'جرّب استخدام بوابة دفع أخرى',
  },
  {
    icon: ShieldAlert,
    text: 'تأكد من توفر رصيد كافٍ في البطاقة',
  },
];

const tipsEn = [
  {
    icon: CreditCard,
    text: 'Verify your card details are correct',
  },
  {
    icon: Wallet,
    text: 'Try using a different payment gateway',
  },
  {
    icon: ShieldAlert,
    text: 'Ensure your card has sufficient balance',
  },
];

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { language } = useLanguageStore();
  const { isRtl } = useDirection();
  const { currency } = useCurrencyStore();
  const { getOrder } = useOrderStore();
  const isAr = language === 'ar';

  const order = orderId ? getOrder(orderId) : undefined;
  const serviceId = order?.serviceId || '';

  const retryHref = serviceId
    ? `/checkout?service=${encodeURIComponent(serviceId)}`
    : '/services';

  const tips = isAr ? tipsAr : tipsEn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center"
            >
              <XCircle size={56} className="text-red-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-200 flex items-center justify-center border-2 border-white shadow-lg"
            >
              <Wifi size={18} className="text-red-600" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            {isAr ? 'فشل الدفع' : 'Payment Failed'}
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-md mx-auto">
            {isAr
              ? 'حدث خطأ أثناء معالجة الدفع. لم يتم خصم أي مبلغ.'
              : 'An error occurred during payment processing. No amount was charged.'}
          </p>
        </motion.div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 text-sm">
                    {isAr ? 'رقم الطلب' : 'Order ID'}
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    #{order.orderNumber}
                  </span>
                </div>
                {order.serviceName && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 text-sm">
                      {isAr ? 'الخدمة' : 'Service'}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {order.serviceName}
                    </span>
                  </div>
                )}
                {order.total != null && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-red-500 text-sm font-medium">
                      {isAr ? 'المبلغ' : 'Amount'}
                    </span>
                    <span className="font-semibold text-red-600 line-through">
                      {formatPrice(order.total, currency)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {isAr ? 'نصائح' : 'Tips'}
            </h2>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <tip.icon size={16} className="text-amber-600" />
                  </div>
                  <span className="text-slate-700 text-sm">{tip.text}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href={retryHref} className="flex-1">
            <Button size="lg" className="w-full">
              <RefreshCw size={18} className={isRtl ? 'ms-2' : 'me-2'} />
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">
              <Home size={18} className={isRtl ? 'ms-2' : 'me-2'} />
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-center mt-8 text-sm text-slate-400"
        >
          {isAr ? 'هل تحتاج مساعدة؟' : 'Need help?'}{' '}
          <Link
            href="/contact"
            className="text-[#2580eb] hover:underline font-medium"
          >
            {isAr ? 'تواصل مع الدعم' : 'Contact Support'}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
