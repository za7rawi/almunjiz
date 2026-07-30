'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  FileText,
  MessageCircle,
  Package,
  Loader2,
  Clock,
  CreditCard,
  RotateCcw,
  FolderOpen,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { printInvoice } from '@/lib/print-invoice'
import { useLanguageStore } from '@/store/language-store'
import { FileAttachmentCard } from '@/components/ui/file-attachment-card'

function getStatusConfig(isAr: boolean): Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'info' | 'danger' | 'secondary' }> {
  return {
    PENDING: { label: isAr ? 'قيد الانتظار' : 'Pending', variant: 'warning' as const },
    UNDER_REVIEW: { label: isAr ? 'قيد المراجعة' : 'Under Review', variant: 'info' as const },
    WAITING_CLIENT: { label: isAr ? 'بانتظار العميل' : 'Waiting for Client', variant: 'secondary' as const },
    IN_PROGRESS: { label: isAr ? 'جار التنفيذ' : 'In Progress', variant: 'primary' as const },
    COMPLETED: { label: isAr ? 'مكتمل' : 'Completed', variant: 'success' as const },
    DELIVERED: { label: isAr ? 'تم التسليم' : 'Delivered', variant: 'success' as const },
    CANCELLED: { label: isAr ? 'ملغي' : 'Cancelled', variant: 'danger' as const },
  }
}

function getFullTimelineSteps(isAr: boolean) {
  return [
    { status: 'PENDING', label: isAr ? 'تم استلام الطلب' : 'Order Received' },
    { status: 'UNDER_REVIEW', label: isAr ? 'قيد المراجعة' : 'Under Review' },
    { status: 'WAITING_CLIENT', label: isAr ? 'بانتظار العميل' : 'Waiting for Client' },
    { status: 'IN_PROGRESS', label: isAr ? 'جار التنفيذ' : 'In Progress' },
    { status: 'COMPLETED', label: isAr ? 'تم الإنجاز' : 'Completed' },
    { status: 'DELIVERED', label: isAr ? 'تم التسليم' : 'Delivered' },
  ]
}

const statusToStep: Record<string, number> = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  WAITING_CLIENT: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  DELIVERED: 5,
  CANCELLED: -1,
}

function getPaymentStatusConfig(isAr: boolean): Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'danger' | 'info' }> {
  return {
    PAID: { label: isAr ? 'مدفوع' : 'Paid', variant: 'success' as const },
    PENDING: { label: isAr ? 'بانتظار الدفع' : 'Pending Payment', variant: 'warning' as const },
    FAILED: { label: isAr ? 'فشل الدفع' : 'Payment Failed', variant: 'danger' as const },
    PARTIALLY_PAID: { label: isAr ? 'مدفوع جزئياً' : 'Partially Paid', variant: 'info' as const },
  }
}

const paymentMethodIcons: Record<string, string> = {
  CASH: '💵',
  CREDIT_CARD: '💳',
  BANK_TRANSFER: '🏦',
  WALLET: '👛',
  ONLINE: '🌐',
  STC_PAY: '📱',
  MADA: '💳',
}

