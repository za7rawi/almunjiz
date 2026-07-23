'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';
import { useAdminDataStore, type Banner, type BannerPosition } from '@/store/admin-data-store';

const inputClass =
  'w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30';

const positionLabels: Record<BannerPosition, string> = {
  hero: 'الرئيسية',
  sidebar: 'الشريط الجانبي',
  footer: 'التذييل',
};

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
  const { banners, addBanner, updateBanner, deleteBanner, reorderBanners } = useAdminDataStore();

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => a.order - b.order),
    [banners],
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

  const handleSave = () => {
    if (!form.title || !form.titleEn) return;
    if (editingBanner) {
      updateBanner(editingBanner.id, form);
    } else {
      addBanner(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteBanner(id);
    setDeleteConfirm(null);
  };

  const toggleActive = (id: string) => {
    const banner = banners.find((b) => b.id === id);
    if (banner) {
      updateBanner(id, { isActive: !banner.isActive });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderBanners(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < sortedBanners.length - 1) {
      reorderBanners(index, index + 1);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة البانرات"
        subtitle="إضافة وتعديل وحذف البانرات الإعلانية"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'البانرات' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            إضافة بانر
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي البانرات', value: stats.total, color: '#2580eb' },
          { label: 'نشط', value: stats.active, color: '#14b8a6' },
          { label: 'بانرات رئيسية', value: stats.hero, color: '#2580eb' },
          { label: 'بانرات جانبية', value: stats.sidebar, color: '#14b8a6' },
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
        {sortedBanners.map((banner, i) => (
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
                      onClick={() => handleMoveUp(i)}
                      disabled={i === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(i)}
                      disabled={i === sortedBanners.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(banner.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                      title={banner.isActive ? 'إلغاء التنشيط' : 'تنشيط'}
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
        ))}
        {sortedBanners.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Images size={48} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد بانرات</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}
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
                  placeholder="عنوان البانر بالعربي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان (إنجليزي) *
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
                  العنوان الفرعي (عربي)
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className={inputClass}
                  placeholder="عنوان فرعي للبانر"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان الفرعي (إنجليزي)
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
                رابط الصورة
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
                    alt="معاينة"
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
                رابط التوجيه
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
                  الموقع
                </label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value as BannerPosition })}
                  className={inputClass}
                >
                  <option value="hero">الرئيسية (Hero)</option>
                  <option value="sidebar">الشريط الجانبي (Sidebar)</option>
                  <option value="footer">التذييل (Footer)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  ترتيب العرض
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
                  الحالة
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
                    {form.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
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
            disabled={!form.title || !form.titleEn}
            iconLeft={<Check size={16} />}
          >
            {editingBanner ? 'حفظ التعديلات' : 'إضافة البانر'}
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
              حذف البانر
            </h3>
            <p className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء.
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
