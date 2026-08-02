'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Search,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { useLanguageStore } from '@/store/language-store';

interface FAQ {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

type FAQFormData = Omit<FAQ, 'id' | 'createdAt'>;

const emptyForm: FAQFormData = {
  question: '',
  questionEn: '',
  answer: '',
  answerEn: '',
  category: 'general',
  sortOrder: 0,
  isActive: true,
};

const categories = [
  { value: 'general', ar: 'عام', en: 'General' },
  { value: 'payment', ar: 'الدفع', en: 'Payment' },
  { value: 'orders', ar: 'الطلبات', en: 'Orders' },
  { value: 'support', ar: 'الدعم', en: 'Support' },
];

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<FAQFormData>(emptyForm);
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs([...(data.data || [])].sort((a, b) => a.sortOrder - b.sortOrder));
      }
    } catch {
      toast.error(isAr ? 'فشل تحميل الأسئلة الشائعة' : 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    const load = () => fetchFaqs();
    load();
  }, [fetchFaqs]);

  const filtered = useMemo(() => {
    if (!searchQuery) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.questionEn.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const stats = useMemo(() => {
    const active = faqs.filter((f) => f.isActive).length;
    const byCategory = faqs.reduce<Record<string, number>>((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});
    return { total: faqs.length, active, byCategory };
  }, [faqs]);

  const openAdd = () => {
    setEditingFaq(null);
    setForm({ ...emptyForm, sortOrder: faqs.length });
    setShowModal(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      questionEn: faq.questionEn,
      answer: faq.answer,
      answerEn: faq.answerEn,
      category: faq.category,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error(isAr ? 'السؤال والإجابة مطلوبان' : 'Question and answer are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        question: form.question.trim(),
        questionEn: form.questionEn.trim() || form.question.trim(),
        answer: form.answer.trim(),
        answerEn: form.answerEn.trim() || form.answer.trim(),
        category: form.category || 'general',
      };

      const res = editingFaq
        ? await fetch(`/api/cms/faqs/${editingFaq.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/cms/faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const data = await res.json();

      if (data.success) {
        toast.success(isAr ? 'تم الحفظ بنجاح' : 'Saved successfully');
        setShowModal(false);
        await fetchFaqs();
      } else {
        toast.error(data.error || (isAr ? 'فشل الحفظ' : 'Failed to save'));
      }
    } catch {
      toast.error(isAr ? 'حدث خطأ أثناء الحفظ' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/faqs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(isAr ? 'تم الحذف بنجاح' : 'Deleted successfully');
        setDeleteConfirm(null);
        await fetchFaqs();
      } else {
        toast.error(data.error || (isAr ? 'فشل الحذف' : 'Failed to delete'));
      }
    } catch {
      toast.error(isAr ? 'حدث خطأ أثناء الحذف' : 'An error occurred');
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const res = await fetch(`/api/cms/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchFaqs();
      }
    } catch {
      toast.error(isAr ? 'فشل تحديث الحالة' : 'Failed to update status');
    }
  };

  const moveFaq = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    const reordered = [...faqs];
    const [item] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);
    const updated = reordered.map((f, i) => ({ ...f, sortOrder: i }));
    setFaqs(updated);
    try {
      await Promise.all(
        updated.map((f) =>
          fetch(`/api/cms/faqs/${f.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: f.sortOrder }),
          })
        )
      );
    } catch {
      toast.error(isAr ? 'فشل إعادة الترتيب' : 'Failed to reorder');
      await fetchFaqs();
    }
  };

  const getCategoryLabel = (value: string) => {
    const c = categories.find((x) => x.value === value);
    return c ? (isAr ? c.ar : c.en) : value;
  };

  return (
    <div>
      <PageHeader
        title={isAr ? 'الأسئلة الشائعة' : 'FAQs'}
        subtitle={isAr ? 'إدارة الأسئلة والأجوبة الشائعة' : 'Manage frequently asked questions'}
        gradient
        actions={
          <Button onClick={openAdd}>
            <Plus size={18} />
            {isAr ? 'إضافة سؤال' : 'Add FAQ'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2580eb]/10 text-[#2580eb] flex items-center justify-center">
                <HelpCircle size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'إجمالي الأسئلة' : 'Total FAQs'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Eye size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'سؤال نشط' : 'Active FAQs'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <GripVertical size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{faqs.filter((f) => !f.isActive).length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'سؤال غير نشط' : 'Inactive FAQs'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث في الأسئلة...' : 'Search FAQs...'}
                className={cn(inputClass, 'pr-4 pl-10')}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <Badge key={cat} variant="secondary">
                  {getCategoryLabel(cat)} ({count})
                </Badge>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-[#2580eb]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {isAr ? 'لا توجد أسئلة شائعة' : 'No FAQs found'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all duration-200',
                      faq.isActive
                        ? 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'
                        : 'border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40 opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 mt-0.5">
                          <button
                            onClick={() => moveFaq(index, -1)}
                            disabled={index === 0}
                            className="p-0.5 rounded text-slate-400 hover:text-[#2580eb] disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => moveFaq(index, 1)}
                            disabled={index === filtered.length - 1}
                            className="p-0.5 rounded text-slate-400 hover:text-[#2580eb] disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {isAr ? faq.question : faq.questionEn || faq.question}
                            </span>
                            <Badge variant="secondary" size="sm">
                              {getCategoryLabel(faq.category)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {isAr ? faq.answer : faq.answerEn || faq.answer}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => handleToggleActive(faq)}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-[#2580eb] transition-colors"
                            >
                              {faq.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                              {faq.isActive ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                            </button>
                            <span className="text-xs text-slate-400">
                              {isAr ? 'الترتيب' : 'Order'}: {faq.sortOrder}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(faq)}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#2580eb] hover:bg-[#2580eb]/10 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(faq.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>
          {isAr ? (editingFaq ? 'تعديل سؤال' : 'إضافة سؤال') : editingFaq ? 'Edit FAQ' : 'Add FAQ'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'السؤال (عربي)' : 'Question (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className={inputClass}
                  placeholder={isAr ? 'السؤال بالعربية' : 'Question in Arabic'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'السؤال (إنجليزي)' : 'Question (English)'}
                </label>
                <input
                  type="text"
                  value={form.questionEn}
                  onChange={(e) => setForm({ ...form, questionEn: e.target.value })}
                  className={inputClass}
                  placeholder={isAr ? 'السؤال بالإنجليزية' : 'Question in English'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الإجابة (عربي)' : 'Answer (Arabic)'} *
                </label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className={cn(inputClass, 'resize-none')}
                  placeholder={isAr ? 'الإجابة بالعربية' : 'Answer in Arabic'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الإجابة (إنجليزي)' : 'Answer (English)'}
                </label>
                <textarea
                  value={form.answerEn}
                  onChange={(e) => setForm({ ...form, answerEn: e.target.value })}
                  rows={4}
                  className={cn(inputClass, 'resize-none')}
                  placeholder={isAr ? 'الإجابة بالإنجليزية' : 'Answer in English'}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {isAr ? c.ar : c.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الترتيب' : 'Sort Order'}
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#2580eb] focus:ring-[#2580eb]/30"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {isAr ? 'نشط (ظاهر للعملاء)' : 'Active (visible to customers)'}
              </span>
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            {isAr ? 'حفظ' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <ModalHeader>
          {isAr ? 'تأكيد الحذف' : 'Confirm Deletion'}
        </ModalHeader>
        <ModalBody>
          <p className="text-slate-600 dark:text-slate-300">
            {isAr
              ? 'هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure you want to delete this FAQ? This action cannot be undone.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            <Trash2 size={16} />
            {isAr ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
