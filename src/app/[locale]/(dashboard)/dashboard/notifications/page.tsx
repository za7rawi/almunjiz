'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Package, CreditCard, AlertCircle, CheckCircle2, Trash2, CheckCheck, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

type FilterType = 'all' | 'unread'

interface Notification {
  id: string
  title: string
  titleEn?: string
  message: string
  messageEn?: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}

const filterTabs: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'unread', label: 'غير مقروءة' },
]

function getNotificationColor(type: string) {
  const map: Record<string, string> = {
    ORDER: 'bg-[#2580eb]/10 text-[#2580eb]',
    PAYMENT: 'bg-emerald-500/10 text-emerald-500',
    SYSTEM: 'bg-[#7c3aed]/10 text-[#7c3aed]',
    PROMOTION: 'bg-amber-500/10 text-amber-500',
    SUPPORT: 'bg-red-500/10 text-red-500',
  }
  return map[type] || 'bg-slate-100 text-slate-500'
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'ORDER': return <Package size={18} />
    case 'PAYMENT': return <CreditCard size={18} />
    case 'SYSTEM': return <Bell size={18} />
    case 'PROMOTION': return <AlertCircle size={18} />
    case 'SUPPORT': return <CheckCircle2 size={18} />
    default: return <Bell size={18} />
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  if (days < 30) return `منذ ${days} يوم`
  return new Date(dateStr).toLocaleDateString('ar-SA')
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    fetch('/api/notifications?limit=100', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => { if (data.success && Array.isArray(data.data)) setNotifications(data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead
    return true
  })

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    try { await fetch(`/api/notifications/${id}/read`, { method: 'POST', cache: 'no-store' }) } catch {}
  }

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try { await fetch('/api/notifications?markAllRead=true', { method: 'POST', cache: 'no-store' }) } catch {}
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        subtitle={`${unreadCount} غير مقروء`}
        breadcrumbs={[{ label: 'لوحة التحكم', href: '/dashboard' }, { label: 'الإشعارات' }]}
        gradient
        actions={unreadCount > 0 ? <Button variant="secondary" size="sm" onClick={markAllRead}><CheckCheck size={16} className="ms-1.5" /> تحديد الكل كمقروء</Button> : undefined}
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveFilter(tab.id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFilter === tab.id ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2580eb]/30'}`}>
            {tab.label}{tab.id === 'unread' && unreadCount > 0 && <span className="ms-1.5 text-xs opacity-70">({unreadCount})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#2580eb]" size={32} /></div>
      ) : filtered.length === 0 ? (
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
              <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }} transition={{ delay: i * 0.04 }} layout>
                <Card padding="none" className={`overflow-hidden transition-all hover:shadow-md ${!notif.isRead ? 'border-[#2580eb]/20 bg-[#2580eb]/[0.02]' : ''}`}>
                  <div className="flex items-start gap-4 p-4 sm:p-5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${getNotificationColor(notif.type)}`}>{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markAsRead(notif.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-[#2580eb] shrink-0" />}
                        <h4 className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1.5">{timeAgo(notif.createdAt)}</p>
                    </div>
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
