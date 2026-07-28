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
  Receipt,
  Truck,
  CircleDollarSign,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Percent,
  LayoutDashboard,
  Download,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        body: JSON.stringify({ gatewayId, transactionId: txnId, orderId }),
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
  const discount = Number(order?.discount ?? 0);
  const date = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const payStatus = order?.paymentStatus || null;
  const ordStatus = order?.status || null;

  const paymentStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
    PAID: 'success',
    PENDING: 'warning',
    UNPAID: 'danger',
    FAILED: 'danger',
    REFUNDED: 'secondary',
  };

  const orderStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary'> = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    UNDER_REVIEW: 'info',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };

  const paymentStatusLabels: Record<string, string> = {
    PAID: isAr ? 'مدفوع' : 'Paid',
    PENDING: isAr ? 'قيد الانتظار' : 'Pending',
    UNPAID: isAr ? 'غير مدفوع' : 'Unpaid',
    FAILED: isAr ? 'فشل' : 'Failed',
    REFUNDED: isAr ? 'مسترجع' : 'Refunded',
  };

  const orderStatusLabels: Record<string, string> = {
    PENDING: isAr ? 'قيد الانتظار' : 'Pending',
    UNDER_REVIEW: isAr ? 'قيد المراجعة' : 'Under Review',
    WAITING_CLIENT: isAr ? 'بانتظار العميل' : 'Waiting for Client',
    IN_PROGRESS: isAr ? 'جار التنفيذ' : 'In Progress',
    COMPLETED: isAr ? 'مكتمل' : 'Completed',
    DELIVERED: isAr ? 'تم التسليم' : 'Delivered',
    CANCELLED: isAr ? 'ملغي' : 'Cancelled',
  };

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
      discount,
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

  const trackOrderNumber = order?.orderNumber || orderNumberParam || '';

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-24 pb-16"
        dir={dir}
      >
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2580eb]/20 border-t-[#2580eb] rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#14b8a6] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="mt-6 text-slate-500 text-sm font-medium">
            {isAr ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!order && !loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-24 pb-16"
        dir={dir}
      >
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 shadow-xl shadow-red-500/10"
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
            className="mb-8 max-w-md text-center text-slate-500 text-sm leading-relaxed"
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
              <Button variant="primary" iconLeft={<Home className="h-4 w-4" />}>
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
      className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 pt-24 pb-16"
      dir={dir}
    >
      <div className="mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mb-8 relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
            <div className="absolute inset-1 rounded-full bg-emerald-100 animate-pulse opacity-40" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/30">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
              >
                <CheckCircle2 className="h-16 w-16 sm:h-18 sm:w-18 text-white" strokeWidth={2} />
              </motion.div>
            </div>
            {/* Sparkle decorations */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="h-6 w-6 text-amber-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-1 -left-3"
            >
              <Sparkles className="h-4 w-4 text-[#14b8a6]" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 text-2xl sm:text-3xl font-bold text-slate-900 text-center"
          >
            {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 max-w-md text-center text-slate-500 text-sm sm:text-base leading-relaxed"
          >
            {isAr
              ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً'
              : 'Thank you! Your order has been received and will be processed shortly.'}
          </motion.p>

          {/* Verification Status */}
          {verifying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 px-5 py-3 text-sm text-blue-600 dark:text-blue-400 shadow-sm"
            >
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">{isAr ? 'جارٍ التحقق من الدفع...' : 'Verifying payment...'}</span>
            </motion.div>
          )}

          {!verifying && paymentVerified === true && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30 px-5 py-3 text-sm text-emerald-600 dark:text-emerald-400 shadow-sm"
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">{isAr ? 'تم التحقق من الدفع بنجاح' : 'Payment verified successfully'}</span>
            </motion.div>
          )}

          {!verifying && paymentVerified === false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800/30 px-5 py-3 text-sm text-amber-600 dark:text-amber-400 shadow-sm"
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">{isAr ? 'لم يتم التحقق بعد - يرجى الاتصال بالدعم' : 'Verification pending - please contact support'}</span>
            </motion.div>
          )}

          {/* Order Details Card */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 sm:mb-10 w-full"
            >
              <Card glass className="overflow-hidden">
                {/* Card Header */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2580eb]/5 via-[#14b8a6]/5 to-[#7c3aed]/5" />
                  <div className="relative px-5 sm:px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-white/5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] text-white">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {isAr ? 'تفاصيل الطلب' : 'Order Details'}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Order Number & Status */}
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{isAr ? 'رقم الطلب' : 'Order Number'}</p>
                      <p className="font-mono font-bold text-lg text-slate-900 dark:text-white" dir="ltr">
                        {order.orderNumber || orderId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ordStatus && (
                        <Badge variant={orderStatusVariant[ordStatus] || 'info'} size="md" dot>
                          {orderStatusLabels[ordStatus] || ordStatus}
                        </Badge>
                      )}
                      {payStatus && (
                        <Badge variant={paymentStatusVariant[payStatus] || 'secondary'} size="md" dot>
                          {paymentStatusLabels[payStatus] || payStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="px-5 sm:px-6 divide-y divide-slate-50 dark:divide-white/5">
                  {order.invoice?.invoiceNumber && (
                    <DetailRow
                      icon={<FileText className="h-4 w-4" />}
                      iconColor="text-[#7c3aed]"
                      label={isAr ? 'رقم الفاتورة' : 'Invoice Number'}
                      value={order.invoice.invoiceNumber}
                      mono
                    />
                  )}

                  {order.customerName && (
                    <DetailRow
                      icon={<User className="h-4 w-4" />}
                      iconColor="text-[#2580eb]"
                      label={isAr ? 'اسم العميل' : 'Customer Name'}
                      value={order.customerName}
                    />
                  )}

                  {order.customerPhone && (
                    <DetailRow
                      icon={<Phone className="h-4 w-4" />}
                      iconColor="text-emerald-500"
                      label={isAr ? 'رقم الهاتف' : 'Phone'}
                      value={order.customerPhone}
                      ltr
                    />
                  )}

                  {order.customerEmail && (
                    <DetailRow
                      icon={<Mail className="h-4 w-4" />}
                      iconColor="text-amber-500"
                      label={isAr ? 'البريد الإلكتروني' : 'Email'}
                      value={order.customerEmail}
                      ltr
                    />
                  )}

                  {order.service?.name && (
                    <DetailRow
                      icon={<Package className="h-4 w-4" />}
                      iconColor="text-[#14b8a6]"
                      label={isAr ? 'اسم الخدمة' : 'Service Name'}
                      value={isAr ? order.service.name : order.service.nameEn || order.service.name}
                      endAlign
                    />
                  )}

                  {/* Price Breakdown */}
                  <div className="py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 text-[#2580eb] shrink-0 mt-0.5">
                        <CircleDollarSign className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{isAr ? 'تفاصيل المبلغ' : 'Price Breakdown'}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{isAr ? 'المبلغ الأساسي' : 'Subtotal'}</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{formatPrice(amount, currency)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-600">{isAr ? 'الخصم' : 'Discount'}</span>
                              <span className="text-emerald-600 font-medium">-{formatPrice(discount, currency)}</span>
                            </div>
                          )}
                          {tax > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500 dark:text-slate-400">{isAr ? 'الضريبة' : 'Tax'}</span>
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{formatPrice(tax, currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-base pt-1.5 border-t border-slate-100 dark:border-white/5">
                            <span className="font-bold text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                            <span className="font-bold text-[#2580eb]">{formatPrice(total || amount, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(order.paymentMethod || order.payments?.[0]?.paymentMethod) && (
                    <DetailRow
                      icon={<CreditCard className="h-4 w-4" />}
                      iconColor="text-[#7c3aed]"
                      label={isAr ? 'طريقة الدفع' : 'Payment Method'}
                      value={order.paymentMethod || order.payments?.[0]?.paymentMethod || ''}
                      ltr
                    />
                  )}

                  {date && (
                    <DetailRow
                      icon={<Calendar className="h-4 w-4" />}
                      iconColor="text-slate-400"
                      label={isAr ? 'تاريخ الطلب' : 'Order Date'}
                      value={date}
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex w-full flex-col gap-3"
          >
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleDownloadInvoice}
                iconLeft={<FileText className="h-4 w-4" />}
              >
                {isAr ? 'عرض الفاتورة' : 'View Invoice'}
              </Button>
              {trackOrderNumber && (
                <Link href={`/track-order?order=${trackOrderNumber}`} className="flex-1">
                  <Button variant="primary" className="w-full" iconRight={<ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />}>
                    {isAr ? 'متابعة الطلب' : 'Track Order'}
                  </Button>
                </Link>
              )}
            </div>
            <Link href="/dashboard" className="w-full">
              <Button variant="ghost" className="w-full" iconLeft={<LayoutDashboard className="h-4 w-4" />}>
                {isAr ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
            </Link>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-700"
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

function DetailRow({
  icon,
  iconColor,
  label,
  value,
  mono = false,
  ltr = false,
  endAlign = false,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  mono?: boolean;
  ltr?: boolean;
  endAlign?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 ${iconColor} shrink-0`}>
          {icon}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span
        className={`text-sm font-medium text-slate-900 dark:text-white ${mono ? 'font-mono' : ''} ${ltr ? 'dir-ltr' : ''} ${endAlign ? 'text-end max-w-[60%]' : ''}`}
        dir={ltr ? 'ltr' : undefined}
      >
        {value}
      </span>
    </div>
  );
}
