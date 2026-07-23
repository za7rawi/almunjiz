'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Phone,
  Clock,
  CreditCard,
  Key,
  Mail,
  Bell,
  Save,
  Check,
  MessageSquare,
  Send,
  Image,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useAdminCMSStore } from '@/store/admin-cms-store';
import { cn } from '@/lib/utils';

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <motion.button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
      checked ? 'bg-[#2580eb]' : 'bg-slate-300 dark:bg-slate-600'
    )}
  >
    <motion.div
      animate={{ x: checked ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
    />
  </motion.button>
);

function SectionSaveButton({ section, saved, onSave }: { section: string; saved: Record<string, boolean>; onSave: (s: string) => void }) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        size="sm"
        variant={saved[section] ? 'success' : 'primary'}
        iconLeft={saved[section] ? <Check size={14} /> : <Save size={14} />}
        onClick={() => onSave(section)}
      >
        {saved[section] ? 'تم الحفظ ✓' : 'حفظ'}
      </Button>
    </div>
  );
}

function UploadArea({
  label,
  preview,
  onUpload,
  onRemove,
}: {
  label: string;
  preview: string;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (preview) {
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={label} className="w-32 h-32 object-contain rounded-xl border border-slate-200 dark:border-white/10" />
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <label className="block border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center hover:border-[#2580eb]/50 transition-colors cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Image size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-sm text-slate-500">اسحب هنا أو اضغط للتحميل</p>
      <p className="text-xs text-slate-400 mt-1">PNG, SVG, JPG (حد أقصى 2MB)</p>
    </label>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useAdminCMSStore();
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const handleSave = (section: string) => {
    setSaved((prev) => ({ ...prev, [section]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [section]: false })), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات الموقع"
        subtitle="إدارة جميع إعدادات المنصة"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'الإعدادات' },
        ]}
      />

      {/* General Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2580eb]/10 flex items-center justify-center">
              <Globe size={18} className="text-[#2580eb]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">المعلومات العامة</h3>
              <p className="text-xs text-slate-400">معلومات الموقع الأساسية</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">اسم الموقع (عربي)</label>
                <input
                  type="text"
                  value={settings.siteNameAr}
                  onChange={(e) => updateSettings({ siteNameAr: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">اسم الموقع (إنجليزي)</label>
                <input
                  type="text"
                  value={settings.siteNameEn}
                  onChange={(e) => updateSettings({ siteNameEn: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">وصف الموقع</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => updateSettings({ siteDescription: e.target.value })}
                rows={3}
                className={cn(inputClass, 'resize-none')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">شعار الموقع</label>
                <UploadArea
                  label="شعار الموقع"
                  preview={settings.logo}
                  onUpload={(dataUrl) => updateSettings({ logo: dataUrl })}
                  onRemove={() => updateSettings({ logo: '' })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">فايفICON</label>
                <UploadArea
                  label="فايفICON"
                  preview={settings.favicon}
                  onUpload={(dataUrl) => updateSettings({ favicon: dataUrl })}
                  onRemove={() => updateSettings({ favicon: '' })}
                />
              </div>
            </div>
            <SectionSaveButton section="general" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center">
              <Phone size={18} className="text-[#14b8a6]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">معلومات التواصل</h3>
              <p className="text-xs text-slate-400">بيانات التواصل والعنوان</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">رقم الواتساب</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => updateSettings({ whatsapp: e.target.value })}
                  className={inputClass}
                  placeholder="+966500000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">رقم الهاتف</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                  className={inputClass}
                  placeholder="+966112345678"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
                className={inputClass}
                placeholder="info@almunjiz.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">العنوان</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateSettings({ address: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">ساعات العمل</label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => updateSettings({ workingHours: e.target.value })}
                className={inputClass}
                placeholder="السبت - الخميس: 9 ص - 9 م"
              />
            </div>
            <SectionSaveButton section="contact" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Homepage Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">إحصائيات الصفحة الرئيسية</h3>
              <p className="text-xs text-slate-400">الأرقام المعروضة في الصفحة الرئيسية</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">إجمالي الطلبات</label>
                <input
                  type="text"
                  value={settings.totalOrdersDisplay}
                  onChange={(e) => updateSettings({ totalOrdersDisplay: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">إجمالي الإيرادات</label>
                <input
                  type="text"
                  value={settings.totalRevenueDisplay}
                  onChange={(e) => updateSettings({ totalRevenueDisplay: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">عدد العملاء النشطين</label>
                <input
                  type="text"
                  value={settings.activeCustomersDisplay}
                  onChange={(e) => updateSettings({ activeCustomersDisplay: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">الطلبات الجديدة</label>
                <input
                  type="text"
                  value={settings.newOrdersDisplay}
                  onChange={(e) => updateSettings({ newOrdersDisplay: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <SectionSaveButton section="stats" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Methods */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
              <CreditCard size={18} className="text-[#7c3aed]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">وسائل الدفع</h3>
              <p className="text-xs text-slate-400">تفعيل أو تعطيل وسائل الدفع</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'paymentMada', label: 'مدى' },
              { key: 'paymentVisa', label: 'فيزا / ماستركارد' },
              { key: 'paymentMastercard', label: 'ماستركارد' },
              { key: 'paymentApplePay', label: 'آبل باي' },
              { key: 'paymentBankTransfer', label: 'تحويل بنكي' },
            ].map((method) => (
              <div
                key={method.key}
                className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-white/5 last:border-0"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{method.label}</span>
                <Toggle
                  checked={settings[method.key as keyof typeof settings] as boolean}
                  onChange={(v) => updateSettings({ [method.key]: v })}
                />
              </div>
            ))}
            <SectionSaveButton section="payment" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>

      {/* OTP Provider */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center">
              <Key size={18} className="text-[#14b8a6]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">مزود OTP</h3>
              <p className="text-xs text-slate-400">إعدادات مزود الرسائل القصيرة</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">مزود الخدمة</label>
              <select
                value={settings.otpProvider}
                onChange={(e) => updateSettings({ otpProvider: e.target.value })}
                className={inputClass}
              >
                <option value="unifonic">Unifonic</option>
                <option value="taqnyat">Taqnyat</option>
                <option value="twilio">Twilio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">مفتاح API</label>
              <input
                type="password"
                value={settings.otpApiKey}
                onChange={(e) => updateSettings({ otpApiKey: e.target.value })}
                placeholder="••••••••••••••••"
                className={inputClass}
              />
            </div>
            <SectionSaveButton section="otp" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>

      {/* SMTP */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2580eb]/10 flex items-center justify-center">
              <Mail size={18} className="text-[#2580eb]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">البريد الإلكتروني (SMTP)</h3>
              <p className="text-xs text-slate-400">إعداد الخادم للرسائل الإلكترونية</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => updateSettings({ smtpHost: e.target.value })}
                  placeholder="smtp.example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">المنفذ</label>
                <input
                  type="text"
                  value={settings.smtpPort}
                  onChange={(e) => updateSettings({ smtpPort: e.target.value })}
                  placeholder="587"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">اسم المستخدم</label>
              <input
                type="text"
                value={settings.smtpUsername}
                onChange={(e) => updateSettings({ smtpUsername: e.target.value })}
                placeholder="user@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => updateSettings({ smtpPassword: e.target.value })}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <SectionSaveButton section="smtp" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Bell size={18} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">الإشعارات</h3>
              <p className="text-xs text-slate-400">تفعيل أو تعطيل قنوات الإشعارات</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'notifySms', label: 'رسائل نصية', icon: MessageSquare, color: '#14b8a6' },
              { key: 'notifyEmail', label: 'بريد إلكتروني', icon: Mail, color: '#2580eb' },
              { key: 'notifyWhatsapp', label: 'واتساب', icon: Send, color: '#25c060' },
              { key: 'notifyPush', label: 'إشعارات فورية', icon: Bell, color: '#7c3aed' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <Toggle
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={(v) => updateSettings({ [item.key]: v })}
                />
              </div>
            ))}
            <SectionSaveButton section="notifications" saved={saved} onSave={handleSave} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
