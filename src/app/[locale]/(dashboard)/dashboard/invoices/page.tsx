'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, FolderOpen, Printer } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonTableRows } from '@/components/ui/skeleton'
import { printInvoice } from '@/lib/print-invoice'
import { useIsClient } from '@/hooks/use-is-client'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  tax: number
  discount: number
  subtotal: number
  status: string
  createdAt: string
  paidAt?: string
  order?: {
    id: string
    orderNumber: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    paymentMethod?: string
    transactionId?: string
    paymentStatus?: string
    serviceName?: string
    service?: { name: string }
  }
  user?: { id: string; name: string; email: string; phone?: string }
}

const statusConfig: Record<string, { label: string; labelEn: string; variant: 'success' | 'warning' | 'danger' }> = {
  PAID: { label: 'مدفوعة', labelEn: 'Paid', variant: 'success' },
  PENDING: { label: 'معلقة', labelEn: 'Pending', variant: 'warning' },
  COMPLETED: { label: 'مدفوعة', labelEn: 'Paid', variant: 'success' },
  CANCELLED: { label: 'ملغاة', labelEn: 'Cancelled', variant: 'danger' },
  OVERDUE: { label: 'متأخرة', labelEn: 'Overdue', variant: 'danger' },
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const mounted = useIsClient()
  const { user } = useAuthStore()
  const { language } = useLanguageStore()

  const isAr = language === 'ar'

  useEffect(() => {
    const fetchData = () => {
      const params = new URLSearchParams({ limit: '200' })
      if (user?.id) params.set('userId', user.id)
      fetch(`/api/invoices?${params.toString()}`, { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error('API error')
          return r.json()
        })
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setInvoices(data.data)
          }
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

  if (!mounted) return null

  const filtered = invoices.filter((inv) =>
    !searchQuery ||
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.order?.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.order?.service?.name || inv.order?.serviceName || '').includes(searchQuery),
  )

  const handlePrintInvoice = async (inv: Invoice) => {
    const date = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
    await printInvoice({
      invoiceNumber: inv.invoiceNumber,
      orderNumber: inv.order?.orderNumber,
      customer: inv.order?.customerName || inv.user?.name || (isAr ? 'عميل المنجز' : 'Al-Munjiz Customer'),
      email: inv.order?.customerEmail || inv.user?.email || '',
      phone: inv.order?.customerPhone || inv.user?.phone || '',
      service: inv.order?.service?.name || inv.order?.serviceName || (isAr ? 'خدمة' : 'Service'),
      amount: Number(inv.subtotal || inv.total - (inv.tax || 0)),
      tax: Number(inv.tax || 0),
      discount: Number(inv.discount || 0),
      total: Number(inv.total),
      dueDate: date,
      date,
      status: inv.status === 'PAID' || inv.status === 'COMPLETED' ? 'paid' : 'pending',
    })
  }

  const totalFilteredAmount = filtered.reduce((sum, inv) => sum + Number(inv.total || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'الفواتير' : 'Invoices'}
        subtitle={isAr ? 'عرض وإدارة فواتيرك' : 'View and manage your invoices'}
        gradient
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'بحث في الفواتير...' : 'Search invoices...'}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonTableRows rows={6} />
      ) : error ? (
        <Card glass className="p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
            {isAr ? 'حدث خطأ أثناء تحميل الفواتير' : 'An error occurred while loading invoices'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={isAr ? 'لا توجد فواتير' : 'No invoices found'}
          description={searchQuery
            ? (isAr ? 'جرّب تعديل كلمات البحث' : 'Try adjusting your search terms')
            : (isAr ? 'ستظهر فواتيرك هنا بعد إنشاء طلبات' : 'Your invoices will appear here after creating orders')}
        />
      ) : (
        <Card glass padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {isAr ? 'رقم الفاتورة' : 'Invoice #'}
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">
                    {isAr ? 'الخدمة' : 'Service'}
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">
                    {isAr ? 'رقم الطلب' : 'Order #'}
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {isAr ? 'الإجمالي' : 'Total'}
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">
                    {isAr ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {isAr ? 'إجراء' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((inv, i) => {
                    const sc = statusConfig[inv.status] || { label: inv.status, labelEn: inv.status, variant: 'success' as const }
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed]">
                              <FileText size={14} />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                              <p className="text-xs text-slate-400 dark:text-slate-500 sm:hidden">
                                {inv.order?.service?.name || inv.order?.serviceName || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                          {inv.order?.service?.name || inv.order?.serviceName || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-[#2580eb] hidden md:table-cell" dir="ltr">
                          {inv.order?.orderNumber || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                          {Number(inv.total).toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                          {new Date(inv.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={sc.variant} size="sm" dot>
                            {isAr ? sc.label : sc.labelEn}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePrintInvoice(inv)}
                            className="p-2 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-colors"
                            title={isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
                          >
                            <Printer size={16} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Footer Summary */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-1"
        >
          <span>
            {isAr ? `عرض ${filtered.length} من ${invoices.length} فاتورة` : `Showing ${filtered.length} of ${invoices.length} invoices`}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500">{isAr ? 'الإجمالي:' : 'Total:'}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {totalFilteredAmount.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
