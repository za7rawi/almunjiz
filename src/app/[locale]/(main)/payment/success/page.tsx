'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, ArrowRight, Home, Clock, Package, CreditCard, Calendar, Hash, Download, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { printInvoice } from '@/lib/print-invoice';
import type { ApiOrder } from '@/types/api-order';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const orderNumberParam = searchParams.get('orderNumber');
  const gatewayId = searchParams.get('gatewayId');
  const { language } = useLanguageStore();
  const { dir } = useDirection();
  const { currency } = useCurrencyStore();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const searchQuery = orderNumberParam || orderId;
    if (!searchQuery) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}&limit=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.[0]) setOrder(data.data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId, orderNumberParam]);

  useEffect(() => {
    if (gatewayId && orderId && paymentVerified === null) {
      setVerifying(true);
      const txnId = order?.payments?.[0]?.transactionId || orderId;
      fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId, orderId, transactionId: txnId }),
      })
        .then((r) => r.json())
        .then((data) => {
          setPaymentVerified(data.success && data.status === 'COMPLETED');
          if (data.success) {
            const searchQuery = orderNumberParam || orderId;
            fetch(`/api/orders?search=${encodeURIComponent(searchQuery)}&limit=1`)
              .then((r) => r.json())
              .then((d) => {
                if (d.success && d.data?.[0]) setOrder(d.data[0]);
              })
              .catch(() => {});
          }
        })
        .catch(() => setPaymentVerified(false))
        .finally(() => setVerifying(false));
    }
  }, [gatewayId, orderId, paymentVerified, orderNumberParam]);

  const isAr = language === 'ar';
  const amount = Number(order?.amount ?? 0);
  const tax = Number(order?.tax ?? 0);
  const total = Number(order?.total ?? 0);
  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const handleDownloadInvoice = async () => {
    const invoiceNumber = order?.invoice?.invoiceNumber || `INV-${order?.orderNumber || orderId || 'unknown'}`;
    const orderNum = order?.orderNumber || orderId || '';
    await printInvoice({
      invoiceNumber,
      orderNumber: orderNum,
      customer: order?.customerName || '',
      email: order?.customerEmail || '',
      phone: order?.customerPhone || '',
      service: order?.service?.name || '',
      amount: amount,
      tax: tax,
      total: total,
      dueDate: date || new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      date: date || new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: order?.paymentStatus === 'PAID' || order?.status === 'COMPLETED' ? 'paid' : 'pending',
    });
  };

  const steps = [
    { label: isAr ? 'تم استلام الطلب' : 'Order Received', icon: Package, done: true },
    { label: isAr ? 'جاري المعالجة' : 'Processing', icon: Clock, done: false },
    { label: isAr ? 'جاري التجهيز' : 'Preparing', icon: FileText, done: false },
    { label: isAr ? 'تم التسليم' : 'Delivered', icon: CheckCircle2, done: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16" dir={dir}>
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 text-sm">{isAr ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}</p>
        </div>
      </div>
    );
  }

  if (!order && orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16" dir={dir}>
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-xl shadow-red-500/20">
            <FileText className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-slate-900">{isAr ? 'لم يتم العثور على الطلب' : 'Order Not Found'}</h1>
          <p className="mb-8 max-w-md text-center text-slate-500 text-sm">
            {isAr ? 'لم نتمكن من العثور على تفاصيل طلبك. يرجى التواصل مع الدعم الفني للمساعدة.' : 'We could not find your order details. Please contact support for assistance.'}
          </p>
          <Link href="/">
            <Button variant="primary"><Home className="h-4 w-4 mr-2" />{isAr ? 'العودة للرئيسية' : 'Back to Home'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16" dir={dir}>
      <div className="mx-auto max-w-2xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-emerald-100 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-600" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-3 text-2xl sm:text-3xl font-bold text-slate-900">{isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8 sm:mb-10 max-w-md text-center text-slate-500 text-sm sm:text-base">{isAr ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً' : 'Thank you! Your order has been received and will be processed shortly.'}</motion.p>

          {verifying && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 flex items-center gap-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              {isAr ? 'جار التحقق من الدفع...' : 'Verifying payment...'}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8 sm:mb-10 w-full">
            <Card className="overflow-hidden shadow-lg">
              <div className="border-b border-slate-200 bg-emerald-50 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">{isAr ? 'تفاصيل الطلب' : 'Order Details'}</h2>
              </div>
              <div className="divide-y divide-slate-100 p-4 sm:p-6">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-500 text-sm"><Hash className="h-4 w-4 shrink-0" /><span>{isAr ? 'رقم الطلب' : 'Order ID'}</span></div>
                  <span className="font-mono font-medium text-slate-900 text-sm" dir="ltr">{order?.orderNumber || orderId}</span>
                </div>
                {order?.customerName && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><User className="h-4 w-4 shrink-0" /><span>{isAr ? 'العميل' : 'Customer'}</span></div>
                    <span className="font-medium text-slate-900 text-sm">{order.customerName}</span>
                  </div>
                )}
                {order?.customerEmail && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Mail className="h-4 w-4 shrink-0" /><span>{isAr ? 'البريد' : 'Email'}</span></div>
                    <span className="font-medium text-slate-900 text-sm" dir="ltr">{order.customerEmail}</span>
                  </div>
                )}
                {order?.customerPhone && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Phone className="h-4 w-4 shrink-0" /><span>{isAr ? 'الجوال' : 'Phone'}</span></div>
                    <span className="font-medium text-slate-900 text-sm" dir="ltr">{order.customerPhone}</span>
                  </div>
                )}
                {order?.service?.name && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Package className="h-4 w-4 shrink-0" /><span>{isAr ? 'الخدمة' : 'Service'}</span></div>
                    <span className="font-medium text-slate-900 text-sm">{order.service.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-500 text-sm"><CreditCard className="h-4 w-4 shrink-0" /><span>{isAr ? 'المبلغ' : 'Amount'}</span></div>
                  <span className="font-semibold text-emerald-600">{formatPrice(total || amount, currency)}</span>
                </div>
                {order?.paymentStatus && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{isAr ? 'حالة الدفع' : 'Payment Status'}</span></div>
                    <span className={`text-sm font-medium ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus === 'PAID' ? (isAr ? 'مدفوع' : 'Paid') : order.paymentStatus}</span>
                  </div>
                )}
                {date && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Calendar className="h-4 w-4 shrink-0" /><span>{isAr ? 'التاريخ' : 'Date'}</span></div>
                    <span className="text-slate-900 text-sm">{date}</span>
                  </div>
                )}
                {order?.invoice?.invoiceNumber && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm"><FileText className="h-4 w-4 shrink-0" /><span>{isAr ? 'رقم الفاتورة' : 'Invoice #'}</span></div>
                    <span className="font-mono font-medium text-slate-900 text-sm" dir="ltr">{order.invoice.invoiceNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8 sm:mb-10 w-full">
            <Card className="shadow-lg p-4 sm:p-6">
              <h2 className="mb-4 sm:mb-6 text-base sm:text-lg font-semibold text-slate-900">{isAr ? 'الخطوات التالية' : 'Next Steps'}</h2>
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-3 sm:gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        {i < steps.length - 1 && <div className="h-8 sm:h-10 w-0.5 bg-slate-200" />}
                      </div>
                      <div className="pb-6 sm:pb-8 pt-1.5 sm:pt-2">
                        <span className={`font-medium text-sm sm:text-base ${step.done ? 'text-emerald-600' : 'text-slate-500'}`}>{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex w-full flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={handleDownloadInvoice}>
              <Download className={`h-4 w-4 ${isAr ? 'ml-2' : 'mr-2'}`} />{isAr ? 'تحميل الفاتورة PDF' : 'Download Invoice PDF'}
            </Button>
            <Link href="/track-order" className="flex-1">
              <Button variant="primary" className="w-full">
                {isAr ? 'متابعة الطلب' : 'Track Order'}<ArrowRight className={`h-4 w-4 ${isAr ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
              <Home className="h-4 w-4" />{isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
