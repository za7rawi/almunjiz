'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Check,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { toast } from '@/components/ui/toast';

const categoriesAr = ['خدمات', 'عروض', 'أخبار عامة', 'تحديثات', 'فعاليات', 'نصائح'];
const categoriesEn = ['Services', 'Offers', 'General News', 'Updates', 'Events', 'Tips'];

interface NewsArticle {
  id: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  content: string;
  contentEn: string;
  image: string;
  category: string;
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

const PAGE_SIZE = 12;

const emptyForm: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  titleEn: '',
  summary: '',
  summaryEn: '',
  content: '',
  contentEn: '',
  image: '',
  category: 'خدمات',
  isPublished: false,
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'settings'>('basic');
  const [page, setPage] = useState(1);

  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/news');
      const data = await res.json();
      if (data.success) setNews(data.data);
    } catch {
      toast.error(isAr ? 'فشل تحميل الأخبار' : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    const load = () => fetchNews();
    load();
  }, [fetchNews]);

  const filtered = useMemo(() => {
    if (!searchQuery) return news;
    const q = searchQuery.toLowerCase();
    return news.filter(
      (n) =>
        n.title.includes(q) ||
        n.titleEn.toLowerCase().includes(q) ||
        n.category.includes(q)
    );
  }, [news, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const published = news.filter((n) => n.isPublished).length;
    const draft = news.filter((n) => !n.isPublished).length;
    return { total: news.length, published, draft };
  }, [news]);

  const openAdd = () => {
    setEditingNews(null);
    setForm({ ...emptyForm, category: isAr ? 'خدمات' : 'Services' });
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditingNews(article);
    setForm({
      title: article.title,
      titleEn: article.titleEn,
      summary: article.summary,
      summaryEn: article.summaryEn,
      content: article.content,
      contentEn: article.contentEn,
      image: article.image,
      category: article.category,
      isPublished: article.isPublished,
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.titleEn) return;
    setSaving(true);
    try {
      if (editingNews) {
        const res = await fetch(`/api/cms/news/${editingNews.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setNews((prev) => prev.map((n) => (n.id === editingNews.id ? { ...n, ...form, updatedAt: new Date().toISOString() } : n)));
        }
      } else {
        const res = await fetch('/api/cms/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setNews((prev) => [...prev, { ...form, id: data.data.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
        }
      }
      setShowModal(false);
    } catch {
      toast.error(isAr ? 'فشل حفظ الخبر' : 'Failed to save news');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/news/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNews((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      toast.error(isAr ? 'فشل حذف الخبر' : 'Failed to delete news');
    }
    setDeleteConfirm(null);
  };

  const togglePublish = async (id: string) => {
    const article = news.find((n) => n.id === id);
    if (!article) return;
    const newPublished = !article.isPublished;
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, isPublished: newPublished } : n)));
    try {
      await fetch(`/api/cms/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newPublished }),
      });
    } catch {
      setNews((prev) => prev.map((n) => (n.id === id ? { ...n, isPublished: !newPublished } : n)));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  const categories = isAr ? categoriesAr : categoriesEn;

  const tabs = [
    { key: 'basic' as const, label: isAr ? 'المعلومات الأساسية' : 'Basic Info' },
    { key: 'content' as const, label: isAr ? 'المحتوى' : 'Content' },
    { key: 'settings' as const, label: isAr ? 'الإعدادات' : 'Settings' },
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
        title={isAr ? 'إدارة الأخبار' : 'News Management'}
        subtitle={isAr ? 'إضافة وتعديل وحذف الأخبار والمقالات' : 'Add, edit and delete news and articles'}
        gradient
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'الأخبار' : 'News' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            {isAr ? 'إضافة خبر' : 'Add News'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: isAr ? 'إجمالي الأخبار' : 'Total News', value: stats.total, color: '#2580eb' },
          { label: isAr ? 'منشورة' : 'Published', value: stats.published, color: '#14b8a6' },
          { label: isAr ? 'مسودات' : 'Drafts', value: stats.draft, color: '#7c3aed' },
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
                    <Newspaper size={18} style={{ color: stat.color }} />
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
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder={isAr ? 'بحث في الأخبار...' : 'Search news...'}
          className={cn(inputClass, 'pr-10')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedData.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card padding="none" className="overflow-hidden h-full flex flex-col">
              {article.image && (
                <div className="h-40 bg-gradient-to-br from-[#2580eb]/10 to-[#7c3aed]/10 flex items-center justify-center">
                  <Newspaper size={40} className="text-[#2580eb]/30" />
                </div>
              )}
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="info" size="sm">{article.category}</Badge>
                  <button onClick={() => togglePublish(article.id)}>
                    <Badge variant={article.isPublished ? 'success' : 'warning'} size="sm" dot>
                      {article.isPublished ? (isAr ? 'منشور' : 'Published') : (isAr ? 'مسودة' : 'Draft')}
                    </Badge>
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 mb-1 line-clamp-1">{article.titleEn}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 flex-1">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} />
                    {formatDate(article.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublish(article.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                      title={article.isPublished ? (isAr ? 'إلغاء النشر' : 'Unpublish') : (isAr ? 'نشر' : 'Publish')}
                    >
                      {article.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(article)}
                      className="p-1.5 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(article.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Newspaper size={48} className="mx-auto mb-3 opacity-30" />
            <p>{isAr ? 'لا توجد أخبار' : 'No news found'}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {isAr ? 'السابق' : 'Previous'}
          </Button>
          <span className="text-sm text-slate-500">
            {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {isAr ? 'التالي' : 'Next'}
          </Button>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingNews ? (isAr ? 'تعديل الخبر' : 'Edit News') : (isAr ? 'إضافة خبر جديد' : 'Add New News')}
          </h2>
        </ModalHeader>

        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 bg-slate-50 dark:bg-white/5 rounded-xl overflow-x-auto">
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
        </div>

        <ModalBody>
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder={isAr ? 'عنوان الخبر بالعربي' : 'News title in Arabic'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'العنوان (إنجليزي) *' : 'Title (English) *'}
                  </label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className={inputClass}
                    placeholder="News title in English"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'ملخص (عربي)' : 'Summary (Arabic)'}
                </label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  rows={2}
                  className={cn(inputClass, 'resize-none')}
                  placeholder={isAr ? 'ملخص مختصر للخبر' : 'Brief summary in Arabic'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'ملخص (إنجليزي)' : 'Summary (English)'}
                </label>
                <textarea
                  value={form.summaryEn}
                  onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                  rows={2}
                  className={cn(inputClass, 'resize-none')}
                  placeholder="Brief summary in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  className={cn(inputClass, 'resize-none')}
                  placeholder={isAr ? 'محتوى الخبر بالعربي' : 'News content in Arabic'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                </label>
                <textarea
                  value={form.contentEn}
                  onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                  rows={6}
                  className={cn(inputClass, 'resize-none')}
                  placeholder="News content in English"
                />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{isAr ? 'نشر الخبر' : 'Publish News'}</p>
                  <p className="text-xs text-slate-500">{isAr ? 'عرض الخبر للمستخدمين' : 'Show news to users'}</p>
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
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!form.title || !form.titleEn || saving}
            iconLeft={saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          >
            {editingNews ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الخبر' : 'Add News')}
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
              {isAr ? 'حذف الخبر' : 'Delete News'}
            </h3>
            <p className="text-sm text-slate-500">
              {isAr ? 'هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this news? This action cannot be undone.'}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" fullWidth onClick={() => setDeleteConfirm(null)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            iconLeft={<Trash2 size={14} />}
          >
            {isAr ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
