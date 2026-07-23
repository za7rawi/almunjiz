'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Clock,
  CheckCircle2,
  RotateCcw,
  Download,
  ExternalLink,
  Filter,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'

type MethodFilter = 'all' | 'mada' | 'visa' | 'apple' | 'transfer'
type StatusFilter = 'all' | 'completed' | 'pending' | 'refunded'

interface Payment {
  id: string
  date: string
  orderNumber: string
  amount: number
  method: 'mada' | 'visa' | 'apple' | 'transfer'
  status: 'completed' | 'pending' | 'refunded'
  receiptUrl?: string
}

const mockPayments: Payment[] = [
  { id: 'PAY-001', date: '2026-01-15', orderNumber: 'ORD-2024', amount: 450, method: 'mada', status: 'completed', receiptUrl: '#' },
  { id: 'PAY-002', date: '2026-01-14', orderNumber: 'ORD-2023', amount: 1200, method: 'visa', status: 'completed', receiptUrl: '#' },
  { id: 'PAY-003', date: '2026-01-13', orderNumber: 'ORD-2022', amount: 320, method: 'apple', status: 'completed', receiptUrl: '#' },
  { id: 'PAY-004', date: '2026-01-12', orderNumber: 'ORD-2021', amount: 890, method: 'transfer', status: 'pending' },
  { id: 'PAY-005', date: '2026-01-11', orderNumber: 'ORD-2020', amount: 650, method: 'mada', status: 'completed', receiptUrl: '#' },
  { id: 'PAY-006', date: '2026-01-10', orderNumber: 'ORD-2019', amount: 2100, method: 'visa', status: 'refunded' },
  { id: 'PAY-007', date: '2026-01-09', orderNumber: 'ORD-2018', amount: 175, method: 'apple', status: 'completed', receiptUrl: '#' },
  { id: 'PAY-008', date: '2026-01-08', orderNumber: 'ORD-2017', amount: 3400, method: 'visa', status: 'pending' },
  { id: 'PAY-009', date: '2026-01-07', orderNumber: 'ORD-2016', amount: 920, method: 'mada', status: 'completed', receiptUrl: '#' },
  { id: 'PAY-010', date: '2026-01-06', orderNumber: 'ORD-2015', amount: 560, method: 'transfer', status: 'completed', receiptUrl: '#' },
]

const methodTabs: { id: MethodFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'mada', label: 'مدى' },
  { id: 'visa', label: 'فيزا' },
  { id: 'apple', label: 'آبل باي' },
  { id: 'transfer', label: 'تحويل بنكي' },
]

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'refunded', label: 'مسترد' },
]

const methodConfig: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'info' }> = {
  mada: { label: 'مدى', variant: 'success' },
  visa: { label: 'فيزا', variant: 'primary' },
  apple: { label: 'آبل باي', variant: 'info' },
  transfer: { label: 'تحويل بنكي', variant: 'warning' },
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  completed: { label: 'مكتمل', variant: 'success' },
  pending: { label: 'قيد المراجعة', variant: 'warning' },
  refunded: { label: 'مسترد', variant: 'danger' },
}

export default function PaymentsPage() {
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = mockPayments.filter((p) => {
    const matchMethod = methodFilter === 'all' || p.method === methodFilter
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchMethod && matchStatus
  })

  const totalPaid = mockPayments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const totalPending = mockPayments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const totalRefunded = mockPayments.filter((p) => p.status === 'refunded').reduce((s, p) => s + p.amount, 0)
  const totalAll = mockPayments.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="المدفوعات"
        subtitle={`${mockPayments.length} معاملة`}
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/dashboard' },
          { label: 'المدفوعات' },
        ]}
        gradient
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<CreditCard size={20} />}
          value={totalAll}
          prefix="ر.س "
          label="إجمالي المدفوعات"
        />
        <StatCard
          icon={<Clock size={20} />}
          value={totalPending}
          prefix="ر.س "
          label="قيد الانتظار"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={totalPaid}
          prefix="ر.س "
          label="المكتملة"
        />
        <StatCard
          icon={<RotateCcw size={20} />}
          value={totalRefunded}
          prefix="ر.س "
          label="المستردة"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter size={14} />
          <span>الفلاتر</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
            {methodTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMethodFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  methodFilter === tab.id
                    ? 'bg-[#2580eb] text-white shadow-md shadow-[#2580eb]/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2580eb]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#7c3aed]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">رقم المعاملة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">التاريخ</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">رقم الطلب</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">المبلغ</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">الطريقة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الحالة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الإيصال</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{payment.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                      {new Date(payment.date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{payment.orderNumber}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{payment.amount.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge variant={methodConfig[payment.method]?.variant || 'primary'} size="sm">
                        {methodConfig[payment.method]?.label || payment.method}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusConfig[payment.status]?.variant || 'success'} size="sm" dot>
                        {statusConfig[payment.status]?.label || payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {payment.receiptUrl ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                        >
                          <Download size={16} />
                        </motion.button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
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
            <p className="text-sm text-slate-500">لا توجد معاملات تطابق الفلتر</p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>عرض {filtered.length} من {mockPayments.length} معاملة</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">الإجمالي:</span>
            <span className="font-bold text-slate-900">
              {filtered.reduce((s, p) => s + p.amount, 0).toLocaleString()} ر.س
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
