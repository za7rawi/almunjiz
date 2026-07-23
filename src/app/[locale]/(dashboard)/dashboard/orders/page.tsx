'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Package, Search, Filter, Eye } from 'lucide-react'
import { useOrderStore } from '@/store/order-store'
import { useLanguageStore } from '@/store/language-store'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate, formatCurrency } from '@/lib/utils'

const tabs = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'pending', labelAr: 'قيد الانتظار', labelEn: 'Pending' },
  { id: 'in-progress', labelAr: 'قيد التنفيذ', labelEn: 'In Progress' },
  { id: 'completed', labelAr: 'مكتمل', labelEn: 'Completed' },
  { id: 'cancelled', labelAr: 'ملغي', labelEn: 'Cancelled' },
]

const statusConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'; progress: number }> = {
  pending: { variant: 'warning', progress: 10 },
  'in-progress': { variant: 'info', progress: 55 },
  completed: { variant: 'success', progress: 100 },
  cancelled: { variant: 'danger', progress: 0 },
  paid: { variant: 'success', progress: 100 },
  unpaid: { variant: 'warning', progress: 30 },
}

const statusLabels: Record<string, { ar: string; en: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  'in-progress': { ar: 'قيد التنفيذ', en: 'In Progress' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },
  paid: { ar: 'مدفوع', en: 'Paid' },
  unpaid: { ar: 'غير مدفوع', en: 'Unpaid' },
}

export default function OrdersPage() {
  const { orders } = useOrderStore()
  const { language } = useLanguageStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'all' || order.status === activeTab
      const matchesSearch =
        !search ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.serviceName.toLowerCase().includes(search.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [orders, activeTab, search])

  return (
    <div>
      <PageHeader
        title={language === 'ar' ? 'طلباتي' : 'My Orders'}
        subtitle={language === 'ar' ? `${orders.length} طلب` : `${orders.length} orders`}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/dashboard' },
          { label: language === 'ar' ? 'طلباتي' : 'My Orders' },
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput
            placeholder={language === 'ar' ? 'بحث في الطلبات...' : 'Search orders...'}
            onSearch={setSearch}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-[#2580eb]/30'
            }`}
          >
            {language === 'ar' ? tab.labelAr : tab.labelEn}
            {tab.id !== 'all' && (
              <span className="ms-1.5 text-xs opacity-70">
                ({orders.filter(o => tab.id === 'all' || o.status === tab.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Card padding="lg">
          <div className="py-16 text-center">
            <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {language === 'ar' ? 'لم تقم بإنشاء أي طلبات بعد' : 'You haven\'t created any orders yet'}
            </p>
            <button onClick={() => router.push('/services')}>
              <Button>{language === 'ar' ? 'تصفح الخدمات' : 'Browse Services'}</Button>
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, i) => {
            const st = statusConfig[order.status] || { variant: 'info' as const, progress: 0 }
            const sl = statusLabels[order.status] || { ar: order.status, en: order.status }
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                className="cursor-pointer"
              >
                <Card padding="none" className="overflow-hidden hover:border-[#2580eb]/30 transition-all">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center text-[#2580eb]">
                          <Package size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">{order.orderNumber}</h4>
                            <Badge variant={st.variant} size="sm" dot>
                              {language === 'ar' ? sl.ar : sl.en}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{order.serviceName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:text-left">
                        <div className="hidden sm:block text-left min-w-[120px]">
                          <Progress value={st.progress} height="sm" />
                          <p className="text-[11px] text-slate-400 mt-1">{st.progress}%</p>
                        </div>
                        <div className="text-left min-w-[100px]">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(order.total)}</p>
                          <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <Eye size={18} className="text-slate-400" />
                      </div>
                    </div>
                    <div className="mt-3 sm:hidden">
                      <Progress value={st.progress} height="sm" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}


