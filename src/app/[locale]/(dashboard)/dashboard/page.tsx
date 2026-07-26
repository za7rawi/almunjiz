'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, CreditCard, Receipt, FolderOpen, Plus, Search, Headphones, ArrowUpLeft, TrendingUp, CheckCircle2, MessageSquare, Loader2, Bell, Shield, Download, ChevronLeft, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'
import type { ApiOrder } from '@/types/api-order'

const statusMap: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'; labelAr: string }> = {
  PENDING: { variant: 'warning', labelAr: 'قيد الانتظار' },
  UNDER_REVIEW: { variant: 'primary', labelAr: 'قيد المراجعة' },
  WAITING_CLIENT: { variant: 'warning', labelAr: 'بانتظار العميل' },
  IN_PROGRESS: { variant: 'info', labelAr: 'قيد التنفيذ' },
  COMPLETED: { variant: 'success', labelAr: 'مكتمل' },
  DELIVERED: { variant: 'success', labelAr: 'تم التسليم' },
  CANCELLED: { variant: 'danger', labelAr: 'ملغي' },
}

const statusToStep: Record<string, number> = {
  PENDING: 1,
  UNDER_REVIEW: 2,
  WAITING_CLIENT: 3,
  IN_PROGRESS: 4,
  COMPLETED: 5,
  DELIVERED: 6,
}

const statusColorMap: Record<string, string> = {
  PENDING: '#f59e0b',
  UNDER_REVIEW: '#2580eb',
  WAITING_CLIENT: '#f59e0b',
  IN_PROGRESS: '#14b8a6',
  COMPLETED: '#22c55e',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
}

const notificationTypeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  ORDER: { icon: <Package size={16} />, color: 'bg-[#2580eb]/10 text-[#2580eb]' },
  PAYMENT: { icon: <CreditCard size={16} />, color: 'bg-emerald-500/10 text-emerald-500' },
  SYSTEM: { icon: <Bell size={16} />, color: 'bg-[#7c3aed]/10 text-[#7c3aed]' },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return 'الآن'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} د`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} س`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ي`
  const months = Math.floor(days / 30)
  return `${months} ش`
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM'
  isRead: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { language } = useLanguageStore()
  const router = useRouter()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [fileCount, setFileCount] = useState(0)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }

    const fetchAll = () => {
      fetch('/api/orders?limit=50', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => { if (data.success && data.data) setOrders(data.data); })
        .catch(() => {})
        .finally(() => setLoading(false))

      fetch('/api/notifications?limit=5', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => { if (data.success && data.data) setNotifications(data.data); })
        .catch(() => {})

      fetch('/api/invoices?limit=1000', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => { if (data.success && data.meta?.total != null) setInvoiceCount(data.meta.total); })
        .catch(() => {})

      fetch('/api/files', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => { if (data.success && data.data) setFileCount(data.data.length || data.meta?.total || 0); })
        .catch(() => {})
    }

    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

  const recentOrders = orders.slice(0, 5)
  const totalOrders = orders.length
  const totalPaid = orders.filter(o => o.status === 'COMPLETED' || o.paymentStatus === 'PAID').reduce((s, o) => s + Number(o.total), 0)
  const activeOrders = orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'UNDER_REVIEW').length
  const mostRecentOrder = orders[0]
  const mostRecentStep = mostRecentOrder ? statusToStep[mostRecentOrder.status] || 0 : 0

  const statusDistribution = Object.entries(statusMap)
    .map(([status, cfg]) => ({
      status,
      labelAr: cfg.labelAr,
      count: orders.filter(o => o.status === status).length,
      color: statusColorMap[status] || '#94a3b8',
    }))
    .filter(s => s.count > 0)

  const quickActions = [
    { label: 'إنشاء طلب', labelEn: 'New Order', icon: <Plus size={18} />, href: '/services', color: 'from-[#2580eb] to-[#14b8a6]' },
    { label: 'تتبع طلب', labelEn: 'Track Order', icon: <Search size={18} />, href: '/dashboard/orders', color: 'from-[#7c3aed] to-[#2580eb]' },
    { label: 'الدعم الفني', labelEn: 'Support', icon: <Headphones size={18} />, href: '/dashboard/chat', color: 'from-[#14b8a6] to-emerald-500' },
    { label: 'تحميل الفواتير', labelEn: 'Download Invoices', icon: <Download size={18} />, href: '/dashboard/invoices', color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div>
      <PageHeader
        title={`${language === 'ar' ? 'مرحباً' : 'Welcome'}, ${user?.name?.split(' ')[0] || (language === 'ar' ? 'مستخدم' : 'User')} 👋`}
        subtitle={language === 'ar' ? 'إليك نظرة عامة على حسابك' : "Here's an overview of your account"}
        gradient
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative">
          <StatCard icon={<Package size={20} />} value={totalOrders} label={language === 'ar' ? 'عدد الطلبات' : 'Total Orders'} />
          {totalOrders === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-5">{language === 'ar' ? 'ابدأ بإنشاء طلبك الأول' : 'Start by creating your first order'}</p>
          )}
        </div>
        <div className="relative">
          <StatCard icon={<CreditCard size={20} />} value={totalPaid} prefix="ر.س " label={language === 'ar' ? 'المدفوعات' : 'Total Paid'} />
          {totalPaid === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-5">{language === 'ar' ? 'لم تتم أي مدفوعات بعد' : 'No payments made yet'}</p>
          )}
        </div>
        <div className="relative">
          <StatCard icon={<Receipt size={20} />} value={invoiceCount} label={language === 'ar' ? 'الفواتير' : 'Invoices'} />
          {invoiceCount === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-5">{language === 'ar' ? 'ستظهر الفواتير هنا' : 'Invoices will appear here'}</p>
          )}
        </div>
        <div className="relative">
          <StatCard icon={<FolderOpen size={20} />} value={fileCount} label={language === 'ar' ? 'الملفات' : 'Files'} />
          {fileCount === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 px-5">{language === 'ar' ? 'لم يتم رفع ملفات بعد' : 'No files uploaded yet'}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}</h3>
              <Link href="/dashboard/orders"><Button variant="ghost" size="sm">{language === 'ar' ? 'عرض الكل' : 'View All'}</Button></Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#2580eb]" size={24} /></div>
              ) : recentOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500">{language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
                  <Link href="/services" className="mt-3 inline-block"><Button size="sm">{language === 'ar' ? 'إنشاء أول طلب' : 'Create First Order'}</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentOrders.map((order, i) => {
                    const st = statusMap[order.status] || { variant: 'info' as const, labelAr: order.status }
                    const isMostRecent = i === 0
                    const step = statusToStep[order.status]
                    const progressPct = step ? (step / 6) * 100 : 0
                    const isActive = order.status === 'IN_PROGRESS' || order.status === 'UNDER_REVIEW'
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} onClick={() => router.push(`/dashboard/orders/${order.id}`)} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]"><Package size={18} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {order.orderNumber}
                              {isMostRecent && isActive && (
                                <span className="ms-2 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#14b8a6]/10 text-[#14b8a6]">
                                  <Zap size={10} />
                                  {language === 'ar' ? 'الأحدث' : 'Latest'}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{order.service?.name || '-'}</p>
                          </div>
                        </div>
                        <div className="text-left flex items-center gap-3">
                          <Badge variant={st.variant} size="sm">{st.labelAr}</Badge>
                          {isMostRecent && step > 0 && (
                            <div className="w-20 hidden sm:block">
                              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPct}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: statusColorMap[order.status] || '#2580eb' }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="text-left"><p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(Number(order.total))}</p><p className="text-[11px] text-slate-400">{formatDate(order.createdAt)}</p></div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {statusDistribution.length > 0 && (
            <Card>
              <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'توزيع حالات الطلبات' : 'Order Status Distribution'}</h3></CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5">
                  {statusDistribution.map((s) => (
                    <motion.div
                      key={s.status}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / totalOrders) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ backgroundColor: s.color }}
                      className="h-full rounded-full"
                      title={`${s.labelAr}: ${s.count}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {statusDistribution.map((s) => (
                    <div key={s.status} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span>{s.labelAr}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{s.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {activeOrders > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-[#14b8a6]/30 bg-[#14b8a6]/[0.02]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#14b8a6]/10 text-[#14b8a6]"><Zap size={20} /></div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeOrders}</p>
                      <p className="text-sm text-slate-500">{language === 'ar' ? 'طلبات نشطة' : 'Active Orders'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card>
            <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3></CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02 }} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30 transition-all cursor-pointer">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${action.color} text-white`}>{action.icon}</div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{language === 'ar' ? action.label : action.labelEn}</span>
                    <ArrowUpLeft size={14} className="ms-auto text-slate-400" />
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}</h3>
              <Link href="/dashboard/notifications"><Button variant="ghost" size="sm">{language === 'ar' ? 'عرض الكل' : 'View All'}</Button></Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <div className="py-6 text-center">
                  <Bell size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">{language === 'ar' ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const cfg = notificationTypeConfig[n.type] || notificationTypeConfig.SYSTEM
                  return (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${cfg.color} shrink-0 mt-0.5`}>{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{n.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#2580eb] shrink-0 mt-1.5" />}
                    </motion.div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
