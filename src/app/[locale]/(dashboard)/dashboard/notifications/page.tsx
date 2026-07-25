'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Trash2,
  CheckCheck,
  Circle,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FilterType = 'all' | 'unread' | 'order' | 'payment' | 'system'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'order' | 'payment' | 'system' | 'alert'
  read: boolean
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'تم استلام طلبك', message: 'تم استلام طلب #ORD-2024 وهو قيد المراجعة', time: 'منذ 5 دقائق', type: 'order', read: false },
  { id: '2', title: 'تم الدفع بنجاح', message: 'تم خصم 450 ر.س من بطاقة مدى', time: 'منذ 30 دقيقة', type: 'payment', read: false },
  { id: '3', title: 'تحديث حالة الطلب', message: 'طلب #ORD-2023 في مرحلة التنفيذ', time: 'منذ ساعة', type: 'order', read: false },
  { id: '4', title: 'تنبيه أمني', message: 'تم تسجيل دخول من جهاز جديد', time: 'منذ ساعتين', type: 'alert', read: true },
  { id: '5', title: 'فاتورة جديدة', message: 'تم إصدار فاتورة بقيمة 1,200 ر.س', time: 'منذ 3 ساعات', type: 'payment', read: true },
  { id: '6', title: 'اكتمال الخدمة', message: 'تم إكمال خدمة الترجمة لطلب #ORD-2020', time: 'منذ 5 ساعات', type: 'order', read: true },
  { id: '7', title: 'تحديث النظام', message: 'سيتم إجراء صيانة الليلة من 2-4 صباحاً', time: 'منذ يوم', type: 'system', read: true },
  { id: '8', title: 'عرض خاص', message: 'خصم 20% على جميع خدمات التصميم', time: 'منذ يومين', type: 'system', read: true },
  { id: '9', title: 'تم استلام طلبك', message: 'تم استلام طلب #ORD-2019 وهو قيد المراجعة', time: 'منذ 3 أيام', type: 'order', read: true },
  { id: '10', title: 'إشعار الدفع', message: 'تم رفع فاتورة جديدة بانتظار الدفع', time: 'منذ أسبوع', type: 'payment', read: true },
]

const filterTabs: { id: FilterType; label: string; labelEn: string }[] = [
  { id: 'all', label: 'الكل', labelEn: 'All' },
  { id: 'unread', label: 'غير مقروءة', labelEn: 'Unread' },
  { id: 'order', label: 'الطلبات', labelEn: 'Orders' },
  { id: 'payment', label: 'الدفع', labelEn: 'Payment' },
  { id: 'system', label: 'النظام', labelEn: 'System' },
]

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'order': return <Package size={18} />
    case 'payment': return <CreditCard size={18} />
    case 'alert': return <AlertCircle size={18} />
    case 'system': return <Bell size={18} />
  }
}

function getNotificationColor(type: Notification['type']) {
  const map: Record<Notification['type'], string> = {
    order: 'bg-[#2580eb]/10 text-[#2580eb]',
    payment: 'bg-emerald-500/10 text-emerald-500',
    alert: 'bg-red-500/10 text-red-500',
    system: 'bg-[#7c3aed]/10 text-[#7c3aed]',
  }
  return map[type]
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<MockNotifications>(mockNotifications)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.read
    return n.type === activeFilter
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        subtitle={`${unreadCount} غير مقروء`}
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/dashboard' },
          { label: 'الإشعارات' },
        ]}
        gradient
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck size={16} className="ms-1.5" />
              تحديد الكل كمقروء
            </Button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2580eb]/30'
            }`}
          >
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className="ms-1.5 text-xs opacity-70">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card padding="lg">
          <div className="py-16 text-center">
            <Bell size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">لا توجد إشعارات</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04 }}
                layout
              >
                <Card
                  padding="none"
                  className={`overflow-hidden transition-all hover:shadow-md ${
                    !notif.read ? 'border-[#2580eb]/20 bg-[#2580eb]/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4 p-4 sm:p-5">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl shrink-0 ${getNotificationColor(notif.type)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#2580eb] shrink-0" />
                        )}
                        <h4 className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notif.title}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1.5">{notif.time}</p>
                    </div>

                    {/* Delete */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

type MockNotifications = Notification[]
