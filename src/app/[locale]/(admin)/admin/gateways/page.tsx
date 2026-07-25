'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CreditCard,
  Globe,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  Zap,
  Search,
  Shield,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  XCircle,
  Settings,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { cn } from '@/lib/utils';

type GatewayProvider = 'tap' | 'moyasar' | 'hyperpay' | 'paytabs' | 'myfatoorah' | 'stripe' | 'edfapay' | 'tamara' | 'tabby' | 'custom';

interface PaymentGatewayConfig {
  id: string;
  name: string;
  nameEn: string;
  provider: GatewayProvider;
  publicKey: string;
  secretKey: string;
  merchantId?: string;
  webhookSecret?: string;
  apiEndpoint?: string;
  environment: 'sandbox' | 'production';
  callbackUrl?: string;
  webhookUrl?: string;
  currency: string;
  supportedCountries: string[];
  supportedCurrencies: string[];
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  supportsApplePay: boolean;
  supportsGooglePay: boolean;
  supportsInstallments: boolean;
  description?: string;
  logo?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

const PROVIDER_COLORS: Record<GatewayProvider, { bg: string; text: string; label: string; labelEn: string }> = {
  tap: { bg: 'bg-blue-100 text-blue-700', text: 'text-blue-600', label: 'تيب', labelEn: 'Tap' },
  moyasar: { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600', label: 'موياسر', labelEn: 'Moyasar' },
  hyperpay: { bg: 'bg-purple-100 text-purple-700', text: 'text-purple-600', label: 'هايبر باي', labelEn: 'HyperPay' },
  paytabs: { bg: 'bg-orange-100 text-orange-700', text: 'text-orange-600', label: 'بايتابس', labelEn: 'PayTabs' },
  myfatoorah: { bg: 'bg-teal-100 text-teal-700', text: 'text-teal-600', label: 'ميفاتورة', labelEn: 'MyFatoorah' },
  stripe: { bg: 'bg-violet-100 text-violet-700', text: 'text-violet-600', label: 'سترايب', labelEn: 'Stripe' },
  edfapay: { bg: 'bg-cyan-100 text-cyan-700', text: 'text-cyan-600', label: 'ادفع باي', labelEn: 'EdfaPay' },
  tamara: { bg: 'bg-pink-100 text-pink-700', text: 'text-pink-600', label: 'تمارا', labelEn: 'Tamara' },
  tabby: { bg: 'bg-yellow-100 text-yellow-700', text: 'text-yellow-600', label: 'تابي', labelEn: 'Tabby' },
  custom: { bg: 'bg-slate-100 text-slate-700', text: 'text-slate-600', label: 'مخصص', labelEn: 'Custom' },
};

const CURRENCIES = ['SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'EGP', 'USD', 'EUR', 'GBP'];
const COUNTRIES = ['SA', 'AE', 'KW', 'BH', 'QA', 'OM', 'EG', 'JO', 'LB', 'IQ', 'US', 'GB'];

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function emptyGateway(): Omit<PaymentGatewayConfig, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    nameEn: '',
    provider: 'tap',
    publicKey: '',
    secretKey: '',
    merchantId: '',
    webhookSecret: '',
    environment: 'sandbox',
    callbackUrl: '',
    webhookUrl: '',
    currency: 'SAR',
    supportedCountries: [],
    supportedCurrencies: ['SAR'],
    isActive: true,
    isDefault: false,
    sortOrder: 0,
    supportsApplePay: false,
    supportsGooglePay: false,
    supportsInstallments: false,
  };
}

export default function GatewaysPage() {
  const { language } = useLanguageStore();
  const { isRtl } = useDirection();
  const isAr = language === 'ar';

  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGatewayConfig | null>(null);
  const [form, setForm] = useState(emptyGateway());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSecretKeys, setShowSecretKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fetchGateways = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/gateways');
      const data = await res.json();
      if (data.success) setGateways(data.data);
    } catch {
      addToast('error', isAr ? 'فشل تحميل البوابات' : 'Failed to load gateways');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);

