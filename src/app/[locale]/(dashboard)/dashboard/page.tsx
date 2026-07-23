'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package,
  CreditCard,
  Receipt,
  FolderOpen,
  Plus,
  Search,
  Headphones,
  ArrowUpLeft,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useOrderStore } from '@/store/order-store'
import { useLanguageStore } from '@/store/language-store'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/ui/page-header'

const statusMap: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'; labelAr: string }> = {
  pending: { variant: 'warning', labelAr: 'قيد الانتظار' },
  'in-progress': { variant: 'info', labelAr: 'قيد التنفيذ' },
  completed: { variant: 'success', labelAr: 'مكتمل' },
  cancelled: { variant: 'danger', labelAr: 'ملغي' },
  paid: { variant: 'success', labelAr: 'مدفوع' },
  unpaid: { variant: 'warning', labelAr: 'غير مدفوع' },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { orders } = useOrderStore()
  const { language } = useLanguageStore()
  const router = useRouter()

  const recentOrders = orders.slice(0, 5)
  const totalOrders = orders.length
  const totalPaid = orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  const quickActions = [
    { label: 'إنشاء طلب', labelEn: 'New Order', icon: <Plus size={18} />, href: '/services', color: 'from-[#2580eb] to-[#14b8a6]' },
    { label: 'تتبع طلب', labelEn: 'Track Order', icon: <Search size={18} />, href: '/dashboard/orders', color: 'from-[#7c3aed] to-[#2580eb]' },
    { label: 'الدعم الفني', labelEn: 'Support', icon: <Headphones size={18} />, href: '/dashboard/chat', color: 'from-[#14b8a6] to-emerald-500' },
  ]

  const activities = [
    { icon: <Package size={16} />, text: 'تم إنشاء طلب جديد', textEn: 'New order created', time: 'منذ 5 دقائق', timeEn: '5 minutes ago', color: 'bg-[#2580eb]/10 text-[#2580eb]' },
    { icon: <CreditCard size={16} />, text: 'تم الدفع بنجاح', textEn: 'Payment completed', time: 'منذ ساعة', timeEn: '1 hour ago', color: 'bg-emerald-500/10 text-emerald-500' },
    { icon: <CheckCircle2 size={16} />, text: 'تم إكمال الخدمة', textEn: 'Service completed', time: 'منذ 3 ساعات', timeEn: '3 hours ago', color: 'bg-[#14b8a6]/10 text-[#14b8a6]' },
    { icon: <MessageSquare size={16} />, text: 'رسالة جديدة من الدعم', textEn: 'New support message', time: 'منذ يوم', timeEn: '1 day ago', color: 'bg-[#7c3aed]/10 text-[#7c3aed]' },
  ]

  return (
    <div>
      <PageHeader
        title={`${language === 'ar' ? 'مرحباً' : 'Welcome'}, ${user?.name?.split(' ')[0] || (language === 'ar' ? 'مستخدم' : 'User')} 👋`}
        subtitle={language === 'ar' ? 'إليك نظرة عامة على حسابك' : 'Here\'s an overview of your account'}
        gradient
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package size={20} />}
          value={totalOrders}
          label={language === 'ar' ? 'عدد الطلبات' : 'Total Orders'}
        />
        <StatCard
          icon={<CreditCard size={20} />}
          value={totalPaid}
          prefix="ر.س "
          label={language === 'ar' ? 'المدفوعات' : 'Total Paid'}
        />
        <StatCard
          icon={<Receipt size={20} />}
          value={orders.length}
          label={language === 'ar' ? 'الفواتير' : 'Invoices'}
        />
        <StatCard
          icon={<FolderOpen size={20} />}
          value={0}
          label={language === 'ar' ? 'الملفات' : 'Files'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}
              </h3>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm">
                  {language === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500">
                    {language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
                  </p>
                  <Link href="/services" className="mt-3 inline-block">
                    <Button size="sm">
                      {language === 'ar' ? 'إنشاء أول طلب' : 'Create First Order'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentOrders.map((order, i) => {
                    const st = statusMap[order.status] || { variant: 'info' as const, labelAr: order.status }
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center text-[#2580eb]">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{order.orderNumber}</p>
                            <p className="text-xs text-slate-500">{order.serviceName}</p>
                          </div>
                        </div>
                        <div className="text-left flex items-center gap-3">
                          <Badge variant={st.variant} size="sm">
                            {st.labelAr}
                          </Badge>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(order.total)}</p>
                            <p className="text-[11px] text-slate-400">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
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
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30 transition-all cursor-pointer"
                  >
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {language === 'ar' ? action.label : action.labelEn}
                    </span>
                    <ArrowUpLeft size={14} className="ms-auto text-slate-400" />
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`p-1.5 rounded-lg ${activity.color} shrink-0 mt-0.5`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? activity.text : activity.textEn}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {language === 'ar' ? activity.time : activity.timeEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
