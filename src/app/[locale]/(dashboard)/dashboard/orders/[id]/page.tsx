'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, FileText, MessageCircle, Download, Package, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'info' | 'danger' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'info' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  DELIVERED: { label: 'تم التسليم', variant: 'success' },
  CANCELLED: { label: 'ملغي', variant: 'danger' },
}

const fullTimelineSteps = [
  { status: 'RECEIVED', label: 'تم استلام الطلب' },
  { status: 'REVIEW', label: 'قيد المراجعة' },
  { status: 'WAITING_CLIENT', label: 'بانتظار العميل' },
  { status: 'IN_PROGRESS', label: 'جار التنفيذ' },
  { status: 'COMPLETED', label: 'تم الإنجاز' },
  { status: 'DELIVERED', label: 'تم التسليم' },
]

const statusToStep: Record<string, number> = {
  PENDING: 0, UNDER_REVIEW: 1, WAITING_CLIENT: 2, IN_PROGRESS: 3, COMPLETED: 4, DELIVERED: 5, CANCELLED: -1,
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) setOrder(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#2580eb]" size={32} /></div>

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 mb-4">الطلب غير موجود</p>
        <Link href="/dashboard/orders"><Button variant="secondary" size="sm"><ArrowRight size={16} /> العودة للطلبات</Button></Link>
      </div>
    )
  }

  const orderStatus = (order.status as string) || 'PENDING'
  const currentStep = statusToStep[orderStatus] ?? -1
  const progressPercent = currentStep >= 0 ? Math.round((currentStep / (fullTimelineSteps.length - 1)) * 100) : 0
  const statusCfg = statusConfig[orderStatus] || { label: orderStatus, variant: 'primary' as const }
  const serviceName = (order.service as { name: string } | undefined)?.name || '-'
  const timeline = (order.timeline as { status: string; description: string; createdAt: string }[] | undefined) || []

  return (
    <div className="space-y-6">
      <PageHeader title={`الطلب #${order.orderNumber}`} subtitle={serviceName} breadcrumbs={[{ label: 'الرئيسية', href: '/dashboard' }, { label: 'الطلبات', href: '/dashboard/orders' }, { label: order.orderNumber as string }]} actions={<Link href="/dashboard/invoices" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] text-sm font-medium hover:bg-[#7c3aed]/20 transition-colors"><FileText size={16} /> الفاتورة</Link>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h3 className="font-bold text-slate-900">تسلسل الطلب</h3></CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2"><span className="text-slate-500">التقدم</span><span className="font-bold text-[#2580eb]">{progressPercent}%</span></div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full" /></div>
              </div>
              <div className="space-y-0">
                {fullTimelineSteps.map((step, i) => {
                  const isDone = i <= currentStep
                  const isCurrent = i === currentStep
                  return (
                    <motion.div key={step.status} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isDone ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20' : isCurrent ? 'bg-[#2580eb]/10 text-[#2580eb] border-2 border-[#2580eb]/30' : 'bg-slate-100 text-slate-400'}`}>
                          {isDone ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        {i < fullTimelineSteps.length - 1 && <div className={`w-0.5 h-8 transition-colors duration-300 ${i < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                      </div>
                      <div className="pb-6">
                        <p className={`text-sm font-medium ${isDone ? 'text-slate-900' : isCurrent ? 'text-[#2580eb]' : 'text-slate-400'}`}>{step.label}{isCurrent && !isDone && <Badge variant="primary" size="sm" className="ms-2">الحالية</Badge>}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="text-center mb-4"><Badge variant={statusCfg.variant} dot size="md">{statusConfig[orderStatus]?.label || orderStatus}</Badge></div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-slate-500">رقم الطلب</span><span className="font-medium text-slate-900">{order.orderNumber as string}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">الخدمة</span><span className="font-medium text-slate-900">{serviceName}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card><CardHeader><h3 className="font-bold text-slate-900">تفاصيل الفاتورة</h3></CardHeader><CardContent><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-slate-500">المبلغ</span><span className="text-slate-700">{order.amount as number} ر.س</span></div><div className="flex justify-between text-sm"><span className="text-slate-500">الضريبة (15%)</span><span className="text-slate-700">{order.tax as number} ر.س</span></div><div className="h-px bg-slate-200 my-2" /><div className="flex justify-between text-sm"><span className="font-bold text-slate-900">الإجمالي</span><span className="font-bold text-slate-900">{order.total as number} ر.س</span></div></div></CardContent></Card>
          <a href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز" target="_blank" rel="noopener noreferrer"><Button variant="success" fullWidth iconLeft={<MessageCircle size={18} />}>تواصل مع الدعم</Button></a>
        </div>
      </div>
    </div>
  )
}
