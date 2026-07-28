'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Images,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Check,
  Link as LinkIcon,
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

type BannerPosition = 'hero' | 'sidebar' | 'footer';

interface Banner {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  image: string;
  link: string;
  position: BannerPosition;
  isActive: boolean;
  order: number;
}

const inputClass =
  'w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30';

const positionBadgeVariant: Record<BannerPosition, 'primary' | 'success' | 'info'> = {
  hero: 'primary',
  sidebar: 'success',
  footer: 'info',
};

const positionGradients: Record<BannerPosition, string> = {
  hero: 'from-[#2580eb]/20 to-[#14b8a6]/20',
  sidebar: 'from-[#14b8a6]/20 to-[#7c3aed]/20',
  footer: 'from-[#7c3aed]/20 to-[#2580eb]/20',
};

const PAGE_SIZE = 12;

const emptyForm: Omit<Banner, 'id'> = {
  title: '',
  titleEn: '',
  subtitle: '',
  subtitleEn: '',
  image: '',
  link: '',
  position: 'hero',
  isActive: true,
  order: 1,
};

export default function AdminBannersPage() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);

  const positionLabels: Record<BannerPosition, string> = {
    hero: isAr ? 'الرئيسية' : 'Hero',
    sidebar: isAr ? 'الشريط الجانبي' : 'Sidebar',
    footer: isAr ? 'التذييل' : 'Footer',
  };

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/banners');
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch {
      toast.error(isAr ? 'فشل تحميل البانرات' : 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => a.order - b.order),
    [banners],
  );

  const totalPages = Math.ceil(sortedBanners.length / PAGE_SIZE);
  const paginatedData = useMemo(
    () => sortedBanners.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedBanners, currentPage],
  );

  const stats = useMemo(() => {
    const active = banners.filter((b) => b.isActive).length;
    const hero = banners.filter((b) => b.position === 'hero').length;
    const sidebar = banners.filter((b) => b.position === 'sidebar').length;
    const footer = banners.filter((b) => b.position === 'footer').length;
    return { total: banners.length, active, hero, sidebar, footer };
  }, [banners]);

  const openAdd = () => {
    setEditingBanner(null);
    setForm({ ...emptyForm, order: banners.length + 1 });
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      titleEn: banner.titleEn,
      subtitle: banner.subtitle,
      subtitleEn: banner.subtitleEn,
      image: banner.image,
      link: banner.link,
      position: banner.position,
      isActive: banner.isActive,
      order: banner.order,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.titleEn) return;
    setSaving(true);
    try {
      if (editingBanner) {
        const res = await fetch(`/api/cms/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? { ...b, ...form } : b)));
        }
      } else {
        const res = await fetch('/api/cms/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          setBanners((prev) => [...prev, { ...form, id: data.data.id }]);
        }
      }
      setShowModal(false);
    } catch {
      toast.error(isAr ? 'فشل حفظ البانر' : 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {
      toast.error(isAr ? 'فشل حذف البانر' : 'Failed to delete banner');
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (!banner) return;
    const newActive = !banner.isActive;
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: newActive } : b)));
    try {
      await fetch(`/api/cms/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
    } catch {
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !newActive } : b)));
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const sorted = [...sortedBanners];
    const item = sorted[index];
    const prevItem = sorted[index - 1];
    const updated = sorted.map((b, i) => {
      if (i === index) return { ...b, order: prevItem.order };
      if (i === index - 1) return { ...b, order: item.order };
      return b;
    });
    setBanners(updated);
    try {
      await fetch(`/api/cms/banners/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: prevItem.order }),
      });
      await fetch(`/api/cms/banners/${prevItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: item.order }),
      });
    } catch {
      fetchBanners();
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index >= sortedBanners.length - 1) return;
    const sorted = [...sortedBanners];
    const item = sorted[index];
    const nextItem = sorted[index + 1];
    const updated = sorted.map((b, i) => {
      if (i === index) return { ...b, order: nextItem.order };
      if (i === index + 1) return { ...b, order: item.order };
      return b;
    });
    setBanners(updated);
    try {
      await fetch(`/api/cms/banners/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: nextItem.order }),
      });
      await fetch(`/api/cms/banners/${nextItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: item.order }),
      });
    } catch {
      fetchBanners();
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
        title={isAr ? 'إدارة البانرات' : 'Banners Management'}
        subtitle={isAr ? 'إضافة وتعديل وحذف البانرات الإعلانية' : 'Add, edit, and delete ad banners'}
        gradient
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'البانرات' : 'Banners' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            {isAr ? 'إضافة بانر' : 'Add Banner'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: isAr ? 'إجمالي البانرات' : 'Total Banners', value: stats.total, color: '#2580eb' },
          { label: isAr ? 'نشط' : 'Active', value: stats.active, color: '#14b8a6' },
          { label: isAr ? 'بانرات رئيسية' : 'Hero Banners', value: stats.hero, color: '#2580eb' },
          { label: isAr ? 'بانرات جانبية' : 'Sidebar Banners', value: stats.sidebar, color: '#14b8a6' },
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
                    <Images size={18} style={{ color: stat.color }} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedData.map((banner, i) => {
          const sortedIndex = sortedBanners.findIndex((b) => b.id === banner.id);
          return (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card padding="none" className="overflow-hidden h-full flex flex-col">
              <div
                className={cn(
                  'h-36 bg-gradient-to-br flex items-center justify-center relative',
                  positionGradients[banner.position],
                )}
              >
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Images size={40} className="text-slate-300 dark:text-slate-600" />
                )}
                <div className="absolute top-3 start-3 flex items-center gap-1.5">
                  <Badge
                    variant={positionBadgeVariant[banner.position]}
                    size="sm"
                    dot
                  >
                    {positionLabels[banner.position]}
                  </Badge>
                </div>
                <div className="absolute top-3 end-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-bold">
                    {banner.order}
                  </span>
                </div>
              </div>

              <CardContent className="flex-1 flex flex-col">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5 line-clamp-1">
                  {banner.title}
                </h3>
                <p className="text-xs text-slate-400 mb-1 line-clamp-1">{banner.titleEn}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 flex-1">
                  {banner.subtitle}
                </p>

                {banner.link && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <LinkIcon size={12} />
                    <span className="line-clamp-1">{banner.link}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(sortedIndex)}
                      disabled={sortedIndex === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title={isAr ? 'تحريك لأعلى' : 'Move up'}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(sortedIndex)}
                      disabled={sortedIndex === sortedBanners.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title={isAr ? 'تحريك لأسفل' : 'Move down'}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(banner.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                      title={banner.isActive ? (isAr ? 'إلغاء التنشيط' : 'Deactivate') : (isAr ? 'تنشيط' : 'Activate')}
                    >
                      {banner.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-1.5 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(banner.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
        {sortedBanners.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Images size={48} className="mx-auto mb-3 opacity-30" />
            <p>{isAr ? 'لا توجد بانرات' : 'No banners found'}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {isAr ? 'السابق' : 'Previous'}
          </Button>
          <span className="text-sm text-slate-500">
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

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingBanner ? (isAr ? 'تعديل البانر' : 'Edit Banner') : (isAr ? 'إضافة بانر جديد' : 'Add New Banner')}
          </h2>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'العنوان (عربي)' : 'Title (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder={isAr ? 'عنوان البانر بالعربي' : 'Banner title in Arabic'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'العنوان (إنجليزي)' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className={inputClass}
                  placeholder="Banner title in English"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className={inputClass}
                  placeholder={isAr ? 'عنوان فرعي للبانر' : 'Banner subtitle'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}
                </label>
                <input
                  type="text"
                  value={form.subtitleEn}
                  onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
                  className={inputClass}
                  placeholder="Subtitle in English"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'رابط الصورة' : 'Image URL'}
              </label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />
              {form.image && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 h-32">
                  <img
                    src={form.image}
                    alt={isAr ? 'معاينة' : 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'رابط التوجيه' : 'Redirect Link'}
              </label>
              <input
                type="text"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className={inputClass}
                placeholder="/services"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الموقع' : 'Position'}
                </label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value as BannerPosition })}
                  className={inputClass}
                >
                  <option value="hero">{isAr ? 'الرئيسية (Hero)' : 'Hero'}</option>
                  <option value="sidebar">{isAr ? 'الشريط الجانبي (Sidebar)' : 'Sidebar'}</option>
                  <option value="footer">{isAr ? 'التذييل (Footer)' : 'Footer'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'ترتيب العرض' : 'Display Order'}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className={inputClass}
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الحالة' : 'Status'}
                </label>
                <div className="flex items-center gap-3 h-[42px] px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      form.isActive ? 'bg-[#2580eb]' : 'bg-slate-300 dark:bg-slate-600',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                        form.isActive
                          ? 'translate-x-1 rtl:-translate-x-1'
                          : 'translate-x-0.5 rtl:-translate-x-0.5',
                      )}
                    />
                  </button>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {form.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
            {editingBanner ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة البانر' : 'Add Banner')}
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
              {isAr ? 'حذف البانر' : 'Delete Banner'}
            </h3>
            <p className="text-sm text-slate-500">
              {isAr ? 'هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this banner? This action cannot be undone.'}
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
