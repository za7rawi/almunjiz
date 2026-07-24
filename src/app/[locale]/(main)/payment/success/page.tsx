'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FileText,
  ArrowRight,
  Home,
  Clock,
  Package,
  CreditCard,
  Calendar,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { useOrderStore } from '@/store/order-store';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'N/A';
  const { language } = useLanguageStore();
  const { dir } = useDirection();
  const { currency } = useCurrencyStore();
  const { orders } = useOrderStore();

  const order = orders.find((o) => o.orderNumber === orderId || o.id === orderId);
  const amount = order?.total ?? 0;
  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(
        language === 'ar' ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : new Date().toLocaleDateString(
        language === 'ar' ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      );

  const isAr = language === 'ar';

  const steps = [
    { label: isAr ? 'تم استلام الطلب' : 'Order Received', icon: Package, done: true },
    { label: isAr ? 'جاري المعالجة' : 'Processing', icon: Clock, done: false },
    { label: isAr ? 'جاري التجهيز' : 'Preparing', icon: FileText, done: false },
    { label: isAr ? 'تم التسليم' : 'Delivered', icon: CheckCircle2, done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-2xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="h-14 w-14 text-emerald-600" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-3 text-3xl font-bold text-slate-900">
            {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-10 max-w-md text-center text-slate-500">
            {isAr ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً' : 'Thank you! Your order has been received and will be processed shortly.'}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-10 w-full">
            <Card className="overflow-hidden shadow-lg">
              <div className="border-b border-slate-200 bg-emerald-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">{isAr ? 'تفاصيل الطلب' : 'Order Details'}</h2>
              </div>
              <div className="divide-y divide-slate-100 p-6">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-500"><Hash className="h-4 w-4" /><span>{isAr ? 'رقم الطلب' : 'Order ID'}</span></div>
                  <span className="font-mono font-medium text-slate-900" dir="ltr">{orderId}</span>
                </div>
                {order?.serviceName && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500"><Package className="h-4 w-4" /><span>{isAr ? 'الخدمة' : 'Service'}</span></div>
                    <span className="font-medium text-slate-900">{order.serviceName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-500"><CreditCard className="h-4 w-4" /><span>{isAr ? 'المبلغ' : 'Amount'}</span></div>
                  <span className="font-semibold text-emerald-600">{formatPrice(amount, currency)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /><span>{isAr ? 'التاريخ' : 'Date'}</span></div>
                  <span className="text-slate-900">{date}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-10 w-full">
            <Card className="shadow-lg p-6">
              <h2 className="mb-6 text-lg font-semibold text-slate-900">{isAr ? 'الخطوات التالية' : 'Next Steps'}</h2>
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {i < steps.length - 1 && <div className="h-10 w-0.5 bg-slate-200" />}
                      </div>
                      <div className="pb-8 pt-2">
                        <span className={`font-medium ${step.done ? 'text-emerald-600' : 'text-slate-500'}`}>{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex w-full flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
              <FileText className={`h-4 w-4 ${isAr ? 'ml-2' : 'mr-2'}`} />
              {isAr ? 'تحميل الفاتورة' : 'Download Invoice'}
            </Button>
            <Link href="/track-order" className="flex-1">
              <Button variant="primary" className="w-full">
                {isAr ? 'متابعة الطلب' : 'Track Order'}
                <ArrowRight className={`h-4 w-4 ${isAr ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
              <Home className="h-4 w-4" />
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
