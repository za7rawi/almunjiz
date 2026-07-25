'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Clock,
  CheckCircle2,
  RotateCcw,
  Download,
  Filter,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'

interface Payment {
  id: string
  createdAt: string
  amount: number
  method: string
  status: string
  transactionId?: string
  order?: { orderNumber: string; service?: { name: string } }
}

const methodConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'info' }> = {
  MADA: { label: 'مدى', variant: 'success' },
  VISA: { label: 'فيزا', variant: 'primary' },
  MASTER_CARD: { label: 'ماستركارد', variant: 'primary' },
  APPLE_PAY: { label: 'آبل باي', variant: 'info' },
  GOOGLE_PAY: { label: 'جوجل باي', variant: 'info' },
  BANK_TRANSFER: { label: 'تحويل بنكي', variant: 'warning' },
  STC_PAY: { label: 'STC Pay', variant: 'success' },
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  PENDING: { label: 'قيد المراجعة', variant: 'warning' },
  PROCESSING: { label: 'قيد المعالجة', variant: 'warning' },
  FAILED: { label: 'فشل', variant: 'danger' },
  REFUNDED: { label: 'مسترد', variant: 'danger' },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/payments?limit=200')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) setPayments(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = payments.filter((p) => statusFilter === 'all' || p.status === statusFilter)
  const totalPaid = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount || 0), 0)
  const totalPending = payments.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((s, p) => s + Number(p.amount || 0), 0)
  const totalRefunded = payments.filter((p) => p.status === 'REFUNDED').reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="المدفوعات"
        subtitle={`${payments.length} معاملة`}
        breadcrumbs={[{ label: 'لوحة التحكم', href: '/dashboard' }, { label: 'المدفوعات' }]}
        gradient
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CreditCard size={20} />} value={totalPaid} prefix="ر.س " label="المكتملة" />
        <StatCard icon={<Clock size={20} />} value={totalPending} prefix="ر.س " label="قيد الانتظار" />
        <StatCard icon={<RotateCcw size={20} />} value={totalRefunded} prefix="ر.س " label="المستردة" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'COMPLETED', label: 'مكتمل' },
          { id: 'PENDING', label: 'قيد المراجعة' },
          { id: 'REFUNDED', label: 'مسترد' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === tab.id ? 'bg-[#2580eb] text-white shadow-md shadow-[#2580eb]/25' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2580eb]/30'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#2580eb]" size={32} /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">رقم العملية</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">التاريخ</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">رقم الطلب</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">المبلغ</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">الطريقة</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((payment, i) => (
                    <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-slate-400" />
                          <div>
                            <span className="text-sm font-medium text-slate-900">{payment.transactionId || payment.id.slice(0, 8)}</span>
                            {payment.order?.orderNumber && <p className="text-xs text-slate-400 font-mono">{payment.order.orderNumber}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">{new Date(payment.createdAt).toLocaleDateString('ar-SA')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{payment.order?.orderNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{Number(payment.amount).toLocaleString()} ر.س</td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Badge variant={methodConfig[payment.method]?.variant || 'primary'} size="sm">{methodConfig[payment.method]?.label || payment.method}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[payment.status]?.variant || 'success'} size="sm" dot>{statusConfig[payment.status]?.label || payment.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <CreditCard size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">{statusFilter === 'all' ? 'لا توجد مدفوعات بعد' : 'لا توجد معاملات تطابق الفلتر'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
