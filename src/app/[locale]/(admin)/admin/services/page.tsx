'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { toast } from '@/components/ui/toast';

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
  image: string | null;
}

const categories = [
  { value: 'VISAS', label: 'التأشيرات', labelEn: 'Visas' },
  { value: 'CONTRACTS', label: 'العقود', labelEn: 'Contracts' },
  { value: 'VEHICLES', label: 'المركبات', labelEn: 'Vehicles' },
  { value: 'TRAVEL', label: 'السفر', labelEn: 'Travel' },
  { value: 'HOTELS', label: 'الفنادق', labelEn: 'Hotels' },
  { value: 'BUSINESS', label: 'الأعمال', labelEn: 'Business' },
  { value: 'GOVERNMENT', label: 'الحكومية', labelEn: 'Government' },
  { value: 'ELECTRONIC', label: 'الإلكترونية', labelEn: 'Electronic' },
  { value: 'UNIVERSITIES', label: 'الجامعات', labelEn: 'Universities' },
  { value: 'CONSULTATIONS', label: 'الاستشارات', labelEn: 'Consultations' },
  { value: 'OTHER', label: 'أخرى', labelEn: 'Other' },
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
  image: null,
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
  isAr,
}: {
  steps: { title: string; description: string; icon: string }[];
  onChange: (steps: { title: string; description: string; icon: string }[]) => void;
  isAr: boolean;
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
          placeholder={isAr ? 'عنوان الخطوة' : 'Step title'}
          className={inputClass}
        />
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={isAr ? 'وصف الخطوة' : 'Step description'}
          className={inputClass}
        />
      </div>
      <Button size="sm" onClick={addStep} type="button" variant="secondary">
        <Plus size={14} /> {isAr ? 'إضافة خطوة' : 'Add step'}
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
  isAr,
}: {
  faq: { question: string; answer: string }[];
  onChange: (faq: { question: string; answer: string }[]) => void;
  isAr: boolean;
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
          placeholder={isAr ? 'السؤال' : 'Question'}
          className={inputClass}
        />
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder={isAr ? 'الإجابة' : 'Answer'}
          rows={2}
          className={cn(inputClass, 'resize-none')}
        />
      </div>
      <Button size="sm" onClick={addFAQ} type="button" variant="secondary">
        <Plus size={14} /> {isAr ? 'إضافة سؤال' : 'Add question'}
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
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceData>({ ...emptyService });
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'features' | 'steps' | 'faq'>('basic');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/services');
      const data = await res.json();
      if (data.success) setServices(data.data);
    } catch {
      console.error('Failed to load services');
      toast.error(isAr ? 'فشل تحميل الخدمات' : 'Failed to load services');
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
        s.name.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.categoryAr.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        setForm((prev: ServiceData) => ({ ...prev, image: json.data.url }));
        toast.success(isAr ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      } else {
        toast.error(json.error || (isAr ? 'فشل رفع الصورة' : 'Upload failed'));
      }
    } catch {
      toast.error(isAr ? 'فشل رفع الصورة' : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      toast.error(isAr ? 'فشل حفظ الخدمة' : 'Failed to save service');
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
      toast.error(isAr ? 'فشل حذف الخدمة' : 'Failed to delete service');
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
    { key: 'basic' as const, label: isAr ? 'المعلومات الأساسية' : 'Basic Info' },
    { key: 'details' as const, label: isAr ? 'التفاصيل' : 'Details' },
    { key: 'features' as const, label: isAr ? 'المميزات والمتطلبات' : 'Features & Requirements' },
    { key: 'steps' as const, label: isAr ? 'الخطوات' : 'Steps' },
    { key: 'faq' as const, label: isAr ? 'الأسئلة الشائعة' : 'FAQ' },
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
        title={isAr ? 'إدارة الخدمات' : 'Service Management'}
        subtitle={isAr ? 'إضافة وتعديل وحذف الخدمات' : 'Add, edit and delete services'}
        gradient
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'الخدمات' : 'Services' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            {isAr ? 'إضافة خدمة جديدة' : 'Add New Service'}
          </Button>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: isAr ? 'إجمالي الخدمات' : 'Total Services', value: stats.total, icon: Layers, color: '#2580eb' },
          { label: isAr ? 'الخدمات النشطة' : 'Active Services', value: stats.active, icon: Check, color: '#14b8a6' },
          { label: isAr ? 'الخدمات المعطلة' : 'Inactive Services', value: stats.inactive, icon: Power, color: '#ef4444' },
          { label: isAr ? 'التصنيفات' : 'Categories', value: categories.length, icon: Tag, color: '#7c3aed' },
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
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder={isAr ? 'بحث في الخدمات...' : 'Search services...'}
          className={cn(inputClass, 'pr-10')}
        />
      </div>

      {/* Services Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isAr ? 'الخدمة' : 'Service'}</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">{isAr ? 'التصنيف' : 'Category'}</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">{isAr ? 'السعر' : 'Price'}</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">{isAr ? 'المدة' : 'Duration'}</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((service, i) => (
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
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{isAr ? service.name : service.nameEn}</p>
                        <p className="text-xs text-slate-400 truncate">{isAr ? service.nameEn : service.name}</p>
                      </div>
                      {service.isPopular && (
                        <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <Badge variant="secondary" size="sm">{isAr ? service.categoryAr : categories.find(c => c.value === service.category)?.labelEn || service.category}</Badge>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{service.price} {isAr ? 'ر.س' : 'SAR'}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock size={14} />
                      {isAr ? service.duration : service.durationEn}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleServiceActive(service.id)}>
                      <Badge variant={service.isActive ? 'success' : 'danger'} size="sm" dot>
                        {service.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
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
                    {isAr ? 'لا توجد خدمات' : 'No services found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {isAr ? 'السابق' : 'Previous'}
          </Button>
          <span className="text-sm text-slate-500 px-3">
            {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {isAr ? 'التالي' : 'Next'}
          </Button>
        </div>
      )}

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
                  {editingService ? (isAr ? 'تعديل الخدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'Add New Service')}
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
                          {isAr ? 'اسم الخدمة (عربي) *' : 'Service Name (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClass}
                          placeholder={isAr ? 'مثال: تأشيرة سياحية' : 'e.g. Tourist Visa'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'اسم الخدمة (إنجليزي) *' : 'Service Name (English) *'}
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
                        {isAr ? 'وصف مختصر (عربي) *' : 'Short Description (Arabic) *'}
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
                        {isAr ? 'وصف مختصر (إنجليزي) *' : 'Short Description (English) *'}
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
                        {isAr ? 'وصف كامل (عربي)' : 'Full Description (Arabic)'}
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
                        {isAr ? 'وصف كامل (إنجليزي)' : 'Full Description (English)'}
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
                          {isAr ? 'التصنيف *' : 'Category *'}
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
                              {isAr ? cat.label : cat.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'السعر (ر.س) *' : 'Price (SAR) *'}
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
                          {isAr ? 'ملاحظة السعر (عربي)' : 'Price Note (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={form.priceNote}
                          onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                          className={inputClass}
                          placeholder={isAr ? 'يبدأ من' : 'Starting from'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'مدة الإنجاز (عربي) *' : 'Processing Time (Arabic) *'}
                        </label>
                        <input
                          type="text"
                          value={form.duration}
                          onChange={(e) => setForm({ ...form, duration: e.target.value })}
                          className={inputClass}
                          placeholder={isAr ? 'مثال: 3-5 أيام عمل' : 'e.g. 3-5 business days'}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'مدة الإنجاز (إنجليزي) *' : 'Processing Time (English) *'}
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
                          {isAr ? 'تدرج الألوان' : 'Color Gradient'}
                        </label>
                        <input
                          type="text"
                          value={form.gradient}
                          onChange={(e) => setForm({ ...form, gradient: e.target.value })}
                          className={inputClass}
                          placeholder="from-[#2580eb] via-[#3b8cf6] to-[#60a5fa]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {isAr ? 'صورة الخدمة' : 'Service Image'}
                        </label>
                        {form.image && (
                          <div className="relative mb-2 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                            <img src={form.image} alt="" className="w-full h-40 object-cover" />
                            <button
                              onClick={() => setForm((prev: ServiceData) => ({ ...prev, image: null }))}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 hover:border-[#2580eb] hover:text-[#2580eb] transition-colors disabled:opacity-50"
                          >
                            {uploading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Upload size={16} />
                            )}
                            {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اختيار صورة من الجهاز' : 'Choose from device')}
                          </button>
                          <input
                            type="text"
                            value={form.image || ''}
                            onChange={(e) => setForm((prev: ServiceData) => ({ ...prev, image: e.target.value || null }))}
                            className={inputClass + ' flex-1'}
                            placeholder={isAr ? 'أو الصق رابط صورة' : 'Or paste image URL'}
                          />
                        </div>
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
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'خدمة مميزة' : 'Popular Service'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-[#2580eb] focus:ring-[#2580eb]"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'نشطة' : 'Active'}</span>
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'features' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'قائمة المميزات (عربي)' : 'Features List (Arabic)'}
                      </label>
                      <ListItemEditor
                        items={form.features}
                        onChange={(items) => setForm({ ...form, features: items })}
                        placeholder={isAr ? 'إضافة ميزة...' : 'Add feature...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'قائمة المميزات (إنجليزي)' : 'Features List (English)'}
                      </label>
                      <ListItemEditor
                        items={form.featuresEn}
                        onChange={(items) => setForm({ ...form, featuresEn: items })}
                        placeholder={isAr ? 'إضافة ميزة...' : 'Add feature...'}
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'المستندات المطلوبة (عربي)' : 'Required Documents (Arabic)'}
                      </label>
                      <ListItemEditor
                        items={form.requiredDocuments}
                        onChange={(items) => setForm({ ...form, requiredDocuments: items })}
                        placeholder={isAr ? 'إضافة مستند...' : 'Add document...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'المستندات المطلوبة (إنجليزي)' : 'Required Documents (English)'}
                      </label>
                      <ListItemEditor
                        items={form.requiredDocumentsEn}
                        onChange={(items) => setForm({ ...form, requiredDocumentsEn: items })}
                        placeholder={isAr ? 'إضافة مستند...' : 'Add document...'}
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'المتطلبات (عربي)' : 'Requirements (Arabic)'}
                      </label>
                      <ListItemEditor
                        items={form.requirements}
                        onChange={(items) => setForm({ ...form, requirements: items })}
                        placeholder={isAr ? 'إضافة متطلب...' : 'Add requirement...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'المتطلبات (إنجليزي)' : 'Requirements (English)'}
                      </label>
                      <ListItemEditor
                        items={form.requirementsEn}
                        onChange={(items) => setForm({ ...form, requirementsEn: items })}
                        placeholder={isAr ? 'إضافة متطلب...' : 'Add requirement...'}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'steps' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'خطوات التنفيذ (عربي)' : 'Execution Steps (Arabic)'}
                      </label>
                      <StepEditor
                        steps={form.steps}
                        onChange={(steps) => setForm({ ...form, steps })}
                        isAr={isAr}
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'خطوات التنفيذ (إنجليزي)' : 'Execution Steps (English)'}
                      </label>
                      <StepEditor
                        steps={form.stepsEn}
                        onChange={(stepsEn) => setForm({ ...form, stepsEn })}
                        isAr={isAr}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'faq' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'الأسئلة الشائعة (عربي)' : 'Frequently Asked Questions (Arabic)'}
                      </label>
                      <FAQEditor
                        faq={form.faq}
                        onChange={(faq) => setForm({ ...form, faq })}
                        isAr={isAr}
                      />
                    </div>
                    <hr className="border-slate-100 dark:border-white/5" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {isAr ? 'الأسئلة الشائعة (إنجليزي)' : 'Frequently Asked Questions (English)'}
                      </label>
                      <FAQEditor
                        faq={form.faqEn}
                        onChange={(faqEn) => setForm({ ...form, faqEn })}
                        isAr={isAr}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-white/5">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!form.name || !form.nameEn || !form.price || saving}
                  iconLeft={saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                >
                  {editingService ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الخدمة' : 'Add Service')}
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
                {isAr ? 'حذف الخدمة' : 'Delete Service'}
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                {isAr ? 'هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this service? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setDeleteConfirm(null)}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => handleDelete(deleteConfirm)}
                  iconLeft={<Trash2 size={14} />}
                >
                  {isAr ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
