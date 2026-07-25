'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CreditCard,
  Globe,
  Trash2,
  Edit,
  Zap,
  Search,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  Settings,
  Loader2,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { cn } from '@/lib/utils';

type GatewayProvider = 'TAP' | 'MOYASAR' | 'HYPERPAY' | 'PAYTABS' | 'MYFATOORAH' | 'STRIPE' | 'EDFAPAY' | 'TAMARA' | 'TABBY' | 'CUSTOM';
type GatewayEnvironment = 'SANDBOX' | 'PRODUCTION';

interface PaymentGateway {
  id: string;
  name: string;
  slug: string;
  provider: GatewayProvider;
  displayName: string;
  displayNameEn: string;
  description?: string;
  logo?: string;
  publicKey: string;
  secretKey: string;
  merchantId?: string;
  webhookSecret?: string;
  apiEndpoint?: string;
  environment: GatewayEnvironment;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  supportsApplePay: boolean;
  supportsGooglePay: boolean;
  supportsInstallments: boolean;
  supportedCurrencies: string[];
  supportedCountries: string[];
  config?: Record<string, unknown>;
}

interface GatewayForm {
  name: string;
  displayNameEn: string;
  provider: GatewayProvider;
  publicKey: string;
  secretKey: string;
  merchantId: string;
  webhookSecret: string;
  apiEndpoint: string;
  environment: GatewayEnvironment;
  description: string;
  logo: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  supportsApplePay: boolean;
  supportsGooglePay: boolean;
  supportsInstallments: boolean;
  supportedCurrencies: string[];
  supportedCountries: string[];
}

const PROVIDER_COLORS: Record<GatewayProvider, { bg: string; label: string; labelEn: string }> = {
  TAP: { bg: 'bg-blue-100 text-blue-700', label: 'تيب', labelEn: 'Tap' },
  MOYASAR: { bg: 'bg-emerald-100 text-emerald-700', label: 'موياسر', labelEn: 'Moyasar' },
  HYPERPAY: { bg: 'bg-purple-100 text-purple-700', label: 'هايبر باي', labelEn: 'HyperPay' },
  PAYTABS: { bg: 'bg-orange-100 text-orange-700', label: 'بايتابس', labelEn: 'PayTabs' },
  MYFATOORAH: { bg: 'bg-teal-100 text-teal-700', label: 'ميفاتورة', labelEn: 'MyFatoorah' },
  STRIPE: { bg: 'bg-violet-100 text-violet-700', label: 'سترايب', labelEn: 'Stripe' },
  EDFAPAY: { bg: 'bg-cyan-100 text-cyan-700', label: 'ادفع باي', labelEn: 'EdfaPay' },
  TAMARA: { bg: 'bg-pink-100 text-pink-700', label: 'تمارا', labelEn: 'Tamara' },
  TABBY: { bg: 'bg-yellow-100 text-yellow-700', label: 'تابي', labelEn: 'Tabby' },
  CUSTOM: { bg: 'bg-slate-100 text-slate-700', label: 'مخصص', labelEn: 'Custom' },
};

