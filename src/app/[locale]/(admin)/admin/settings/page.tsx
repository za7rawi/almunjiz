'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Shield,
  Bell,
  Database,
  Download,
  TestTube,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

const textareaClass = cn(inputClass, 'resize-none');

type Tab = 'general' | 'account' | 'email' | 'payment' | 'seo' | 'notifications' | 'backup';

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
  emailNotifications: string;
  orderNotifications: string;
  paymentNotifications: string;
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
  emailNotifications: 'true',
  orderNotifications: 'true',
  paymentNotifications: 'true',
};

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              'flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm min-w-[300px]',
              toast.type === 'success' && 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700',
              toast.type === 'error' && 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700',
              toast.type === 'info' && 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
            {toast.type === 'error' && <XCircle size={18} className="text-red-500" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-500" />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="mr-auto text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Globe;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function UploadArea({
  label,
  preview,
  onUpload,
  onRemove,
  uploading,
  isAr,
}: {
  label: string;
  preview: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  uploading?: boolean;
  isAr: boolean;
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
      <p className="text-sm text-slate-500">{uploading ? (isAr ? 'جاري التحميل...' : 'Uploading...') : (isAr ? 'اسحب هنا أو اضغط للتحميل' : 'Drag here or click to upload')}</p>
      <p className="text-xs text-slate-400 mt-1">{isAr ? 'PNG, SVG, JPG (حد أقصى 2MB)' : 'PNG, SVG, JPG (max 2MB)'}</p>
    </label>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const [testingGateways, setTestingGateways] = useState(false);
  const [gatewayResults, setGatewayResults] = useState<{ total: number; passed: number; partial: number; failed: number } | null>(null);

  const [backupCounts, setBackupCounts] = useState<Record<string, number> | null>(null);
  const [exportingBackup, setExportingBackup] = useState(false);

  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const tabs: { key: Tab; label: string; icon: typeof Globe; color: string }[] = [
    { key: 'general', label: isAr ? 'عام' : 'General', icon: Settings, color: '#2580eb' },
    { key: 'account', label: isAr ? 'الحساب' : 'Account', icon: Shield, color: '#ef4444' },
    { key: 'email', label: isAr ? 'البريد الإلكتروني' : 'Email', icon: Mail, color: '#14b8a6' },
    { key: 'payment', label: isAr ? 'الدفع' : 'Payment', icon: CreditCard, color: '#7c3aed' },
    { key: 'seo', label: 'SEO', icon: Search, color: '#f59e0b' },
    { key: 'notifications', label: isAr ? 'الإشعارات' : 'Notifications', icon: Bell, color: '#06b6d4' },
    { key: 'backup', label: isAr ? 'النسخ الاحتياطي' : 'Backup', icon: Database, color: '#8b5cf6' },
  ];

  const toastTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    toastTimerRef.current.push(timer);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      toastTimerRef.current.forEach(clearTimeout);
    };
  }, [hasUnsavedChanges]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        const merged = { ...defaultSettings, ...data.data };
        setSettings(merged);
        setOriginalSettings(merged);
      }
    } catch {
      addToast('error', isAr ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
    }
  }, [addToast, isAr]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const update = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
    setHasUnsavedChanges(true);
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
        setOriginalSettings(settings);
        setHasUnsavedChanges(false);
        addToast('success', isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
        setTimeout(() => setSaved((prev) => ({ ...prev, [section]: false })), 2000);
      } else {
        addToast('error', data.error || (isAr ? 'فشل حفظ الإعدادات' : 'Failed to save settings'));
      }
    } catch {
      addToast('error', isAr ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving');
    } finally {
      setSaving('');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      addToast('error', isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 8) {
      addToast('error', isAr ? 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' : 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('error', isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast('error', data.error || (isAr ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
      }
    } catch {
      addToast('error', isAr ? 'حدث خطأ أثناء تغيير كلمة المرور' : 'An error occurred while changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      addToast('error', isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', isAr ? 'تم إرسال البريد التجريبي بنجاح' : 'Test email sent successfully');
      } else {
        addToast('error', data.error || (isAr ? 'فشل إرسال البريد' : 'Failed to send email'));
      }
    } catch {
      addToast('error', isAr ? 'حدث خطأ أثناء إرسال البريد' : 'An error occurred while sending email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleTestGateways = async () => {
    setTestingGateways(true);
    setGatewayResults(null);
    try {
      const res = await fetch('/api/admin/gateways/dummy/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (data.success && data.data?.summary) {
        setGatewayResults(data.data.summary);
        const { passed, failed } = data.data.summary;
        if (failed === 0) {
          addToast('success', isAr ? `جميع بوابات الدفع تعمل بشكل صحيح (${passed} نشطة)` : `All payment gateways working (${passed} active)`);
        } else {
          addToast('error', isAr ? `بعض بوابات الدفع لا تعمل (${failed} فاشلة)` : `Some payment gateways failing (${failed} failed)`);
        }
      } else {
        addToast('error', data.error || (isAr ? 'فشل اختبار بوابات الدفع' : 'Failed to test payment gateways'));
      }
    } catch {
      addToast('error', isAr ? 'حدث خطأ أثناء اختبار بوابات الدفع' : 'An error occurred while testing gateways');
    } finally {
      setTestingGateways(false);
    }
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      const res = await fetch('/api/admin/settings/backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `almunjiz-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('success', isAr ? 'تم تحميل النسخة الاحتياطية بنجاح' : 'Backup downloaded successfully');
      } else {
        addToast('error', isAr ? 'فشل تحميل النسخة الاحتياطية' : 'Failed to download backup');
      }
    } catch {
      addToast('error', isAr ? 'حدث خطأ أثناء تحميل النسخة الاحتياطية' : 'An error occurred while downloading backup');
    } finally {
      setExportingBackup(false);
    }
  };

  const handleDiscardChanges = () => {
    setSettings(originalSettings);
    setHasUnsavedChanges(false);
    addToast('info', isAr ? 'تم تجاهل التغييرات' : 'Changes discarded');
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
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title={isAr ? 'إعدادات الموقع' : 'Site Settings'}
        subtitle={isAr ? 'إدارة جميع إعدادات المنصة' : 'Manage all platform settings'}
        gradient
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'الإعدادات' : 'Settings' },
        ]}
      />

      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {isAr ? 'لديك تغييرات غير محفوظة' : 'You have unsaved changes'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscardChanges}
              className="text-amber-600 hover:text-amber-700"
            >
              {isAr ? 'تجاهل' : 'Discard'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleSave(activeTab)}
              disabled={!!saving}
            >
              {isAr ? 'حفظ الآن' : 'Save Now'}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (!confirm(isAr ? 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟' : 'You have unsaved changes. Do you want to continue?')) return;
                  setHasUnsavedChanges(false);
                }
                setActiveTab(tab.key);
              }}
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
          <SectionCard title={isAr ? 'المعلومات العامة' : 'General Information'} subtitle={isAr ? 'اسم الموقع والوصف والشعارات' : 'Site name, description and logos'} icon={Globe} color="#2580eb">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}</label>
                <input type="text" value={settings.siteName} onChange={(e) => update({ siteName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}</label>
                <input type="text" value={settings.siteNameEn} onChange={(e) => update({ siteNameEn: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'وصف الموقع (عربي)' : 'Site Description (Arabic)'}</label>
                <textarea value={settings.siteDescription} onChange={(e) => update({ siteDescription: e.target.value })} rows={3} className={textareaClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'وصف الموقع (إنجليزي)' : 'Site Description (English)'}</label>
                <textarea value={settings.siteDescriptionEn} onChange={(e) => update({ siteDescriptionEn: e.target.value })} rows={3} className={textareaClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'شعار الموقع' : 'Site Logo'}</label>
                <UploadArea label={isAr ? 'شعار الموقع' : 'Site Logo'} preview={settings.logo} onUpload={(url) => update({ logo: url })} onRemove={() => update({ logo: '' })} isAr={isAr} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'الأيقونة المفضلة' : 'Favicon'}</label>
                <UploadArea label={isAr ? 'الأيقونة المفضلة' : 'Favicon'} preview={settings.favicon} onUpload={(url) => update({ favicon: url })} onRemove={() => update({ favicon: '' })} isAr={isAr} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'العملة' : 'Currency'}</label>
                <input type="text" value={settings.currency} onChange={(e) => update({ currency: e.target.value })} className={inputClass} placeholder="SAR" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'رمز العملة' : 'Currency Symbol'}</label>
                <input type="text" value={settings.currencySymbol} onChange={(e) => update({ currencySymbol: e.target.value })} className={inputClass} placeholder="ر.س" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}</label>
                <input type="text" value={settings.taxRate} onChange={(e) => update({ taxRate: e.target.value })} className={inputClass} placeholder="15" />
              </div>
            </div>

            <CardHeader className="mt-6 flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center">
                <Phone size={18} className="text-[#14b8a6]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'معلومات التواصل' : 'Contact Information'}</h3>
                <p className="text-xs text-slate-400">{isAr ? 'بيانات التواصل والعنوان' : 'Contact details and address'}</p>
              </div>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'رقم الهاتف (عربي)' : 'Phone Number (Arabic)'}</label>
                <input type="text" value={settings.phone} onChange={(e) => update({ phone: e.target.value })} className={inputClass} placeholder="+966112345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'رقم الهاتف (إنجليزي)' : 'Phone Number (English)'}</label>
                <input type="text" value={settings.phoneEn} onChange={(e) => update({ phoneEn: e.target.value })} className={inputClass} placeholder="+966112345678" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'رقم الواتساب' : 'WhatsApp Number'}</label>
              <input type="text" value={settings.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} className={inputClass} placeholder="+966500000000" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'البريد الإلكتروني (عربي)' : 'Email (Arabic)'}</label>
                <input type="email" value={settings.email} onChange={(e) => update({ email: e.target.value })} className={inputClass} placeholder="info@almunjiz.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'البريد الإلكتروني (إنجليزي)' : 'Email (English)'}</label>
                <input type="email" value={settings.emailEn} onChange={(e) => update({ emailEn: e.target.value })} className={inputClass} placeholder="info@almunjiz.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'العنوان (عربي)' : 'Address (Arabic)'}</label>
                <input type="text" value={settings.address} onChange={(e) => update({ address: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'العنوان (إنجليزي)' : 'Address (English)'}</label>
                <input type="text" value={settings.addressEn} onChange={(e) => update({ addressEn: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                size="sm"
                variant={saved['general'] ? 'success' : 'primary'}
                iconLeft={
                  saving === 'general' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved['general'] ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )
                }
                onClick={() => handleSave('general')}
                disabled={saving === 'general'}
              >
                {saved['general'] ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ جميع التغييرات' : 'Save All Changes')}
              </Button>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {activeTab === 'account' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard
            title={isAr ? 'الأمان وكلمة المرور' : 'Security & Password'}
            subtitle={isAr ? 'تغيير كلمة المرور وإعدادات الحساب' : 'Change password and account settings'}
            icon={Shield}
            color="#ef4444"
          >
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={cn(inputClass, 'pr-10')}
                      placeholder={isAr ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={cn(inputClass, 'pr-10')}
                      placeholder={isAr ? '8 أحرف على الأقل' : 'At least 8 characters'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder={isAr ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  size="sm"
                  variant="primary"
                  iconLeft={changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                  onClick={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {changingPassword ? (isAr ? 'جاري التغيير...' : 'Changing...') : (isAr ? 'تغيير كلمة المرور' : 'Change Password')}
                </Button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {activeTab === 'email' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title={isAr ? 'إعدادات البريد الإلكتروني' : 'Email Settings'} subtitle={isAr ? 'اختبار إرسال البريد وعرض الإعدادات' : 'Test email sending and view settings'} icon={Mail} color="#14b8a6">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'إعدادات SMTP' : 'SMTP Settings'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{isAr ? 'الخدمة' : 'Service'}</label>
                  <div className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300">
                    Resend
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{isAr ? 'المرسل' : 'Sender'}</label>
                  <div className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300">
                    noreply@munjiz.store
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{isAr ? 'متصل ونشط' : 'Connected & Active'}</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-3">
                <TestTube size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{isAr ? 'اختبار إرسال البريد' : 'Test Email Sending'}</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                {isAr ? 'أرسل بريداً إلكترونياً تجريبياً للتأكد من أن إعدادات البريد تعمل بشكل صحيح.' : 'Send a test email to verify that email settings are working correctly.'}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className={cn(inputClass, 'flex-1')}
                  placeholder="your@email.com"
                />
                <Button
                  size="sm"
                  variant="primary"
                  iconLeft={sendingTest ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                  onClick={handleTestEmail}
                  disabled={sendingTest || !testEmail}
                >
                  {sendingTest ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال تجريبي' : 'Send Test')}
                </Button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {activeTab === 'payment' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title={isAr ? 'إعدادات الدفع' : 'Payment Settings'} subtitle={isAr ? 'إدارة واختبار بوابات الدفع' : 'Manage and test payment gateways'} icon={CreditCard} color="#7c3aed">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/admin/gateways" className="flex-1">
                <Card glass className="cursor-pointer hover:border-[#7c3aed]/50 transition-colors h-full">
                  <CardContent className="flex items-center gap-4 pt-4">
                    <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                      <CreditCard size={24} className="text-[#7c3aed]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{isAr ? 'إدارة بوابات الدفع' : 'Manage Payment Gateways'}</h4>
                      <p className="text-xs text-slate-400">{isAr ? 'إضافة وتعديل وحذف بوابات الدفع' : 'Add, edit and delete payment gateways'}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <div className="flex-1">
                <Card glass className="h-full">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <TestTube size={16} className="text-[#7c3aed]" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'اختبار الاتصال' : 'Connection Test'}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr ? 'اختبار جميع بوابات الدفع النشطة للتأكد من أنها تعمل بشكل صحيح.' : 'Test all active payment gateways to ensure they are working correctly.'}
                    </p>
                    <Button
                      size="sm"
                      variant="primary"
                      iconLeft={testingGateways ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      onClick={handleTestGateways}
                      disabled={testingGateways}
                    >
                      {testingGateways ? (isAr ? 'جاري الاختبار...' : 'Testing...') : (isAr ? 'اختبار جميع البوابات' : 'Test All Gateways')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {gatewayResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5"
              >
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{isAr ? 'نتائج الاختبار' : 'Test Results'}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{gatewayResults.total}</div>
                    <div className="text-xs text-slate-400">{isAr ? 'المجموع' : 'Total'}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{gatewayResults.passed}</div>
                    <div className="text-xs text-emerald-500">{isAr ? 'ناجحة' : 'Passed'}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{gatewayResults.partial}</div>
                    <div className="text-xs text-amber-500">{isAr ? 'جزئية' : 'Partial'}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{gatewayResults.failed}</div>
                    <div className="text-xs text-red-500">{isAr ? 'فاشلة' : 'Failed'}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </SectionCard>
        </motion.div>
      )}

      {activeTab === 'seo' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title={isAr ? 'تحسين محركات البحث (SEO)' : 'Search Engine Optimization (SEO)'} subtitle={isAr ? 'إعدادات Meta Tags وتحسين الظهور' : 'Meta Tags settings and visibility optimization'} icon={Search} color="#f59e0b">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'عنوان Meta' : 'Meta Title'}</label>
              <input type="text" value={settings.metaTitle} onChange={(e) => update({ metaTitle: e.target.value })} className={inputClass} placeholder={isAr ? 'عنوان الصفحة في نتائج البحث' : 'Page title in search results'} />
              <p className="text-xs text-slate-400 mt-1">{settings.metaTitle.length}/60 {isAr ? 'حرف' : 'chars'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'وصف Meta' : 'Meta Description'}</label>
              <textarea value={settings.metaDescription} onChange={(e) => update({ metaDescription: e.target.value })} rows={3} className={textareaClass} placeholder={isAr ? 'وصف الصفحة في نتائج البحث' : 'Page description in search results'} />
              <p className="text-xs text-slate-400 mt-1">{settings.metaDescription.length}/160 {isAr ? 'حرف' : 'chars'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الكلمات المفتاحية' : 'Keywords'}</label>
              <input type="text" value={settings.keywords} onChange={(e) => update({ keywords: e.target.value })} className={inputClass} placeholder={isAr ? 'كلمة1, كلمة2, كلمة3' : 'keyword1, keyword2, keyword3'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isAr ? 'صورة Open Graph' : 'Open Graph Image'}</label>
              <UploadArea label={isAr ? 'صورة Open Graph' : 'Open Graph Image'} preview={settings.ogImage} onUpload={(url) => update({ ogImage: url })} onRemove={() => update({ ogImage: '' })} isAr={isAr} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'حساب Twitter' : 'Twitter Account'}</label>
              <input type="text" value={settings.twitterHandle} onChange={(e) => update({ twitterHandle: e.target.value })} className={inputClass} placeholder="@username" />
            </div>

            <CardHeader className="mt-6 flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                <Link2 size={18} className="text-[#7c3aed]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{isAr ? 'وسائل التواصل الاجتماعي' : 'Social Media'}</h3>
                <p className="text-xs text-slate-400">{isAr ? 'روابط حسابات التواصل الاجتماعي' : 'Social media account links'}</p>
              </div>
            </CardHeader>
            {[
              { key: 'socialTwitter' as const, label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
              { key: 'socialInstagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/username' },
              { key: 'socialFacebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/pagename' },
              { key: 'socialLinkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/company/name' },
              { key: 'socialYoutube' as const, label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{item.label}</label>
                <input type="url" value={settings[item.key]} onChange={(e) => update({ [item.key]: e.target.value })} className={inputClass} placeholder={item.placeholder} />
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button
                size="sm"
                variant={saved['seo'] ? 'success' : 'primary'}
                iconLeft={
                  saving === 'seo' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved['seo'] ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )
                }
                onClick={() => handleSave('seo')}
                disabled={saving === 'seo'}
              >
                {saved['seo'] ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
              </Button>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title={isAr ? 'إعدادات الإشعارات' : 'Notification Settings'} subtitle={isAr ? 'إدارة إشعارات البريد الإلكتروني' : 'Manage email notifications'} icon={Bell} color="#06b6d4">
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications' as const,
                  label: isAr ? 'إشعارات البريد الإلكتروني' : 'Email Notifications',
                  description: isAr ? 'إرسال إشعارات عبر البريد الإلكتروني للأحداث المهمة' : 'Send email notifications for important events',
                },
                {
                  key: 'orderNotifications' as const,
                  label: isAr ? 'إشعارات الطلبات' : 'Order Notifications',
                  description: isAr ? 'إشعار عند إنشاء طلب جديد أو تحديث حالته' : 'Notify when a new order is created or its status is updated',
                },
                {
                  key: 'paymentNotifications' as const,
                  label: isAr ? 'إشعارات الدفع' : 'Payment Notifications',
                  description: isAr ? 'إشعار عند استلام الدفع أو فشل عملية الدفع' : 'Notify when payment is received or a payment fails',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-slate-400" />
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</h4>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => update({ [item.key]: settings[item.key] === 'true' ? 'false' : 'true' })}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      settings[item.key] === 'true' ? 'bg-[#2580eb]' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                        settings[item.key] === 'true' ? 'right-0.5' : 'right-[22px]'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                size="sm"
                variant={saved['notifications'] ? 'success' : 'primary'}
                iconLeft={
                  saving === 'notifications' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved['notifications'] ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )
                }
                onClick={() => handleSave('notifications')}
                disabled={saving === 'notifications'}
              >
                {saved['notifications'] ? (isAr ? 'تم الحفظ ✓' : 'Saved ✓') : (isAr ? 'حفظ' : 'Save')}
              </Button>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {activeTab === 'backup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionCard title={isAr ? 'النسخ الاحتياطي' : 'Backup'} subtitle={isAr ? 'تصدير نسخة احتياطية من جميع البيانات' : 'Export a backup of all data'} icon={Database} color="#8b5cf6">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'تصدير البيانات' : 'Export Data'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? ' سيتم تصدير جميع بيانات المنصة كملف JSON يحتوي على: الإعدادات، الخدمات، الطلبات، الفواتير، المدفوعات، المستخدمين، بوابات الدفع، المحتوى، والإشعارات.' : 'All platform data will be exported as a JSON file containing: settings, services, orders, invoices, payments, users, payment gateways, content, and notifications.'}
              </p>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  iconLeft={exportingBackup ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  onClick={handleExportBackup}
                  disabled={exportingBackup}
                >
                  {exportingBackup ? (isAr ? 'جاري التصدير...' : 'Exporting...') : (isAr ? 'تحميل النسخة الاحتياطية' : 'Download Backup')}
                </Button>
              </div>

              {backupCounts && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(backupCounts).map(([key, count]) => (
                    <div key={key} className="text-center p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{count}</div>
                      <div className="text-xs text-slate-400">{key}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">{isAr ? 'ملاحظة أمنية' : 'Security Note'}</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {isAr ? 'النسخة الاحتياطية تحتوي على جميع بيانات المنصة بما في ذلك كلمات المرور المشفرة. يُرجى حفظ الملف في مكان آمن وعدم مشاركته.' : 'The backup contains all platform data including encrypted passwords. Please store the file securely and do not share it.'}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}
    </div>
  );
}
