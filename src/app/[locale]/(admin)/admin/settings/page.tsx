'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Phone,
  CreditCard,
  Mail,
  Save,
  Check,
  Image,
  X,
  Loader2,
  Search,
  Settings,
  Link2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

const textareaClass = cn(inputClass, 'resize-none');

type Tab = 'general' | 'contact' | 'seo' | 'social' | 'payment';

interface Settings {
  siteName: string;
  siteNameEn: string;
  siteDescription: string;
  siteDescriptionEn: string;
  logo: string;
  favicon: string;
  currency: string;
  currencySymbol: string;
  taxRate: string;
  phone: string;
  phoneEn: string;
  whatsapp: string;
  email: string;
  emailEn: string;
  address: string;
  addressEn: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  socialTwitter: string;
  socialInstagram: string;
  socialFacebook: string;
  socialLinkedin: string;
  socialYoutube: string;
}

const defaultSettings: Settings = {
  siteName: '',
  siteNameEn: '',
  siteDescription: '',
  siteDescriptionEn: '',
  logo: '',
  favicon: '',
  currency: 'SAR',
  currencySymbol: 'ر.س',
  taxRate: '15',
  phone: '',
  phoneEn: '',
  whatsapp: '',
  email: '',
  emailEn: '',
  address: '',
  addressEn: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  ogImage: '',
  twitterHandle: '',
  socialTwitter: '',
  socialInstagram: '',
  socialFacebook: '',
  socialLinkedin: '',
  socialYoutube: '',
};

const tabs: { key: Tab; label: string; icon: typeof Globe }[] = [
  { key: 'general', label: 'عام', icon: Settings },
  { key: 'contact', label: 'التواصل', icon: Phone },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'social', label: 'وسائل التواصل', icon: Link2 },
  { key: 'payment', label: 'الدفع', icon: CreditCard },
];

