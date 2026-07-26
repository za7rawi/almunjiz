'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  FileText,
  MessageCircle,
  Package,
  Loader2,
  Clock,
  Download,
  ExternalLink,
  FileIcon,
  Image as ImageIcon,
  CreditCard,
  RotateCcw,
  X,
  Eye,
  FolderOpen,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { printInvoice } from '@/lib/print-invoice'

function isImageFile(mt: string): boolean {
  return mt?.startsWith('image/') || false
}

function isPdfFile(mt: string): boolean {
  return mt === 'application/pdf'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'info' | 'danger' | 'secondary' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'info' },
  WAITING_CLIENT: { label: 'بانتظار العميل', variant: 'secondary' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  DELIVERED: { label: 'تم التسليم', variant: 'success' },
  CANCELLED: { label: 'ملغي', variant: 'danger' },
}

const fullTimelineSteps = [
  { status: 'PENDING', label: 'تم استلام الطلب' },
  { status: 'UNDER_REVIEW', label: 'قيد المراجعة' },
  { status: 'WAITING_CLIENT', label: 'بانتظار العميل' },
  { status: 'IN_PROGRESS', label: 'جار التنفيذ' },
  { status: 'COMPLETED', label: 'تم الإنجاز' },
  { status: 'DELIVERED', label: 'تم التسليم' },
]

const statusToStep: Record<string, number> = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  WAITING_CLIENT: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  DELIVERED: 5,
  CANCELLED: -1,
}

const paymentStatusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'info' }> = {
  PAID: { label: 'مدفوع', variant: 'success' },
  PENDING: { label: 'بانتظار الدفع', variant: 'warning' },
  FAILED: { label: 'فشل الدفع', variant: 'danger' },
  PARTIALLY_PAID: { label: 'مدفوع جزئياً', variant: 'info' },
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

const paymentStatusBadgeConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'info' }> = {
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  PENDING: { label: 'بانتظار', variant: 'warning' },
  FAILED: { label: 'فشل', variant: 'danger' },
  REFUNDED: { label: 'مسترجع', variant: 'info' },
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
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
        <p className="text-slate-500 mb-4">الطلب غير موجود</p>
        <Link href="/dashboard/orders">
          <Button variant="secondary" size="sm">
            <ArrowRight size={16} /> العودة للطلبات
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
        title={`الطلب #${order.orderNumber}`}
        subtitle={serviceName}
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'الطلبات', href: '/dashboard/orders' },
          { label: order.orderNumber as string },
        ]}
        actions={
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed]/20 transition-colors"
          >
            <FileText size={16} /> الفاتورة
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900">تسلسل الطلب</h3>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500">التقدم</span>
                  <span className="font-bold text-[#2580eb]">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
                                : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        {i < fullTimelineSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 transition-colors duration-300 ${
                              isDone && i < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`text-sm font-medium ${
                            isDone ? 'text-slate-900' : isCurrent ? 'text-[#2580eb]' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                          {isCurrent && (
                            <Badge variant="primary" size="sm" className="ms-2">
                              الحالية
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
                <h3 className="font-bold text-slate-900">سجل التحديثات</h3>
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
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="mt-0.5">
                          <Clock size={14} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={cfg.variant} size="sm">
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{entry.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(entry.createdAt).toLocaleString('ar-SA', {
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
              <h3 className="font-bold text-slate-900">المرفقات</h3>
            </CardHeader>
            <CardContent>
              {fileAttachments.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">لا توجد ملفات مرفقة</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fileAttachments.map((file) => {
                    const mime = file.mimeType || ''
                    if (isImageFile(mime)) {
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setLightboxUrl(`/api/files/${file.id}?inline=true`)}
                        >
                          <div className="aspect-square bg-slate-100">
                            <img
                              src={`/api/files/${file.id}?inline=true`}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-xs text-slate-700 truncate font-medium">{file.fileName}</p>
                            <p className="text-[10px] text-slate-400">{formatFileSize(file.fileSize)}</p>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                              <Eye size={18} className="text-[#2580eb]" />
                            </div>
                          </div>
                        </motion.div>
                      )
                    }

                    if (isPdfFile(mime)) {
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                              <FileText size={20} className="text-red-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-slate-700 truncate font-medium">{file.fileName}</p>
                              <p className="text-[11px] text-slate-400">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={`/api/files/${file.id}?inline=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-[#2580eb] bg-[#2580eb]/10 rounded-lg hover:bg-[#2580eb]/20 transition-colors"
                            >
                              <ExternalLink size={12} /> عرض
                            </a>
                            <a
                              href={`/api/files/${file.id}`}
                              download={file.fileName}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-[#14b8a6] bg-[#14b8a6]/10 rounded-lg hover:bg-[#14b8a6]/20 transition-colors"
                            >
                              <Download size={12} /> تحميل
                            </a>
                          </div>
                        </motion.div>
                      )
                    }

                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <FileIcon size={20} className="text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-slate-700 truncate font-medium">{file.fileName}</p>
                            <p className="text-[11px] text-slate-400">{formatFileSize(file.fileSize)}</p>
                          </div>
                        </div>
                        <a
                          href={`/api/files/${file.id}`}
                          download={file.fileName}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-[#7c3aed] bg-[#7c3aed]/10 rounded-lg hover:bg-[#7c3aed]/20 transition-colors"
                        >
                          <Download size={12} /> تحميل
                        </a>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900">سجل المدفوعات</h3>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">لا توجد مدفوعات مسجلة</p>
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
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#2580eb]/10 flex items-center justify-center text-lg shrink-0">
                          {paymentMethodIcons[payment.method] || '💰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-slate-900">{Number(payment.amount).toLocaleString()} ر.س</p>
                            <Badge variant={pStatusCfg.variant} size="sm">
                              {pStatusCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{payment.method}</span>
                            {payment.transactionId && (
                              <>
                                <span>·</span>
                                <span className="font-mono">{payment.transactionId}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(payment.createdAt).toLocaleString('ar-SA', {
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
                  <span className="text-slate-500">رقم الطلب</span>
                  <span className="font-medium text-slate-900">{order.orderNumber as string}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">الخدمة</span>
                  <span className="font-medium text-slate-900">{serviceName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">حالة الدفع</span>
                  <Badge variant={paymentStatusCfg.variant} size="sm">
                    {paymentStatusCfg.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900">تفاصيل الفاتورة</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">المبلغ</span>
                  <span className="text-slate-700">{Number(order.amount as number || 0).toLocaleString()} ر.س</span>
                </div>
                {Number(order.discount as number || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">الخصم</span>
                    <span className="text-emerald-600">-{Number(order.discount as number || 0).toLocaleString()} ر.س</span>
                  </div>
                )}
                {Number(order.tax as number || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">الضريبة</span>
                    <span className="text-slate-700">{Number(order.tax as number || 0).toLocaleString()} ر.س</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-900">الإجمالي</span>
                  <span className="font-bold text-slate-900">{Number(order.total as number || 0).toLocaleString()} ر.س</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="secondary" fullWidth iconLeft={<FileText size={16} />} onClick={handlePrintInvoice}>
                  تحميل الفاتورة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="secondary" fullWidth iconLeft={<RotateCcw size={16} />} onClick={handleReorder}>
            إعادة الطلب
          </Button>

          <a
            href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="success" fullWidth iconLeft={<MessageCircle size={18} />}>
              تواصل مع الدعم
            </Button>
          </a>
        </div>
      </div>

      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute -top-3 -end-3 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
              <img
                src={lightboxUrl}
                alt="معاينة"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="flex justify-center mt-3">
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
                >
                  <ExternalLink size={14} /> فتح في تبويب جديد
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
