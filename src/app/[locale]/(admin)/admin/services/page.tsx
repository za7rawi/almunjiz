'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Star,
  Clock,
  Tag,
  Layers,
  Power,
  GripVertical,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceData {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  fullDescription: string;
  fullDescriptionEn: string;
  icon: string;
  category: string;
  categoryAr: string;
  price: number;
  priceNote: string;
  priceNoteEn: string;
  duration: string;
  durationEn: string;
  features: string[];
  featuresEn: string[];
  requirements: string[];
  requirementsEn: string[];
  steps: { title: string; description: string; icon: string }[];
  stepsEn: { title: string; description: string; icon: string }[];
  faq: { question: string; answer: string }[];
  faqEn: { question: string; answer: string }[];
  requiredDocuments: string[];
  requiredDocumentsEn: string[];
  isPopular: boolean;
  isActive: boolean;
  gradient: string;
}

const categories = [
  { value: 'VISAS', label: 'التأشيرات' },
  { value: 'CONTRACTS', label: 'العقود' },
  { value: 'VEHICLES', label: 'المركبات' },
  { value: 'TRAVEL', label: 'السفر' },
  { value: 'HOTELS', label: 'الفنادق' },
  { value: 'BUSINESS', label: 'الأعمال' },
  { value: 'GOVERNMENT', label: 'الحكومية' },
  { value: 'ELECTRONIC', label: 'الإلكترونية' },
  { value: 'UNIVERSITIES', label: 'الجامعات' },
  { value: 'CONSULTATIONS', label: 'الاستشارات' },
  { value: 'OTHER', label: 'أخرى' },
];

const emptyService: ServiceData = {
  id: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  fullDescription: '',
  fullDescriptionEn: '',
  icon: 'Globe',
  category: 'VISAS',
  categoryAr: 'التأشيرات',
  price: 0,
  priceNote: 'يبدأ من',
  priceNoteEn: 'Starting from',
  duration: '',
  durationEn: '',
  features: [],
  featuresEn: [],
  requirements: [],
  requirementsEn: [],
  steps: [],
  stepsEn: [],
  faq: [],
  faqEn: [],
  requiredDocuments: [],
  requiredDocumentsEn: [],
  isPopular: false,
  isActive: true,
  gradient: 'from-[#2580eb] via-[#3b8cf6] to-[#60a5fa]',
};

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

function ListItemEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState('');
  const addItem = () => {
    if (value.trim()) {
      onChange([...items, value.trim()]);
      setValue('');
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder={placeholder}
          className={cn(inputClass, 'flex-1')}
        />
        <Button size="sm" onClick={addItem} type="button">
          <Plus size={14} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-sm text-slate-700 dark:text-slate-300"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StepEditor({
  steps,
  onChange,
}: {
  steps: { title: string; description: string; icon: string }[];
  onChange: (steps: { title: string; description: string; icon: string }[]) => void;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const addStep = () => {
    if (title.trim() && desc.trim()) {
      onChange([...steps, { title: title.trim(), description: desc.trim(), icon: 'CheckCircle' }]);
      setTitle('');
      setDesc('');
    }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الخطوة"
          className={inputClass}
        />
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="وصف الخطوة"
          className={inputClass}
        />
      </div>
      <Button size="sm" onClick={addStep} type="button" variant="secondary">
        <Plus size={14} /> إضافة خطوة
      </Button>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5"
          >
            <div className="w-7 h-7 rounded-full bg-[#2580eb] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{step.title}</p>
              <p className="text-xs text-slate-500 truncate">{step.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(steps.filter((_, j) => j !== i))}
              className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQEditor({
  faq,
  onChange,
}: {
  faq: { question: string; answer: string }[];
  onChange: (faq: { question: string; answer: string }[]) => void;
}) {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const addFAQ = () => {
    if (q.trim() && a.trim()) {
      onChange([...faq, { question: q.trim(), answer: a.trim() }]);
      setQ('');
      setA('');
    }
  };
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="السؤال"
          className={inputClass}
        />
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="الإجابة"
          rows={2}
          className={cn(inputClass, 'resize-none')}
        />
      </div>
      <Button size="sm" onClick={addFAQ} type="button" variant="secondary">
        <Plus size={14} /> إضافة سؤال
      </Button>
      <div className="space-y-2">
        {faq.map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 space-y-1"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.question}</p>
              <button
                type="button"
                onClick={() => onChange(faq.filter((_, j) => j !== i))}
                className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-500">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceData>({ ...emptyService });
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'features' | 'steps' | 'faq'>('basic');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/services');
      const data = await res.json();
      if (data.success) setServices(data.data);
    } catch {
      console.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const filtered = useMemo(() => {
    if (!searchQuery) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.name.includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.categoryAr.includes(q) ||
        s.category.includes(q)
    );
  }, [services, searchQuery]);

  const stats = useMemo(() => {
    const active = services.filter((s) => s.isActive).length;
    const inactive = services.filter((s) => !s.isActive).length;
    return { total: services.length, active, inactive };
  }, [services]);

  const openAdd = () => {
    setEditingService(null);
    setForm({ ...emptyService, id: `svc-${Date.now()}` });
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEdit = (service: ServiceData) => {
    setEditingService(service);
    setForm({ ...service });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.nameEn || !form.price) return;
    setSaving(true);
    try {
      if (editingService) {
        const res = await fetch(`/api/cms/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) => prev.map((s) => (s.id === editingService.id ? { ...s, ...form } : s)));
        }
      } else {
        const res = await fetch('/api/cms/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setServices((prev) => [...prev, { ...form, id: data.data.id }]);
        }
      }
      setShowModal(false);
    } catch {
      console.error('Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      console.error('Failed to delete service');
    }
    setDeleteConfirm(null);
  };

  const toggleServiceActive = async (id: string) => {
    const svc = services.find((s) => s.id === id);
    if (!svc) return;
    const newActive = !svc.isActive;
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: newActive } : s)));
    try {
      await fetch(`/api/cms/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
    } catch {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !newActive } : s)));
    }
  };

  const tabs = [
    { key: 'basic' as const, label: 'المعلومات الأساسية' },
    { key: 'details' as const, label: 'التفاصيل' },
    { key: 'features' as const, label: 'المميزات والمتطلبات' },
    { key: 'steps' as const, label: 'الخطوات' },
    { key: 'faq' as const, label: 'الأسئلة الشائعة' },
  ];

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
        title="إدارة الخدمات"
        subtitle="إضافة وتعديل وحذف الخدمات"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'الخدمات' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            إضافة خدمة جديدة
          </Button>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الخدمات', value: stats.total, icon: Layers, color: '#2580eb' },
          { label: 'الخدمات النشطة', value: stats.active, icon: Check, color: '#14b8a6' },
          { label: 'الخدمات المعطلة', value: stats.inactive, icon: Power, color: '#ef4444' },
          { label: 'التصنيفات', value: categories.length, icon: Tag, color: '#7c3aed' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في الخدمات..."
          className={cn(inputClass, 'pr-10')}
        />
      </div>

      {/* Services Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الخدمة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">التصنيف</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">السعر</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">المدة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">الحالة</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service, i) => (
                <motion.tr
                  key={service.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shrink-0',
                          service.gradient
                        )}
                      >
                        <GripVertical size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{service.name}</p>
                        <p className="text-xs text-slate-400 truncate">{service.nameEn}</p>
                      </div>
                      {service.isPopular && (
                        <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <Badge variant="secondary" size="sm">{service.categoryAr}</Badge>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{service.price} ر.س</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock size={14} />
                      {service.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleServiceActive(service.id)}>
                      <Badge variant={service.isActive ? 'success' : 'danger'} size="sm" dot>
                        {service.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(service.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    لا توجد خدمات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 mb-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-2 mx-6 mt-4 bg-slate-50 dark:bg-white/5 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                      activeTab === tab.key
                        ? 'bg-white dark:bg-slate-800 text-[#2580eb] shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {activeTab === 'basic' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          اسم الخدمة (عربي) *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClass}
                          placeholder="مثال: تأشيرة سياحية"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          اسم الخدمة (إنجليزي) *
                        </label>
                        <input
                          type="text"
                          value={form.nameEn}
                          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                          className={inputClass}
                          placeholder="e.g. Tourist Visa"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        وصف مختصر (عربي) *
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        className={cn(inputClass, 'resize-none')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        وصف مختصر (إنجليزي) *
                      </label>
                      <textarea
                        value={form.descriptionEn}
                        onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                        rows={2}
                        className={cn(inputClass, 'resize-none')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        وصف كامل (عربي)
                      </label>
                      <textarea
                        value={form.fullDescription}
                        onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                        rows={4}
                        className={cn(inputClass, 'resize-none')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        وصف كامل (إنجليزي)
                      </label>
                      <textarea
                        value={form.fullDescriptionEn}
                        onChange={(e) => setForm({ ...form, fullDescriptionEn: e.target.value })}
                        rows={3}
                        className={cn(inputClass, 'resize-none')}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'details' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          التصنيف *
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => {
                            const cat = categories.find((c) => c.value === e.target.value);
                            setForm({
                              ...form,
                              category: e.target.value,
                              categoryAr: cat?.label || '',
                            });
                          }}
                          className={inputClass}
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          السعر (ر.س) *
                        </label>
                        <input
                          type="number"
                          value={form.price || ''}
                          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                          className={inputClass}
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          ملاحظة السعر (عربي)
                        </label>
                        <input
                          type="text"
                          value={form.priceNote}
                          onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                          className={inputClass}
                          placeholder="يبدأ من"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          مدة الإنجاز (عربي) *
                        </label>
                        <input
                          type="text"
                          value={form.duration}
                          onChange={(e) => setForm({ ...form, duration: e.target.value })}
                          className={inputClass}
                          placeholder="مثال: 3-5 أيام عمل"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          مدة الإنجاز (إنجليزي) *
                        </label>
                        <input
                          type="text"
                          value={form.durationEn}
                          onChange={(e) => setForm({ ...form, durationEn: e.target.value })}
                          className={inputClass}
                          placeholder="e.g. 3-5 business days"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          تدرج الألوان
                        </label>
                        <input
                          type="text"
                          value={form.gradient}
                          onChange={(e) => setForm({ ...form, gradient: e.target.value })}
                          className={inputClass}
                          placeholder="from-[#2580eb] via-[#3b8cf6] to-[#60a5fa]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isPopular}
                          onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-[#2580eb] focus:ring-[#2580eb]"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">خدمة مميزة</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-[#2580eb] focus:ring-[#2580eb]"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">نشطة</span>
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'features' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        قائمة المميزات (عربي)
                      </label>
                      <ListItemEditor
                        items={form.features}
                        onChange={(items) => setForm({ ...form, features: items })}
                        placeholder="إضافة ميزة..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        قائمة المميزات (إنجليزي)
                      </label>
                      <ListItemEditor
                        items={form.featuresEn}
                        onChange={(items) => setForm({ ...form, featuresEn: items })}
                        placeholder="Add feature..."
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        المستندات المطلوبة (عربي)
                      </label>
                      <ListItemEditor
                        items={form.requiredDocuments}
                        onChange={(items) => setForm({ ...form, requiredDocuments: items })}
                        placeholder="إضافة مستند..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        المستندات المطلوبة (إنجليزي)
                      </label>
                      <ListItemEditor
                        items={form.requiredDocumentsEn}
                        onChange={(items) => setForm({ ...form, requiredDocumentsEn: items })}
                        placeholder="Add document..."
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        المتطلبات (عربي)
                      </label>
                      <ListItemEditor
                        items={form.requirements}
                        onChange={(items) => setForm({ ...form, requirements: items })}
                        placeholder="إضافة متطلب..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        المتطلبات (إنجليزي)
                      </label>
                      <ListItemEditor
                        items={form.requirementsEn}
                        onChange={(items) => setForm({ ...form, requirementsEn: items })}
                        placeholder="Add requirement..."
                      />
                    </div>
                  </>
                )}

                {activeTab === 'steps' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        خطوات التنفيذ (عربي)
                      </label>
                      <StepEditor
                        steps={form.steps}
                        onChange={(steps) => setForm({ ...form, steps })}
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        خطوات التنفيذ (إنجليزي)
                      </label>
                      <StepEditor
                        steps={form.stepsEn}
                        onChange={(stepsEn) => setForm({ ...form, stepsEn })}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'faq' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        الأسئلة الشائعة (عربي)
                      </label>
                      <FAQEditor
                        faq={form.faq}
                        onChange={(faq) => setForm({ ...form, faq })}
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        الأسئلة الشائعة (إنجليزي)
                      </label>
                      <FAQEditor
                        faq={form.faqEn}
                        onChange={(faqEn) => setForm({ ...form, faqEn })}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-white/5">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  إلغاء
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!form.name || !form.nameEn || !form.price || saving}
                  iconLeft={saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                >
                  {editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-white/10"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
                حذف الخدمة
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setDeleteConfirm(null)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleDelete(deleteConfirm)}
                  iconLeft={<Trash2 size={14} />}
                >
                  حذف
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
