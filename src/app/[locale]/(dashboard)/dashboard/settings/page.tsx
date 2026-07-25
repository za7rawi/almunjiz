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

const tabs = [
  { id: 'profile', label: 'الملف الشخصي', icon: User },
  { id: 'password', label: 'تغيير كلمة المرور', icon: Lock },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'danger', label: 'حذف الحساب', icon: Trash2 },
]

function PasswordStrength({ password }: { password: string }) {
  let strength = 0
  if (password.length >= 6) strength++
  if (password.length >= 10) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  const labels = ['ضعيف جداً', 'ضعيف', 'متوسط', 'قوي', 'قوي جداً']
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981']
  const percent = (strength / 5) * 100
  if (password.length === 0) return null
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1"><span className="text-slate-500">قوة كلمة المرور</span><span style={{ color: colors[strength] }}>{labels[strength]}</span></div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full rounded-full" style={{ backgroundColor: colors[strength] }} transition={{ duration: 0.3 }} /></div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#2580eb]/30 ${checked ? 'bg-[#2580eb]' : 'bg-slate-200'}`}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const mounted = useIsClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const { user, updateUser, logout } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifications, setNotifications] = useState({ email: true, mobile: true, orders: true, offers: false })

  if (!mounted) return null

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = () => { setSaving(true); updateUser({ name, email, avatar }); setTimeout(() => setSaving(false), 1000) }

  const handleSavePassword = () => {
    setSaving(true)
    setTimeout(() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setSaving(false) }, 1000)
  }

  const handleDeleteAccount = () => { logout(); router.replace('/') }

  return (
    <div className="space-y-6">
      <PageHeader title="الإعدادات" subtitle="إدارة حسابك وتفضيلاتك" gradient />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1 shadow-sm">
            {tabs.map((tab) => (
              <motion.button key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#2580eb]/10 text-[#2580eb]' : 'text-slate-600 hover:bg-slate-50'}`}>
                <tab.icon size={18} />{tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card><CardHeader><h3 className="font-bold text-slate-900">الملف الشخصي</h3></CardHeader><CardContent>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">{avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : getInitials(name || 'مستخدم')}</div>
                      <div><button onClick={() => { const el = document.querySelector('input[type=file]') as HTMLInputElement; el?.click(); }} className="text-sm text-[#2580eb] hover:underline flex items-center gap-1.5"><Upload size={14} />تغيير الصورة</button></div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
                      <Input label="البريد الإلكتروني" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <Button variant="primary" size="md" loading={saving} onClick={handleSaveProfile} iconLeft={<Save size={16} />}>حفظ التغييرات</Button>
                  </div>
                </CardContent></Card>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card><CardHeader><div className="flex items-center gap-2"><Shield size={20} className="text-[#2580eb]" /><h3 className="font-bold text-slate-900">تغيير كلمة المرور</h3></div></CardHeader><CardContent>
                  <div className="space-y-5 max-w-md">
                    <Input label="كلمة المرور الحالية" isPassword value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    <div><Input label="كلمة المرور الجديدة" isPassword value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /><PasswordStrength password={newPassword} /></div>
                    <Input label="تأكيد كلمة المرور" isPassword value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={confirmPassword && newPassword !== confirmPassword ? 'كلمتا المرور غير متطابقتين' : undefined} />
                    <Button variant="primary" size="md" loading={saving} onClick={handleSavePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword} iconLeft={<Lock size={16} />}>تحديث كلمة المرور</Button>
                  </div>
                </CardContent></Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card><CardHeader><h3 className="font-bold text-slate-900">تفضيلات الإشعارات</h3></CardHeader><CardContent>
                  <div className="space-y-4">
                    {([
                      { key: 'email' as const, label: 'إشعارات البريد الإلكتروني', desc: 'تلقى إشعارات عبر البريد الإلكتروني' },
                      { key: 'mobile' as const, label: 'إشعارات الجوال', desc: 'تلقى إشعارات فورية على جهازك' },
                      { key: 'orders' as const, label: 'إشعارات الطلبات', desc: 'تلقى إشعارات عند تحديث حالة طلبك' },
                      { key: 'offers' as const, label: 'إشعارات العروض', desc: 'تلقى إشعارات العروض الخاصة والخصومات' },
                    ]).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                        <div><p className="text-sm font-medium text-slate-900">{item.label}</p><p className="text-xs text-slate-500 mt-0.5">{item.desc}</p></div>
                        <ToggleSwitch checked={notifications[item.key]} onChange={(val) => setNotifications((prev) => ({ ...prev, [item.key]: val }))} />
                      </div>
                    ))}
                  </div>
                </CardContent></Card>
              </motion.div>
            )}

            {activeTab === 'danger' && (
              <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card><CardHeader><h3 className="font-bold text-red-600">حذف الحساب</h3></CardHeader><CardContent>
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-700">تحذير خطير</p>
                        <p className="text-xs text-red-600 mt-1">حذف حسابك سيمسح جميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="danger" size="md" onClick={handleDeleteAccount} iconLeft={<Trash2 size={16} />}>حذف الحساب نهائياً</Button>
                </CardContent></Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
