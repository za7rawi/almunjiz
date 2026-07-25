'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  File,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Search,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface StaticPage {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  content: string;
  contentEn: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

const emptyForm: Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  titleEn: '',
  slug: '',
  content: '',
  contentEn: '',
  isPublished: false,
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/pages');
      const data = await res.json();
      if (data.success) setPages(data.data);
    } catch {
      console.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const filtered = useMemo(() => {
    if (!searchQuery) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  const stats = useMemo(() => {
    const published = pages.filter((p) => p.isPublished).length;
    const draft = pages.filter((p) => !p.isPublished).length;
    return { total: pages.length, published, draft };
  }, [pages]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const openAdd = () => {
    setEditingPage(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (page: StaticPage) => {
    setEditingPage(page);
    setForm({
      title: page.title,
      titleEn: page.titleEn,
      slug: page.slug,
      content: page.content,
      contentEn: page.contentEn,
      isPublished: page.isPublished,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.titleEn || !form.slug) return;
    setSaving(true);
    try {
      if (editingPage) {
        const res = await fetch(`/api/cms/pages/${editingPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setPages((prev) => prev.map((p) => (p.id === editingPage.id ? { ...p, ...form, updatedAt: new Date().toISOString() } : p)));
        }
      } else {
        const res = await fetch('/api/cms/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setPages((prev) => [...prev, { ...form, id: data.data.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
        }
      }
      setShowModal(false);
    } catch {
      console.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPages((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      console.error('Failed to delete page');
    }
    setDeleteConfirm(null);
  };

  const togglePublish = async (id: string) => {
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    const newPublished = !page.isPublished;
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, isPublished: newPublished } : p)));
    try {
      await fetch(`/api/cms/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newPublished }),
      });
    } catch {
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, isPublished: !newPublished } : p)));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
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
        title="إدارة الصفحات"
        subtitle="إضافة وتعديل وحذف الصفحات الثابتة"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'الصفحات' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            إضافة صفحة
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الصفحات', value: stats.total, color: '#2580eb' },
          { label: 'منشورة', value: stats.published, color: '#14b8a6' },
          { label: 'مسودات', value: stats.draft, color: '#7c3aed' },
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
                    <File size={18} style={{ color: stat.color }} />
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

      <div className="relative max-w-md">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في الصفحات..."
          className={cn(inputClass, 'pr-10')}
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                  العنوان
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                  الرابط
                </th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                  الحالة
                </th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                  التاريخ
                </th>
                <th className="text-center px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page, i) => (
                <motion.tr
                  key={page.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                        <Globe size={16} className="text-[#2580eb]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{page.title}</p>
                        <p className="text-xs text-slate-400">{page.titleEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => togglePublish(page.id)}>
                      <Badge variant={page.isPublished ? 'success' : 'warning'} size="sm" dot>
                        {page.isPublished ? 'منشور' : 'مسودة'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {formatDate(page.updatedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => togglePublish(page.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                        title={page.isPublished ? 'إلغاء النشر' : 'نشر'}
                      >
                        {page.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => openEdit(page)}
                        className="p-1.5 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(page.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <File size={48} className="mx-auto mb-3 opacity-30" />
                    <p>لا توجد صفحات</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingPage ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'}
          </h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان (عربي) *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="عنوان الصفحة بالعربي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان (إنجليزي) *
                </label>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => {
                    const titleEn = e.target.value;
                    setForm({
                      ...form,
                      titleEn,
                      slug: editingPage ? form.slug : generateSlug(titleEn),
                    });
                  }}
                  className={inputClass}
                  placeholder="Page title in English"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                الرابط (Slug) *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
                className={cn(inputClass, 'font-mono')}
                placeholder="about-us"
                dir="ltr"
              />
              <p className="mt-1 text-xs text-slate-400">
                /pages/{form.slug || '...'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                المحتوى (عربي)
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                className={cn(inputClass, 'resize-none')}
                placeholder="محتوى الصفحة بالعربي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                المحتوى (إنجليزي)
              </label>
              <textarea
                value={form.contentEn}
                onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                rows={5}
                className={cn(inputClass, 'resize-none')}
                placeholder="Page content in English"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">نشر الصفحة</p>
                <p className="text-xs text-slate-500">عرض الصفحة للمستخدمين</p>
              </div>
              <button
                onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.isPublished ? 'bg-[#2580eb]' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    form.isPublished ? 'translate-x-1 rtl:-translate-x-1' : 'translate-x-0.5 rtl:-translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!form.title || !form.titleEn || !form.slug || saving}
            iconLeft={saving ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
          >
            {editingPage ? 'حفظ التعديلات' : 'إضافة الصفحة'}
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
              حذف الصفحة
            </h3>
            <p className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذه الصفحة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" fullWidth onClick={() => setDeleteConfirm(null)}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            iconLeft={<Trash2 size={14} />}
          >
            حذف
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
