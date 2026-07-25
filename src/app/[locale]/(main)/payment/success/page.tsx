'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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
  Download,
  Receipt,
  Truck,
  CircleDollarSign,
  ShieldCheck,
} from 'lucide-react';
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
  const paymentId = searchParams.get('paymentId');
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
      const txnId = order?.payments?.[0]?.transactionId || paymentId || orderId;
      fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayId, transactionId: txnId }),
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
  }, [gatewayId, orderId, paymentVerified, orderNumberParam, paymentId]);

  const isAr = language === 'ar';
  const amount = Number(order?.amount ?? 0);
  const tax = Number(order?.tax ?? 0);
  const total = Number(order?.total ?? 0);
  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const paymentStatusMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    PAID: {
      label: isAr ? 'مدفوع' : 'Paid',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    PENDING: {
      label: isAr ? 'قيد الانتظار' : 'Pending',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    UNPAID: {
      label: isAr ? 'غير مدفوع' : 'Unpaid',
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
    FAILED: {
      label: isAr ? 'فشل' : 'Failed',
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
    REFUNDED: {
      label: isAr ? 'مسترجع' : 'Refunded',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dot: 'bg-slate-500',
    },
  };

  const orderStatusMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    PENDING: {
      label: isAr ? 'قيد الانتظار' : 'Pending',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    CONFIRMED: {
      label: isAr ? 'مؤكد' : 'Confirmed',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    PROCESSING: {
      label: isAr ? 'جاري المعالجة' : 'Processing',
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
    },
    COMPLETED: {
      label: isAr ? 'مكتمل' : 'Completed',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    DELIVERED: {
      label: isAr ? 'تم التسليم' : 'Delivered',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    CANCELLED: {
      label: isAr ? 'ملغي' : 'Cancelled',
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
    },
  };

  const payStatus = paymentStatusMap[order?.paymentStatus || ''] || null;
  const ordStatus = orderStatusMap[order?.status || ''] || null;

  const handleDownloadInvoice = async () => {
    const invoiceNumber =
      order?.invoice?.invoiceNumber || `INV-${order?.orderNumber || orderId || 'unknown'}`;
    const orderNum = order?.orderNumber || orderId || '';
    await printInvoice({
      invoiceNumber,
      orderNumber: orderNum,
      customer: order?.customerName || '',
      email: order?.customerEmail || '',
      phone: order?.customerPhone || '',
      service: order?.service?.name || '',
      amount,
      tax,
      total,
      dueDate:
        date ||
        new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      date:
        date ||
        new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      status:
        order?.paymentStatus === 'PAID' || order?.status === 'COMPLETED' ? 'paid' : 'pending',
    });
  };

  const trackOrderNumber = order?.orderNumber || orderNumberParam || orderId;

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16"
        dir={dir}
      >
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-slate-500 text-sm">
            {isAr ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!order && !loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16"
        dir={dir}
      >
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-xl shadow-red-500/20"
          >
            <FileText className="h-10 w-10 text-red-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-2xl font-bold text-slate-900"
          >
            {isAr ? 'لم يتم العثور على الطلب' : 'Order Not Found'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 max-w-md text-center text-slate-500 text-sm"
          >
            {isAr
              ? 'لم نتمكن من العثور على تفاصيل طلبك. يرجى التواصل مع الدعم الفني للمساعدة.'
              : 'We could not find your order details. Please contact support for assistance.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/">
              <Button variant="primary">
                <Home className="h-4 w-4 mr-2" />
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 pt-24 pb-16"
      dir={dir}
    >
      <div className="mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mb-6 relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="h-14 w-14 sm:h-16 sm:w-16 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-2xl sm:text-3xl font-bold text-slate-900"
          >
            {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 max-w-md text-center text-slate-500 text-sm sm:text-base"
          >
            {isAr
              ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً'
              : 'Thank you! Your order has been received and will be processed shortly.'}
          </motion.p>

          {verifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600"
            >
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              {isAr ? 'جارٍ التحقق من الدفع...' : 'Verifying payment...'}
            </motion.div>
          )}

          {!verifying && paymentVerified === true && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-600"
            >
              <ShieldCheck className="h-4 w-4" />
              {isAr ? 'تم التحقق من الدفع بنجاح' : 'Payment verified successfully'}
            </motion.div>
          )}

          {!verifying && paymentVerified === false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-600"
            >
              <Clock className="h-4 w-4" />
              {isAr
                ? 'لم يتم التحقق بعد - يرجى الاتصال بالدعم'
                : 'Verification pending - please contact support'}
            </motion.div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 sm:mb-10 w-full"
            >
              <Card className="overflow-hidden shadow-lg shadow-slate-200/50">
                <div className="border-b border-slate-200 bg-emerald-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    {isAr ? 'تفاصيل الطلب' : 'Order Details'}
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                    <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                      <Hash className="h-4 w-4 shrink-0" />
                      <span>{isAr ? 'رقم الطلب' : 'Order Number'}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 text-sm" dir="ltr">
                      {order.orderNumber || orderId}
                    </span>
                  </div>

                  {order.invoice?.invoiceNumber && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900 text-sm" dir="ltr">
                        {order.invoice.invoiceNumber}
                      </span>
                    </div>
                  )}

                  {order.service?.name && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <Package className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'اسم الخدمة' : 'Service Name'}</span>
                      </div>
                      <span className="font-medium text-slate-900 text-sm text-end max-w-[60%]">
                        {isAr ? order.service.name : order.service.nameEn || order.service.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                    <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                      <CircleDollarSign className="h-4 w-4 shrink-0" />
                      <span>{isAr ? 'المبلغ / الإجمالي' : 'Amount / Total'}</span>
                    </div>
                    <div className="text-end">
                      <span className="font-bold text-emerald-600 text-base">
                        {formatPrice(total || amount, currency)}
                      </span>
                      {total !== amount && amount > 0 && (
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {isAr ? 'المبلغ: ' : 'Amount: '}
                          {formatPrice(amount, currency)}
                          {tax > 0 && (
                            <>
                              {' '}{isAr ? '+الضريبة: ' : '+Tax: '}
                              {formatPrice(tax, currency)}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {order.paymentStatus && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <CreditCard className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'حالة الدفع' : 'Payment Status'}</span>
                      </div>
                      {payStatus ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${payStatus.bg} ${payStatus.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${payStatus.dot}`} />
                          {payStatus.label}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">
                          {order.paymentStatus}
                        </span>
                      )}
                    </div>
                  )}

                  {order.status && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <Truck className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'حالة الطلب' : 'Order Status'}</span>
                      </div>
                      {ordStatus ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ordStatus.bg} ${ordStatus.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${ordStatus.dot}`} />
                          {ordStatus.label}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">{order.status}</span>
                      )}
                    </div>
                  )}

                  {(order.paymentMethod || order.payments?.[0]?.paymentMethod) && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <CreditCard className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'طريقة الدفع' : 'Payment Method'}</span>
                      </div>
                      <span className="font-medium text-slate-900 text-sm" dir="ltr">
                        {order.paymentMethod || order.payments?.[0]?.paymentMethod}
                      </span>
                    </div>
                  )}

                  {(order.transactionId || order.payments?.[0]?.transactionId) && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <Hash className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'رقم المعاملة' : 'Transaction ID'}</span>
                      </div>
                      <span className="font-mono text-slate-700 text-xs bg-slate-50 px-2 py-1 rounded" dir="ltr">
                        {order.transactionId || order.payments?.[0]?.transactionId}
                      </span>
                    </div>
                  )}

                  {date && (
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{isAr ? 'تاريخ الطلب' : 'Order Date'}</span>
                      </div>
                      <span className="text-slate-900 text-sm">{date}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex w-full flex-col gap-3 sm:flex-row"
          >
            <Button variant="secondary" className="flex-1" onClick={handleDownloadInvoice}>
              <Download className={`h-4 w-4 ${isAr ? 'ml-2' : 'mr-2'}`} />
              {isAr ? 'تحميل الفاتورة' : 'Download Invoice'}
            </Button>
            <Link
              href={`/track-order?order=${trackOrderNumber}`}
              className="flex-1"
            >
              <Button variant="primary" className="w-full">
                {isAr ? 'متابعة الطلب' : 'Track Order'}
                <ArrowRight className={`h-4 w-4 ${isAr ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <Home className="h-4 w-4" />
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