const CURRENCIES = ['SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'EGP', 'USD', 'EUR', 'GBP'];
const COUNTRIES = ['SA', 'AE', 'KW', 'BH', 'QA', 'OM', 'EG', 'JO', 'LB', 'IQ', 'US', 'GB'];

function emptyForm(): GatewayForm {
  return {
    name: '',
    displayNameEn: '',
    provider: 'TAP',
    publicKey: '',
    secretKey: '',
    merchantId: '',
    webhookSecret: '',
    apiEndpoint: '',
    environment: 'SANDBOX',
    description: '',
    logo: '',
    isActive: true,
    isDefault: false,
    sortOrder: 0,
    supportsApplePay: false,
    supportsGooglePay: false,
    supportsInstallments: false,
    supportedCurrencies: ['SAR'],
    supportedCountries: [],
  };
}

export default function GatewaysPage() {
  const { language } = useLanguageStore();
  const { isRtl } = useDirection();
  const isAr = language === 'ar';

  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [form, setForm] = useState<GatewayForm>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchGateways = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/gateways');
      const data = await res.json();
      if (data.success) setGateways(data.data);
    } catch {
      console.error('Failed to load gateways');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGateways(); }, [fetchGateways]);

  const filteredGateways = gateways.filter((gw) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      gw.name.toLowerCase().includes(q) ||
      gw.displayNameEn.toLowerCase().includes(q) ||
      gw.provider.toLowerCase().includes(q) ||
      (gw.supportedCurrencies || []).some(c => c.toLowerCase().includes(q))
    );
  });

  const openAddModal = () => {
    setEditingGateway(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEditModal = (gw: PaymentGateway) => {
    setEditingGateway(gw);
    setForm({
      name: gw.displayName || gw.name,
      displayNameEn: gw.displayNameEn,
      provider: gw.provider,
      publicKey: gw.publicKey || '',
      secretKey: '',
      merchantId: gw.merchantId || '',
      webhookSecret: '',
      apiEndpoint: gw.apiEndpoint || '',
      environment: gw.environment,
      description: gw.description || '',
      logo: gw.logo || '',
      isActive: gw.isActive,
      isDefault: gw.isDefault,
      sortOrder: gw.sortOrder || 0,
      supportsApplePay: gw.supportsApplePay || false,
      supportsGooglePay: gw.supportsGooglePay || false,
      supportsInstallments: gw.supportsInstallments || false,
      supportedCurrencies: [...(gw.supportedCurrencies || ['SAR'])],
      supportedCountries: [...(gw.supportedCountries || [])],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.displayNameEn.trim()) return;
    setSaving(true);
    try {
      const slug = form.displayNameEn.toLowerCase().replace(/\s+/g, '-');
      const payload: Record<string, unknown> = {
        name: form.name,
        displayName: form.name,
        displayNameEn: form.displayNameEn,
        slug,
        provider: form.provider,
        publicKey: form.publicKey,
        environment: form.environment,
        isActive: form.isActive,
        isDefault: form.isDefault,
        sortOrder: form.sortOrder,
        supportsApplePay: form.supportsApplePay,
        supportsGooglePay: form.supportsGooglePay,
        supportsInstallments: form.supportsInstallments,
        supportedCurrencies: form.supportedCurrencies,
        supportedCountries: form.supportedCountries,
      };
      if (form.secretKey) payload.secretKey = form.secretKey;
      if (form.merchantId) payload.merchantId = form.merchantId;
      if (form.webhookSecret) payload.webhookSecret = form.webhookSecret;
      if (form.apiEndpoint) payload.apiEndpoint = form.apiEndpoint;
      if (form.description) payload.description = form.description;
      if (form.logo) payload.logo = form.logo;

      if (editingGateway) {
        await fetch(`/api/admin/gateways/${editingGateway.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/admin/gateways', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      setEditingGateway(null);
      fetchGateways();
    } catch {
      console.error('Failed to save gateway');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/gateways/${id}`, { method: 'DELETE' });
      setGateways((prev) => prev.filter((g) => g.id !== id));
    } catch {
      console.error('Failed to delete gateway');
    }
    setDeleteConfirm(null);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await fetch(`/api/admin/gateways/${id}/test`, { method: 'POST' });
    } catch {
      console.error('Test failed');
    }
    setTestingId(null);
  };

  const handleToggleActive = async (gw: PaymentGateway) => {
    const newVal = !gw.isActive;
    setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isActive: newVal } : g)));
    try {
      await fetch(`/api/admin/gateways/${gw.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newVal }),
      });
    } catch {
      setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isActive: !newVal } : g)));
    }
  };

  const handleSetDefault = async (gw: PaymentGateway) => {
    setGateways((prev) => prev.map((g) => ({ ...g, isDefault: g.id === gw.id })));
    try {
      await fetch(`/api/admin/gateways/${gw.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
    } catch {
      setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isDefault: false } : g)));
    }
  };

  const toggleCurrency = (currency: string) => {
    setForm((prev) => ({
      ...prev,
      supportedCurrencies: prev.supportedCurrencies.includes(currency)
        ? prev.supportedCurrencies.filter((c) => c !== currency)
        : [...prev.supportedCurrencies, currency],
    }));
  };

  const toggleCountry = (country: string) => {
    setForm((prev) => ({
      ...prev,
      supportedCountries: prev.supportedCountries.includes(country)
        ? prev.supportedCountries.filter((c) => c !== country)
        : [...prev.supportedCountries, country],
    }));
  };

  const activeCount = gateways.filter((g) => g.isActive).length;
  const defaultGw = gateways.find((g) => g.isDefault);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2580eb]" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRtl && 'font-[Cairo,Tajawal,sans-serif]')}>
      <PageHeader
        title={isAr ? 'بوابات الدفع' : 'Payment Gateways'}
        subtitle={isAr ? `إدارة بوابات الدفع المتاحة (${gateways.length})` : `Manage payment gateways (${gateways.length})`}
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'بوابات الدفع' : 'Gateways' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAddModal}>
            {isAr ? 'إضافة بوابة' : 'Add Gateway'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CreditCard size={20} />}
          value={gateways.length}
          label={isAr ? 'إجمالي البوابات' : 'Total Gateways'}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={activeCount}
          label={isAr ? 'بوابات نشطة' : 'Active Gateways'}
        />
        <StatCard
          icon={<Star size={20} />}
          value={defaultGw ? 1 : 0}
          label={isAr ? 'البوابة الافتراضية' : 'Default Gateway'}
        />
        <StatCard
          icon={<Shield size={20} />}
          value={gateways.filter((g) => g.environment === 'PRODUCTION').length}
          label={isAr ? 'بيئة الإنتاج' : 'Production'}
        />
      </div>

      <div className="relative">
        <Search size={16} className={cn('absolute top-1/2 -translate-y-1/2 text-slate-400', isRtl ? 'right-4' : 'left-4')} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'بحث عن بوابة...' : 'Search gateways...'}
          className={cn(
            'w-full text-sm rounded-xl transition-all duration-200',
            'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
            'text-slate-900 dark:text-white placeholder:text-slate-400',
            'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            isRtl ? 'pe-10 ps-4 py-2.5' : 'ps-10 pe-4 py-2.5',
          )}
        />
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الاسم' : 'Name'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'المزود' : 'Provider'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">{isAr ? 'البيئة' : 'Env'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">{isAr ? 'العملات' : 'Currencies'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGateways.map((gw, i) => {
                  const provider = PROVIDER_COLORS[gw.provider] || PROVIDER_COLORS.CUSTOM;
                  return (
                    <motion.tr
                      key={gw.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center shrink-0">
                            <CreditCard size={16} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white truncate">{gw.displayNameEn || gw.name}</span>
                              {gw.isDefault && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-0.5">
                                  <Star size={8} fill="currentColor" /> {isAr ? 'افتراضي' : 'Default'}
                                </span>
                              )}
                            </div>
                            {gw.displayName && gw.displayNameEn && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{gw.displayName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold', provider.bg)}>
                          {isAr ? provider.label : provider.labelEn}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <Badge variant={gw.environment === 'SANDBOX' ? 'warning' : 'success'} size="sm">
                          {gw.environment}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center hidden lg:table-cell">
                        <span className="text-xs text-slate-500 font-medium">
                          {(gw.supportedCurrencies || []).join(', ') || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant={gw.isActive ? 'success' : 'danger'} size="sm" dot>
                            {gw.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleActive(gw)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                            title={gw.isActive ? (isAr ? 'تعطيل' : 'Deactivate') : (isAr ? 'تفعيل' : 'Activate')}
                          >
                            {gw.isActive ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                          </motion.button>
                          {!gw.isDefault && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSetDefault(gw)}
                              className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-500 transition-colors"
                              title={isAr ? 'تعيين كافتراضي' : 'Set as default'}
                            >
                              <Star size={16} />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTest(gw.id)}
                            disabled={testingId === gw.id}
                            className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors disabled:opacity-50"
                            title={isAr ? 'اختبار الاتصال' : 'Test connection'}
                          >
                            {testingId === gw.id ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(gw)}
                            className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm(gw.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredGateways.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CreditCard size={48} className="mx-auto mb-3 opacity-30" />
              <p>{isAr ? 'لا توجد بوابات' : 'No gateways found'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingGateway(null); }} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings size={20} />
            {editingGateway
              ? isAr ? 'تعديل بوابة الدفع' : 'Edit Payment Gateway'
              : isAr ? 'إضافة بوابة دفع جديدة' : 'Add New Payment Gateway'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'الاسم (عربي)' : 'Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                  placeholder={isAr ? 'مثال: تيب للدفعات' : 'e.g. Tap Payments'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'الاسم (إنجليزي)' : 'Name (English)'} *
                </label>
                <input
                  type="text"
                  value={form.displayNameEn}
                  onChange={(e) => setForm((f) => ({ ...f, displayNameEn: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                  placeholder="e.g. Tap Payments"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {isAr ? 'مزود الدفع' : 'Payment Provider'}
              </label>
              <select
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as GatewayProvider }))}
                className={cn(
                  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white',
                  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                )}
              >
                {Object.entries(PROVIDER_COLORS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {isAr ? val.label : val.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'المفتاح العام' : 'Public Key'}
                </label>
                <input
                  type="text"
                  value={form.publicKey}
                  onChange={(e) => setForm((f) => ({ ...f, publicKey: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-mono rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                  placeholder="pk_..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'المفتاح السري' : 'Secret Key'} {editingGateway ? '' : '*'}
                </label>
                <input
                  type="password"
                  value={form.secretKey}
                  onChange={(e) => setForm((f) => ({ ...f, secretKey: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-mono rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                  placeholder={editingGateway ? '••••••••' : 'sk_...'}
                />
              </div>
            </div>

            {['HYPERPAY', 'PAYTABS', 'MYFATOORAH'].includes(form.provider) && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'معرف التاجر' : 'Merchant ID'}
                </label>
                <input
                  type="text"
                  value={form.merchantId}
                  onChange={(e) => setForm((f) => ({ ...f, merchantId: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-mono rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'سر الويب هوك' : 'Webhook Secret'}
                </label>
                <input
                  type="password"
                  value={form.webhookSecret}
                  onChange={(e) => setForm((f) => ({ ...f, webhookSecret: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-mono rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                  placeholder={isAr ? 'اختياري' : 'Optional'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isAr ? 'نقطة نهاية API' : 'API Endpoint'}
                </label>
                <input
                  type="url"
                  value={form.apiEndpoint}
                  onChange={(e) => setForm((f) => ({ ...f, apiEndpoint: e.target.value }))}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm font-mono rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                  placeholder="https://"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {isAr ? 'الوصف' : 'Description'}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className={cn(
                  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200 resize-none',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white placeholder:text-slate-400',
                  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                )}
                placeholder={isAr ? 'وصف اختياري' : 'Optional description'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {isAr ? 'البيئة' : 'Environment'}
              </label>
              <div className="flex gap-2">
                {(['SANDBOX', 'PRODUCTION'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, environment: env }))}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                      form.environment === env
                        ? env === 'SANDBOX'
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300',
                    )}
                  >
                    {env === 'SANDBOX' ? (isAr ? 'تجريبي' : 'Sandbox') : (isAr ? 'إنتاجي' : 'Production')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                {isAr ? 'العملات المدعومة' : 'Supported Currencies'}
              </span>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCurrency(c)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all',
                      form.supportedCurrencies.includes(c)
                        ? 'border-[#2580eb] bg-[#2580eb]/10 text-[#2580eb]'
                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                {isAr ? 'الدول المدعومة' : 'Supported Countries'}
              </span>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCountry(c)}
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

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {isAr ? 'رابط الشعار' : 'Logo URL'}
              </label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                className={cn(
                  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white placeholder:text-slate-400',
                  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                )}
                placeholder="https://"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className="shrink-0"
                >
                  {form.isActive ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'نشط' : 'Active'}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                  className="shrink-0"
                >
                  {form.isDefault ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'افتراضي' : 'Default'}</span>
              </label>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{isAr ? 'الترتيب' : 'Sort'}</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white',
                    'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {[
                { key: 'supportsApplePay' as const, label: 'Apple Pay' },
                { key: 'supportsGooglePay' as const, label: 'Google Pay' },
                { key: 'supportsInstallments' as const, label: isAr ? 'الدفع بالأقساط' : 'Installments' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                    className="w-4 h-4 rounded border-slate-300 text-[#2580eb] focus:ring-[#2580eb]/50"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowModal(false); setEditingGateway(null); }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={saving} iconLeft={saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}>
            {editingGateway ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة' : 'Add Gateway')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} size="sm">
        <ModalBody>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {isAr ? 'حذف بوابة الدفع' : 'Delete Payment Gateway'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAr ? 'هل أنت متأكد من حذف هذه البوابة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this gateway? This action cannot be undone.'}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} iconLeft={<Trash2 size={14} />}>
            {isAr ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
