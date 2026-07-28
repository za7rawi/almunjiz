'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Bell, Trash2, Save, Shield, Upload, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth-store'
import { getInitials } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useIsClient } from '@/hooks/use-is-client'
import { useLanguageStore } from '@/store/language-store'

function PasswordStrength({ password, isAr }: { password: string; isAr: boolean }) {
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  const labels = isAr
    ? ['ضعيف جداً', 'ضعيف', 'متوسط', 'قوي', 'قوي جداً']
    : ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong']
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981']
  const percent = (strength / 5) * 100
  if (password.length === 0) return null
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500 dark:text-slate-400">{isAr ? 'قوة كلمة المرور' : 'Password strength'}</span>
        <span style={{ color: colors[strength] }}>{labels[strength]}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full rounded-full" style={{ backgroundColor: colors[strength] }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#2580eb]/30 ${checked ? 'bg-[#2580eb]' : 'bg-slate-200 dark:bg-slate-600'}`}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const mounted = useIsClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const { user, updateUser, logout } = useAuthStore()
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  const tabs = [
    { id: 'profile', label: isAr ? 'الملف الشخصي' : 'Profile', icon: User },
    { id: 'password', label: isAr ? 'تغيير كلمة المرور' : 'Change Password', icon: Lock },
    { id: 'notifications', label: isAr ? 'الإشعارات' : 'Notifications', icon: Bell },
    { id: 'danger', label: isAr ? 'حذف الحساب' : 'Delete Account', icon: Trash2 },
  ]

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState({ email: true, mobile: true, orders: true, offers: false })

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
      setAvatar(user.avatar ?? null)
    }
  }, [user])

  if (!mounted) return null

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, avatar }),
      })
      const data = await res.json()
      if (data.success) {
        updateUser({ name, email, avatar })
      }
    } catch {
      updateUser({ name, email, avatar })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword !== confirmPassword) {
      setPasswordError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError(isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        setPasswordSuccess(isAr ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.message || (isAr ? 'فشل تحديث كلمة المرور' : 'Failed to update password'))
      }
    } catch {
      setPasswordError(isAr ? 'حدث خطأ أثناء تحديث كلمة المرور' : 'An error occurred while updating password')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    logout()
    router.replace('/')
  }

  return (
    <div className="space-y-6">
      <PageHeader title={isAr ? 'الإعدادات' : 'Settings'} subtitle={isAr ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'} gradient />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-2 space-y-1 shadow-sm">
            {tabs.map((tab) => (
              <motion.button key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#2580eb]/10 text-[#2580eb]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <tab.icon size={18} />{tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card>
                  <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'الملف الشخصي' : 'Profile'}</h3></CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitials(name || (isAr ? 'مستخدم' : 'User'))}
                        </div>
                        <div>
                          <button onClick={() => { const el = fileInputRef.current; el?.click(); }} className="text-sm text-[#2580eb] hover:underline flex items-center gap-1.5">
                            <Upload size={14} />{isAr ? 'تغيير الصورة' : 'Change photo'}
                          </button>
                        </div>
                      </div>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label={isAr ? 'الاسم' : 'Name'} value={name} onChange={(e) => setName(e.target.value)} />
                        <Input label={isAr ? 'البريد الإلكتروني' : 'Email'} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <Button variant="primary" size="md" loading={saving} onClick={handleSaveProfile} iconLeft={<Save size={16} />}>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield size={20} className="text-[#2580eb]" />
                      <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5 max-w-md">
                      {passwordError && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">{passwordError}</div>
                      )}
                      {passwordSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400">{passwordSuccess}</div>
                      )}
                      <Input label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} isPassword value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      <div>
                        <Input label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} isPassword value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <PasswordStrength password={newPassword} isAr={isAr} />
                      </div>
                      <Input label={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} isPassword value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={confirmPassword && newPassword !== confirmPassword ? (isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match') : undefined} />
                      <Button variant="primary" size="md" loading={saving} onClick={handleSavePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword} iconLeft={<Lock size={16} />}>{isAr ? 'تحديث كلمة المرور' : 'Update Password'}</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card>
                  <CardHeader><h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</h3></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {([
                        { key: 'email' as const, label: isAr ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', desc: isAr ? 'تلقى إشعارات عبر البريد الإلكتروني' : 'Receive notifications via email' },
                        { key: 'mobile' as const, label: isAr ? 'إشعارات الجوال' : 'Mobile Notifications', desc: isAr ? 'تلقى إشعارات فورية على جهازك' : 'Receive instant notifications on your device' },
                        { key: 'orders' as const, label: isAr ? 'إشعارات الطلبات' : 'Order Notifications', desc: isAr ? 'تلقى إشعارات عند تحديث حالة طلبك' : 'Receive notifications when your order status updates' },
                        { key: 'offers' as const, label: isAr ? 'إشعارات العروض' : 'Offer Notifications', desc: isAr ? 'تلقى إشعارات العروض الخاصة والخصومات' : 'Receive notifications about special offers and discounts' },
                      ]).map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                          <ToggleSwitch checked={notifications[item.key]} onChange={(val) => setNotifications((prev) => ({ ...prev, [item.key]: val }))} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'danger' && (
              <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card>
                  <CardHeader><h3 className="font-bold text-red-600">{isAr ? 'حذف الحساب' : 'Delete Account'}</h3></CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">{isAr ? 'تحذير خطير' : 'Serious Warning'}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{isAr ? 'حذف حسابك سيمسح جميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.' : 'Deleting your account will permanently erase all your data. This action cannot be undone.'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-6">
                      <p className="text-sm text-amber-700 dark:text-amber-400">{isAr ? 'ل حذف حسابك نهائياً، يرجى التواصل مع الدعم الفني عبر البريد الإلكتروني أو الواتساب.' : 'To permanently delete your account, please contact support via email or WhatsApp.'}</p>
                    </div>
                    <Button variant="secondary" size="md" onClick={handleDeleteAccount} iconLeft={<Trash2 size={16} />}>{isAr ? 'تسجيل الخروج' : 'Logout'}</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
