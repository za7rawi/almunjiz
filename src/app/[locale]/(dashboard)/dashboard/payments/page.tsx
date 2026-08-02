'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { SkeletonTableRows } from '@/components/ui/skeleton'
import { useLanguageStore } from '@/store/language-store'

interface Payment {
  id: string
  createdAt: string
  amount: number
  method: string
  status: string
  transactionId?: string
  order?: { orderNumber: string; service?: { name: string } }
}

const methodConfig: Record<string, { ar: string; en: string; variant: 'primary' | 'success' | 'warning' | 'info' }> = {
  MADA: { ar: 'مدى', en: 'MADA', variant: 'success' },
  VISA: { ar: 'فيزا', en: 'Visa', variant: 'primary' },
  MASTER_CARD: { ar: 'ماستركارد', en: 'Mastercard', variant: 'primary' },
  APPLE_PAY: { ar: 'آبل باي', en: 'Apple Pay', variant: 'info' },
  GOOGLE_PAY: { ar: 'جوجل باي', en: 'Google Pay', variant: 'info' },
  BANK_TRANSFER: { ar: 'تحويل بنكي', en: 'Bank Transfer', variant: 'warning' },
  STC_PAY: { ar: 'STC Pay', en: 'STC Pay', variant: 'success' },
}

const statusConfig: Record<string, { ar: string; en: string; variant: 'success' | 'warning' | 'danger' }> = {
  COMPLETED: { ar: 'مكتمل', en: 'Completed', variant: 'success' },
  PENDING: { ar: 'قيد المراجعة', en: 'Under Review', variant: 'warning' },
  PROCESSING: { ar: 'قيد المعالجة', en: 'Processing', variant: 'warning' },
  FAILED: { ar: 'فشل', en: 'Failed', variant: 'danger' },
  REFUNDED: { ar: 'مسترد', en: 'Refunded', variant: 'danger' },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  useEffect(() => {
    fetch('/api/payments?limit=200', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) setPayments(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = payments.filter((p) => statusFilter === 'all' || p.status === statusFilter)
  const totalPaid = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount || 0), 0)
  const totalPending = payments.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((s, p) => s + Number(p.amount || 0), 0)
  const totalRefunded = payments.filter((p) => p.status === 'REFUNDED').reduce((s, p) => s + Number(p.amount || 0), 0)

  const filterTabs = [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'COMPLETED', ar: 'مكتمل', en: 'Completed' },
    { id: 'PENDING', ar: 'قيد المراجعة', en: 'Under Review' },
    { id: 'REFUNDED', ar: 'مسترد', en: 'Refunded' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'المدفوعات' : 'Payments'}
        subtitle={`${payments.length} ${isAr ? 'معاملة' : 'transactions'}`}
        breadcrumbs={[{ label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/dashboard' }, { label: isAr ? 'المدفوعات' : 'Payments' }]}
        gradient
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CreditCard size={20} />} value={totalPaid} prefix={isAr ? 'ر.س ' : 'SAR '} label={isAr ? 'المكتملة' : 'Completed'} />
        <StatCard icon={<Clock size={20} />} value={totalPending} prefix={isAr ? 'ر.س ' : 'SAR '} label={isAr ? 'قيد الانتظار' : 'Pending'} />
        <StatCard icon={<RotateCcw size={20} />} value={totalRefunded} prefix={isAr ? 'ر.س ' : 'SAR '} label={isAr ? 'المستردة' : 'Refunded'} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === tab.id ? 'bg-[#2580eb] text-white shadow-md shadow-[#2580eb]/25' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#2580eb]/30'}`}>
            {isAr ? tab.ar : tab.en}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTableRows rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{isAr ? 'رقم العملية' : 'Transaction ID'}</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">{isAr ? 'رقم الطلب' : 'Order #'}</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">{isAr ? 'الطريقة' : 'Method'}</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((payment, i) => (
                    <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-slate-400 dark:text-slate-500" />
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{payment.transactionId || payment.id.slice(0, 8)}</span>
                            {payment.order?.orderNumber && <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{payment.order.orderNumber}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{new Date(payment.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">{payment.order?.orderNumber || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{Number(payment.amount).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Badge variant={methodConfig[payment.method]?.variant || 'primary'} size="sm">{methodConfig[payment.method] ? (isAr ? methodConfig[payment.method].ar : methodConfig[payment.method].en) : payment.method}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[payment.status]?.variant || 'success'} size="sm" dot>{statusConfig[payment.status] ? (isAr ? statusConfig[payment.status].ar : statusConfig[payment.status].en) : payment.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{statusFilter === 'all' ? (isAr ? 'لا توجد مدفوعات بعد' : 'No payments yet') : (isAr ? 'لا توجد معاملات تطابق الفلتر' : 'No transactions match the filter')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