  const filteredGateways = gateways.filter((gw) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      gw.name.toLowerCase().includes(q) ||
      (gw.nameEn || gw.name).toLowerCase().includes(q) ||
      gw.provider.toLowerCase().includes(q) ||
      (gw.supportedCurrencies || ['SAR']).some(c => c.toLowerCase().includes(q))
    );
  });

  const openAddModal = () => {
    setEditingGateway(null);
    setForm(emptyGateway());
    setShowModal(true);
  };

  const openEditModal = (gw: PaymentGatewayConfig) => {
    setEditingGateway(gw);
    setForm({
      name: gw.name,
      nameEn: gw.nameEn,
      provider: gw.provider,
      publicKey: gw.publicKey || '',
      secretKey: gw.secretKey || '',
      merchantId: gw.merchantId || '',
      webhookSecret: gw.webhookSecret || '',
      environment: gw.environment,
      callbackUrl: gw.callbackUrl || '',
      webhookUrl: gw.webhookUrl || '',
      currency: (gw.supportedCurrencies || ['SAR'])[0],
      supportedCountries: [...gw.supportedCountries],
      supportedCurrencies: [...(gw.supportedCurrencies || ['SAR'])],
      isActive: gw.isActive,
      isDefault: gw.isDefault,
      sortOrder: gw.sortOrder || 0,
      supportsApplePay: gw.supportsApplePay || false,
      supportsGooglePay: gw.supportsGooglePay || false,
      supportsInstallments: gw.supportsInstallments || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.nameEn.trim()) {
      addToast('error', isAr ? 'يرجى إدخال اسم البوابة' : 'Gateway name is required');
      return;
    }
    if (!form.secretKey.trim()) {
      addToast('error', isAr ? 'يرجى إدخال المفتاح السري' : 'Secret key is required');
      return;
    }

    const slug = form.nameEn.toLowerCase().replace(/\s+/g, '-');
    const payload = {
      name: form.name,
      displayName: form.name,
      displayNameEn: form.nameEn,
      slug,
      provider: form.provider.toUpperCase(),
      publicKey: form.publicKey,
      secretKey: form.secretKey,
      merchantId: form.merchantId || undefined,
      webhookSecret: form.webhookSecret || undefined,
      environment: form.environment.toUpperCase(),
      isActive: form.isActive,
      isDefault: form.isDefault,
      supportedCurrencies: [form.currency],
      supportedCountries: form.supportedCountries,
    };

    try {
      if (editingGateway) {
        const res = await fetch(`/api/admin/gateways/${editingGateway.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          addToast('success', isAr ? 'تم تحديث البوابة بنجاح' : 'Gateway updated successfully');
          fetchGateways();
        } else {
          addToast('error', data.error || 'Failed to update gateway');
        }
      } else {
        const res = await fetch('/api/admin/gateways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          addToast('success', isAr ? 'تم إضافة البوابة بنجاح' : 'Gateway added successfully');
          fetchGateways();
        } else {
          addToast('error', data.error || 'Failed to add gateway');
        }
      }
      setShowModal(false);
    } catch {
      addToast('error', isAr ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gateways/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('success', isAr ? 'تم حذف البوابة' : 'Gateway deleted');
        fetchGateways();
      }
    } catch {
      addToast('error', isAr ? 'فشل الحذف' : 'Failed to delete');
    }
    setShowDeleteConfirm(null);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/admin/gateways/${id}/test`, { method: 'POST' });
      const data = await res.json();
      addToast(data.data?.success ? 'success' : 'error', data.data?.message || 'Test completed');
    } catch {
      addToast('error', isAr ? 'فشل اختبار الاتصال' : 'Connection test failed');
    }
    setTestingId(null);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/gateways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchGateways();
    } catch {
      addToast('error', isAr ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/admin/gateways/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      addToast('success', isAr ? 'تم تعيين البوابة الافتراضية' : 'Default gateway set');
      fetchGateways();
    } catch {
      addToast('error', isAr ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const toggleSecretKey = (id: string) => {
    setShowSecretKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCountryToggle = (country: string) => {
    setForm((prev) => ({
      ...prev,
      supportedCountries: prev.supportedCountries.includes(country)
        ? prev.supportedCountries.filter((c) => c !== country)
        : [...prev.supportedCountries, country],
    }));
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950', isRtl && 'font-[Cairo,Tajawal,sans-serif]')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8')}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center shadow-lg shadow-[#2580eb]/25">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {isAr ? 'بوابات الدفع' : 'Payment Gateways'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr ? `إدارة بوابات الدفع المتاحة (${gateways.length})` : `Manage payment gateways (${gateways.length})`}
              </p>
            </div>
          </div>
          <Button onClick={openAddModal} iconLeft={<Plus size={18} />}>
            {isAr ? 'إضافة بوابة جديدة' : 'Add Gateway'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className={cn('absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400', isRtl ? 'right-4' : 'left-4')} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث عن بوابة...' : 'Search gateways...'}
            className={cn(
              'w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50 focus:border-transparent transition-all',
              isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4',
            )}
          />
        </div>

        {/* Gateway Grid */}
        {filteredGateways.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'لا توجد بوابات' : 'No gateways found'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredGateways.map((gw) => {
                const provider = PROVIDER_COLORS[gw.provider];
                const isSecretVisible = showSecretKeys[gw.id];

                return (
                  <motion.div
                    key={gw.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <Card padding="none" className="overflow-hidden h-full flex flex-col">
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Top row: provider badge + toggles */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold', provider.bg)}>
                              {isAr ? provider.label : provider.labelEn}
                            </span>
                            {gw.isDefault && (
                              <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1">
                                <Star size={12} /> {isAr ? 'افتراضي' : 'Default'}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggle(gw.id, gw.isActive)}
                            className="shrink-0"
                            title={gw.isActive ? (isAr ? 'معطل' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                          >
                            {gw.isActive ? (
                              <ToggleRight className="w-8 h-8 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                        </div>

                        {/* Name */}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{gw.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{gw.nameEn}</p>

                        {/* Meta badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                              gw.environment === 'sandbox'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700',
                            )}
                          >
                            {gw.environment}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                            {(gw.supportedCurrencies || ['SAR']).join(', ')}
                          </span>
                          {gw.supportedCountries.length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                              <Globe size={10} /> {gw.supportedCountries.length}
                            </span>
                          )}
                        </div>

                        {/* Secret key mask */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-4">
                          <Shield size={12} />
                          <span className="font-mono truncate max-w-[180px]">
                            {gw.secretKey
                              ? isSecretVisible
                                ? gw.secretKey
                                : '••••••••••••••••'
                              : '—'}
                          </span>
                          <button onClick={() => toggleSecretKey(gw.id)} className="shrink-0 hover:text-slate-600">
                            {isSecretVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>

                        {/* Countries */}
                        {gw.supportedCountries.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mb-2">
                            {gw.supportedCountries.map((c) => (
                              <span
                                key={c}
                                className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-white/5 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="border-t border-slate-100 dark:border-white/5 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(gw)}
                            iconLeft={<Edit size={14} />}
                          >
                            {isAr ? 'تعديل' : 'Edit'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTest(gw.id)}
                            loading={testingId === gw.id}
                            iconLeft={<Zap size={14} />}
                            className="text-[#2580eb]"
                          >
                            {isAr ? 'اختبار' : 'Test'}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {!gw.isDefault && (
                            <button
                              onClick={() => handleSetDefault(gw.id)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500 transition-colors"
                              title={isAr ? 'تعيين كافتراضي' : 'Set as default'}
                            >
                              <Star size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => setShowDeleteConfirm(gw.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings size={20} />
                  {editingGateway
                    ? isAr ? 'تعديل بوابة الدفع' : 'Edit Payment Gateway'
                    : isAr ? 'إضافة بوابة دفع جديدة' : 'Add New Payment Gateway'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}
                    </span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder={isAr ? 'مثال: تيب للدفعات' : 'e.g. Tap Payments'}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}
                    </span>
                    <input
                      type="text"
                      value={form.nameEn}
                      onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder="e.g. Tap Payments"
                    />
                  </label>
                </div>

                {/* Provider */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                    {isAr ? 'مزود الدفع' : 'Payment Provider'}
                  </span>
                  <select
                    value={form.provider}
                    onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as GatewayProvider }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50 appearance-none"
                  >
                    {Object.entries(PROVIDER_COLORS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {isAr ? val.label : val.labelEn}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Keys */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'المفتاح العام' : 'Public Key'} *
                    </span>
                    <input
                      type="text"
                      value={form.publicKey}
                      onChange={(e) => setForm((f) => ({ ...f, publicKey: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder="pk_..."
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'المفتاح السري' : 'Secret Key'} *
                    </span>
                    <input
                      type="password"
                      value={form.secretKey}
                      onChange={(e) => setForm((f) => ({ ...f, secretKey: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder="sk_..."
                    />
                  </label>
                </div>

                {/* Merchant ID (conditional for specific providers) */}
                {['hyperpay', 'paytabs', 'myfatoorah'].includes(form.provider) && (
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'معرف التاجر' : 'Merchant ID'}
                    </span>
                    <input
                      type="text"
                      value={form.merchantId}
                      onChange={(e) => setForm((f) => ({ ...f, merchantId: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder={isAr ? 'معرف التاجر' : 'Merchant ID'}
                    />
                  </label>
                )}

                {/* Webhook Secret */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                    {isAr ? 'سر الويب هوك' : 'Webhook Secret'}
                  </span>
                  <input
                    type="password"
                    value={form.webhookSecret}
                    onChange={(e) => setForm((f) => ({ ...f, webhookSecret: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                    placeholder={isAr ? 'اختياري' : 'Optional'}
                  />
                </label>

                {/* Environment */}
                <div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                    {isAr ? 'البيئة' : 'Environment'}
                  </span>
                  <div className="flex gap-2">
                    {(['sandbox', 'production'] as const).map((env) => (
                      <button
                        key={env}
                        onClick={() => setForm((f) => ({ ...f, environment: env }))}
                        className={cn(
                          'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                          form.environment === env
                            ? env === 'sandbox'
                              ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                              : 'border-green-400 bg-green-50 text-green-700'
                            : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300',
                        )}
                      >
                        {env === 'sandbox' ? (isAr ? 'تجريبي' : 'Sandbox') : (isAr ? 'إنتاجي' : 'Production')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'رابط الاستدعاء' : 'Callback URL'}
                    </span>
                    <input
                      type="url"
                      value={form.callbackUrl}
                      onChange={(e) => setForm((f) => ({ ...f, callbackUrl: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder="https://"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      {isAr ? 'رابط الويب هوك' : 'Webhook URL'}
                    </span>
                    <input
                      type="url"
                      value={form.webhookUrl}
                      onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50"
                      placeholder="https://"
                    />
                  </label>
                </div>

                {/* Currency */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                    {isAr ? 'العملة' : 'Currency'}
                  </span>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2580eb]/50 appearance-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                {/* Supported Countries */}
                <div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                    {isAr ? 'الدول المدعومة' : 'Supported Countries'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCountryToggle(c)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all',
                          form.supportedCountries.includes(c)
                            ? 'border-[#2580eb] bg-[#2580eb]/10 text-[#2580eb]'
                            : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300',
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                      className="shrink-0"
                    >
                      {form.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300" />
                      )}
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isAr ? 'نشط' : 'Active'}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                      className="shrink-0"
                    >
                      {form.isDefault ? (
                        <ToggleRight className="w-8 h-8 text-amber-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-300" />
                      )}
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isAr ? 'افتراضي' : 'Default'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 px-6 py-4 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSave} iconLeft={<CheckCircle2 size={16} />}>
                  {editingGateway ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة' : 'Add Gateway')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isAr ? 'حذف بوابة الدفع' : 'Delete Payment Gateway'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {isAr ? 'هل أنت متأكد من حذف هذه البوابة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this gateway? This action cannot be undone.'}
              </p>
              <div className="flex items-center gap-3 justify-center">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)} iconLeft={<Trash2 size={14} />}>
                  {isAr ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className={cn('fixed z-[100] flex flex-col gap-2', isRtl ? 'top-4 left-4' : 'top-4 right-4')}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: isRtl ? -40 : 40, y: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? -40 : 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm text-sm font-medium min-w-[260px]',
                t.type === 'success' && 'bg-emerald-500/90 text-white',
                t.type === 'error' && 'bg-red-500/90 text-white',
                t.type === 'info' && 'bg-[#2580eb]/90 text-white',
              )}
            >
              {t.type === 'success' && <CheckCircle2 size={18} />}
              {t.type === 'error' && <XCircle size={18} />}
              {t.type === 'info' && <Zap size={18} />}
              <span className="flex-1">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
