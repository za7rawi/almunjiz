'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, FileText, FolderOpen, Printer, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { printInvoice } from '@/lib/print-invoice'
import { useIsClient } from '@/hooks/use-is-client'

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  tax: number;
  status: string;
  createdAt: string;
  order?: { orderNumber: string; service?: { name: string } };
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  PAID: { label: 'مدفوعة', variant: 'success' },
  PENDING: { label: 'معلقة', variant: 'warning' },
  COMPLETED: { label: 'مدفوعة', variant: 'success' },
  CANCELLED: { label: 'ملغاة', variant: 'danger' },
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useIsClient()

  useEffect(() => {
    fetch('/api/invoices?limit=200')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) setInvoices(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!mounted) return null

  const filtered = invoices.filter((inv) =>
    !searchQuery ||
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.order?.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.order?.service?.name || '').includes(searchQuery),
  )

  return (
    <div className="space-y-6">
      <PageHeader title="الفواتير" subtitle="عرض وإدارة فواتيرك" gradient />

      <div className="relative max-w-md">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث في الفواتير..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#2580eb]" size={32} /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">رقم الفاتورة</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">الخدمة</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الإجمالي</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">التاريخ</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الحالة</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">إجراء</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((inv, i) => (
                    <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2"><FileText size={16} className="text-slate-400" /><div><span className="text-sm font-medium text-slate-900">{inv.invoiceNumber}</span><p className="text-xs text-slate-400 sm:hidden">{inv.order?.service?.name || '-'}</p></div></div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{inv.order?.service?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.total} ر.س</td>
                      <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{new Date(inv.createdAt).toLocaleDateString('ar-SA')}</td>
                      <td className="px-6 py-4"><Badge variant={statusConfig[inv.status]?.variant || 'success'} size="sm" dot>{statusConfig[inv.status]?.label || inv.status}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => printInvoice({ invoiceNumber: inv.invoiceNumber, customer: 'عميل المنجز', email: '', service: inv.order?.service?.name || '-', amount: inv.total - (inv.tax || 0), tax: inv.tax || 0, total: inv.total, dueDate: new Date(inv.createdAt).toLocaleDateString('ar-SA'), date: new Date(inv.createdAt).toLocaleDateString('ar-SA'), status: 'paid' })} className="p-2 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-colors" title="طباعة الفاتورة"><Printer size={16} /></motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => alert('جاري التصدير...')} className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"><Download size={16} /></motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FolderOpen size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm mb-1">لا توجد فواتير</p>
              <p className="text-slate-400 text-xs">{searchQuery ? 'جرّب تعديل كلمات البحث' : 'ستظهر فواتيرك هنا بعد إنشاء طلبات'}</p>
            </div>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>عرض {filtered.length} من {invoices.length} فاتورة</span>
          <div className="flex items-center gap-2 text-xs"><span className="text-slate-400">الإجمالي:</span><span className="font-bold text-slate-900">{filtered.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} ر.س</span></div>
        </div>
      )}
    </div>
  )
}
