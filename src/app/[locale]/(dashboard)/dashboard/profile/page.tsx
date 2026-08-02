'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Save, CheckCircle, AlertCircle, Shield, Camera } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { language } = useLanguageStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isAr = language === 'ar'

  useEffect(() => {
    const sync = () => {
      if (user) {
        setName(user.name)
        setPhone(user.phone || '')
      }
    }
    sync()
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
        setMessage({ type: 'success', text: isAr ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully' })
      } else {
        setMessage({ type: 'error', text: data.error || (isAr ? 'فشل التحديث' : 'Update failed') })
      }
    } catch {
      setMessage({ type: 'error', text: isAr ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'الملف الشخصي' : 'Profile'}
        subtitle={isAr ? 'إدارة معلومات حسابك' : 'Manage your account information'}
        gradient
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card glass className="p-6 text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-[#2580eb]/20">
                {user?.name?.charAt(0) || (isAr ? 'م' : 'U')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#2580eb] transition-colors cursor-pointer">
                <Camera size={14} />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#2580eb]/10 text-[#2580eb]">
                <Shield size={12} />
                {user?.role === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'عميل' : 'Customer')}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card glass className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#2580eb]/10 text-[#2580eb]">
                <User size={16} />
              </div>
              {isAr ? 'معلومات الحساب' : 'Account Information'}
            </h3>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 flex items-center gap-2 p-3 rounded-xl text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                    : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20'
                }`}
              >
                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  {isAr ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email address cannot be changed'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? 'رقم الجوال' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    placeholder="+962XXXXXXXXX"
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={loading}
                  iconLeft={!loading ? <Save size={16} /> : undefined}
                >
                  {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