function SectionSaveButton({
  section,
  saved,
  onSave,
  saving,
}: {
  section: string;
  saved: Record<string, boolean>;
  saving: string;
  onSave: (s: string) => void;
}) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        size="sm"
        variant={saved[section] ? 'success' : 'primary'}
        iconLeft={
          saving === section ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved[section] ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )
        }
        onClick={() => onSave(section)}
        disabled={saving === section}
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
  uploading,
}: {
  label: string;
  preview: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  uploading?: boolean;
}) {
  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('files', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.files?.[0]?.url) {
        onUpload(data.files[0].url);
      }
    } catch {
      console.error('Upload failed');
    }
  };

  if (preview) {
    return (
      <div className="relative inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={label}
          className="w-32 h-32 object-contain rounded-xl border border-slate-200 dark:border-white/10"
        />
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
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <Loader2 size={28} className="mx-auto text-[#2580eb] mb-2 animate-spin" />
      ) : (
        <Image size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
      )}
      <p className="text-sm text-slate-500">{uploading ? 'جاري التحميل...' : 'اسحب هنا أو اضغط للتحميل'}</p>
      <p className="text-xs text-slate-400 mt-1">PNG, SVG, JPG (حد أقصى 2MB)</p>
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const update = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async (section: string) => {
    setSaving(section);
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaved((prev) => ({ ...prev, [section]: true }));
        setTimeout(() => setSaved((prev) => ({ ...prev, [section]: false })), 2000);
      }
    } catch {
      console.error('Failed to save');
    } finally {
      setSaving('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2580eb]" />
      </div>
    );
  }

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

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2580eb]/10 flex items-center justify-center">
                <Globe size={18} className="text-[#2580eb]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">المعلومات العامة</h3>
                <p className="text-xs text-slate-400">اسم الموقع والوصف والشعارات</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">اسم الموقع (عربي)</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => update({ siteName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">اسم الموقع (إنجليزي)</label>
                  <input
                    type="text"
                    value={settings.siteNameEn}
                    onChange={(e) => update({ siteNameEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">وصف الموقع (عربي)</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => update({ siteDescription: e.target.value })}
                    rows={3}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">وصف الموقع (إنجليزي)</label>
                  <textarea
                    value={settings.siteDescriptionEn}
                    onChange={(e) => update({ siteDescriptionEn: e.target.value })}
                    rows={3}
                    className={textareaClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">شعار الموقع</label>
                  <UploadArea
                    label="شعار الموقع"
                    preview={settings.logo}
                    onUpload={(url) => update({ logo: url })}
                    onRemove={() => update({ logo: '' })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الفايفICON</label>
                  <UploadArea
                    label="الفايفICON"
                    preview={settings.favicon}
                    onUpload={(url) => update({ favicon: url })}
                    onRemove={() => update({ favicon: '' })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">العملة</label>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => update({ currency: e.target.value })}
                    className={inputClass}
                    placeholder="SAR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">رمز العملة</label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={(e) => update({ currencySymbol: e.target.value })}
                    className={inputClass}
                    placeholder="ر.س"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">نسبة الضريبة (%)</label>
                  <input
                    type="text"
                    value={settings.taxRate}
                    onChange={(e) => update({ taxRate: e.target.value })}
                    className={inputClass}
                    placeholder="15"
                  />
                </div>
              </div>
              <SectionSaveButton section="general" saved={saved} onSave={handleSave} saving={saving} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'contact' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">رقم الهاتف (عربي)</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className={inputClass}
                    placeholder="+966112345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">رقم الهاتف (إنجليزي)</label>
                  <input
                    type="text"
                    value={settings.phoneEn}
                    onChange={(e) => update({ phoneEn: e.target.value })}
                    className={inputClass}
                    placeholder="+966112345678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">رقم الواتساب</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => update({ whatsapp: e.target.value })}
                  className={inputClass}
                  placeholder="+966500000000"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني (عربي)</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => update({ email: e.target.value })}
                    className={inputClass}
                    placeholder="info@almunjiz.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني (إنجليزي)</label>
                  <input
                    type="email"
                    value={settings.emailEn}
                    onChange={(e) => update({ emailEn: e.target.value })}
                    className={inputClass}
                    placeholder="info@almunjiz.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">العنوان (عربي)</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => update({ address: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">العنوان (إنجليزي)</label>
                  <input
                    type="text"
                    value={settings.addressEn}
                    onChange={(e) => update({ addressEn: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <SectionSaveButton section="contact" saved={saved} onSave={handleSave} saving={saving} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'seo' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Search size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">SEO & Meta Tags</h3>
                <p className="text-xs text-slate-400">إعدادات تحسين محركات البحث</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">عنوان Meta</label>
                <input
                  type="text"
                  value={settings.metaTitle}
                  onChange={(e) => update({ metaTitle: e.target.value })}
                  className={inputClass}
                  placeholder="Meta title for SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">وصف Meta</label>
                <textarea
                  value={settings.metaDescription}
                  onChange={(e) => update({ metaDescription: e.target.value })}
                  rows={3}
                  className={textareaClass}
                  placeholder="Meta description for SEO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">الكلمات المفتاحية</label>
                <input
                  type="text"
                  value={settings.keywords}
                  onChange={(e) => update({ keywords: e.target.value })}
                  className={inputClass}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">صورة Open Graph</label>
                <UploadArea
                  label="صورة Open Graph"
                  preview={settings.ogImage}
                  onUpload={(url) => update({ ogImage: url })}
                  onRemove={() => update({ ogImage: '' })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">حساب Twitter</label>
                <input
                  type="text"
                  value={settings.twitterHandle}
                  onChange={(e) => update({ twitterHandle: e.target.value })}
                  className={inputClass}
                  placeholder="@username"
                />
              </div>
              <SectionSaveButton section="seo" saved={saved} onSave={handleSave} saving={saving} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'social' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                <Link2 size={18} className="text-[#7c3aed]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">وسائل التواصل الاجتماعي</h3>
                <p className="text-xs text-slate-400">روابط حسابات التواصل الاجتماعي</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'socialTwitter' as const, label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
                { key: 'socialInstagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/username' },
                { key: 'socialFacebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/pagename' },
                { key: 'socialLinkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/name' },
                { key: 'socialYoutube' as const, label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{item.label}</label>
                  <input
                    type="url"
                    value={settings[item.key]}
                    onChange={(e) => update({ [item.key]: e.target.value })}
                    className={inputClass}
                    placeholder={item.placeholder}
                  />
                </div>
              ))}
              <SectionSaveButton section="social" saved={saved} onSave={handleSave} saving={saving} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'payment' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                <CreditCard size={18} className="text-[#7c3aed]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">بوابة الدفع</h3>
                <p className="text-xs text-slate-400">إدارة بوابات الدفع المعتمدة</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                لإدارة بوابات الدفع وتفعيلها أو تعطيلها، يُرجى الانتقال إلى صفحة إدارة بوابات الدفع.
              </p>
              <Link href="/admin/gateways">
                <Button
                  variant="primary"
                  iconRight={<FileText size={16} />}
                >
                  الانتقال إلى بوابات الدفع
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