function getPaymentStatusBadgeConfig(isAr: boolean): Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'danger' | 'info' }> {
  return {
    COMPLETED: { label: isAr ? 'مكتمل' : 'Completed', variant: 'success' as const },
    PENDING: { label: isAr ? 'بانتظار' : 'Pending', variant: 'warning' as const },
    FAILED: { label: isAr ? 'فشل' : 'Failed', variant: 'danger' as const },
    REFUNDED: { label: isAr ? 'مسترجع' : 'Refunded', variant: 'info' as const },
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  const statusConfig = getStatusConfig(isAr)
  const fullTimelineSteps = getFullTimelineSteps(isAr)
  const paymentStatusConfig = getPaymentStatusConfig(isAr)
  const paymentStatusBadgeConfig = getPaymentStatusBadgeConfig(isAr)

  useEffect(() => {
    fetch(`/api/orders/${id}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('API error')
        return r.json()
      })
      .then((data) => {
        if (data.success && data.data) setOrder(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#2580eb]" size={32} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 mb-4">{isAr ? 'الطلب غير موجود' : 'Order not found'}</p>
        <Link href="/dashboard/orders">
          <Button variant="secondary" size="sm">
            <ArrowRight size={16} /> {isAr ? 'العودة للطلبات' : 'Back to Orders'}
          </Button>
        </Link>
      </div>
    )
  }

  const orderStatus = (order.status as string) || 'PENDING'
  const currentStep = statusToStep[orderStatus] ?? -1
  const progressPercent = currentStep >= 0 ? Math.round((currentStep / (fullTimelineSteps.length - 1)) * 100) : 0
  const statusCfg = statusConfig[orderStatus] || { label: orderStatus, variant: 'primary' as const }
  const serviceName = (order.service as { name: string } | undefined)?.name || '-'
  const timeline = (order.timeline as { id?: string; status: string; description: string; createdAt: string }[] | undefined) || []
  const fileAttachments = (order.fileAttachments as { id: string; fileName: string; fileUrl: string; fileType: string; mimeType?: string; fileSize: number; uploadedAt: string }[]) || []
  const unresolvedAttachments = (order.unresolvedAttachments as string[] | undefined) || []
  const attachmentCount = fileAttachments.length + unresolvedAttachments.length
  const payments = (order.payments as { id: string; method: string; status: string; amount: number; transactionId?: string; createdAt: string }[]) || []
  const orderPaymentStatus = (order.paymentStatus as string) || 'PENDING'

  const handlePrintInvoice = () => {
    printInvoice(order as unknown as Parameters<typeof printInvoice>[0])
  }

  const handleReorder = () => {
    const serviceId = (order.service as { id: string } | undefined)?.id || order.serviceId
    if (serviceId) {
      router.push(`/services?reorder=${serviceId}`)
    } else {
      router.push('/services')
    }
  }

  const paymentStatusCfg = paymentStatusConfig[orderPaymentStatus] || {
    label: orderPaymentStatus,
    variant: 'info' as const,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${isAr ? 'الطلب #' : 'Order #'}${order.orderNumber}`}
        subtitle={serviceName}
        breadcrumbs={[
          { label: isAr ? 'الرئيسية' : 'Home', href: '/dashboard' },
          { label: isAr ? 'الطلبات' : 'Orders', href: '/dashboard/orders' },
          { label: order.orderNumber as string },
        ]}
        actions={
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed]/20 transition-colors"
          >
            <FileText size={16} /> {isAr ? 'الفاتورة' : 'Invoice'}
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'تسلسل الطلب' : 'Order Timeline'}</h3>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'التقدم' : 'Progress'}</span>
                  <span className="font-bold text-[#2580eb]">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full"
                  />
                </div>
              </div>
              <div className="space-y-0">
                {fullTimelineSteps.map((step, i) => {
                  const isDone = currentStep >= 0 && i <= currentStep
                  const isCurrent = i === currentStep
                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isDone
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20'
                              : isCurrent
                                ? 'bg-[#2580eb]/10 text-[#2580eb] border-2 border-[#2580eb]/30'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        {i < fullTimelineSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 transition-colors duration-300 ${
                              isDone && i < currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`text-sm font-medium ${
                            isDone ? 'text-slate-900 dark:text-white' : isCurrent ? 'text-[#2580eb]' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {step.label}
                          {isCurrent && (
                            <Badge variant="primary" size="sm" className="ms-2">
                              {isAr ? 'الحالية' : 'Current'}
                            </Badge>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {timeline.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'سجل التحديثات' : 'Update History'}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeline.map((entry, i) => {
                    const cfg = statusConfig[entry.status] || { label: entry.status, variant: 'primary' as const }
                    return (
                      <motion.div
                        key={entry.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="mt-0.5">
                          <Clock size={14} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={cfg.variant} size="sm">
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{entry.description}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(entry.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'المرفقات' : 'Attachments'}</h3>
            </CardHeader>
            <CardContent>
              {attachmentCount === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد ملفات مرفقة' : 'No attachments'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fileAttachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {fileAttachments.map((file) => (
                        <FileAttachmentCard key={file.id} file={file} isAr={isAr} />
                      ))}
                    </div>
                  )}
                  {unresolvedAttachments.length > 0 && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                        {isAr ? 'أسماء ملفات قديمة غير قابلة للاسترجاع' : 'Legacy file names without recoverable file data'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {unresolvedAttachments.map((file, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-white/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                            <FolderOpen size={10} /> {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'سجل المدفوعات' : 'Payment History'}</h3>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد مدفوعات مسجلة' : 'No payments recorded'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => {
                    const pStatusCfg = paymentStatusBadgeConfig[payment.status] || {
                      label: payment.status,
                      variant: 'info' as const,
                    }
                    return (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#2580eb]/10 flex items-center justify-center text-lg shrink-0">
                          {paymentMethodIcons[payment.method] || '💰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{Number(payment.amount).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</p>
                            <Badge variant={pStatusCfg.variant} size="sm">
                              {pStatusCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                            <span>{payment.method}</span>
                            {payment.transactionId && (
                              <>
                                <span>·</span>
                                <span className="font-mono">{payment.transactionId}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {new Date(payment.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="text-center mb-4">
                <Badge variant={statusCfg.variant} dot size="md">
                  {statusConfig[orderStatus]?.label || orderStatus}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'رقم الطلب' : 'Order ID'}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{order.orderNumber as string}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'الخدمة' : 'Service'}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{serviceName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'حالة الدفع' : 'Payment Status'}</span>
                  <Badge variant={paymentStatusCfg.variant} size="sm">
                    {paymentStatusCfg.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'تفاصيل الفاتورة' : 'Invoice Details'}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'المبلغ' : 'Amount'}</span>
                  <span className="text-slate-700 dark:text-slate-300">{Number(order.amount as number || 0).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
                {Number(order.discount as number || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{isAr ? 'الخصم' : 'Discount'}</span>
                    <span className="text-emerald-600">-{Number(order.discount as number || 0).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                )}
                {Number(order.tax as number || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{isAr ? 'الضريبة' : 'Tax'}</span>
                    <span className="text-slate-700 dark:text-slate-300">{Number(order.tax as number || 0).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{Number(order.total as number || 0).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="secondary" fullWidth iconLeft={<FileText size={16} />} onClick={handlePrintInvoice}>
                  {isAr ? 'تحميل الفاتورة' : 'Download Invoice'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="secondary" fullWidth iconLeft={<RotateCcw size={16} />} onClick={handleReorder}>
            {isAr ? 'إعادة الطلب' : 'Reorder'}
          </Button>

          <a
            href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="success" fullWidth iconLeft={<MessageCircle size={18} />}>
              {isAr ? 'تواصل مع الدعم' : 'Contact Support'}
            </Button>
          </a>
        </div>
      </div>


    </div>
  )
}
