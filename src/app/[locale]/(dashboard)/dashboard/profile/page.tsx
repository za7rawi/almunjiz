'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/users/' + user?.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ name, phone })
        setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' })
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل التحديث' })
      }
    } catch {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="الملف الشخصي" subtitle="إدارة معلومات حسابك" gradient />

      <Card className="p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'م'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.role === 'admin' ? 'مدير' : 'عميل'}</p>
          </div>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`mb-4 flex items-center gap-2 p-3 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الاسم</label>
            <div className="relative">
              <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={user?.email || ''} disabled dir="ltr"
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رقم الجوال</label>
            <div className="relative">
              <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr"
                placeholder="+966XXXXXXXXX"
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" />
            </div>
          </div>

          <Button variant="primary" onClick={handleSave} loading={loading} iconLeft={!loading ? <Save size={16} /> : undefined}>
            حفظ التغييرات
          </Button>
        </div>
      </Card>
    </div>
  )
}
