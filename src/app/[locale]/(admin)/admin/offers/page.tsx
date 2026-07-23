'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Percent,
  Calendar,
  Hash,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';
import { useAdminDataStore, type Offer, type DiscountType } from '@/store/admin-data-store';

const inputClass = cn(
  'w-full px-4 py-2.5 text-sm rounded-xl',
  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
  'text-slate-900 dark:text-white placeholder:text-slate-400',
  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30'
);

type OfferFormData = Omit<Offer, 'id' | 'usedCount' | 'createdAt'>;

const emptyForm: OfferFormData = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  discount: 0,
  discountType: 'percentage',
  code: '',
  startDate: '',
  endDate: '',
  maxUses: 100,
  isActive: true,
};

export default function AdminOffersPage() {
  const { language } = useLanguageStore();
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useAdminDataStore();

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<OfferFormData>(emptyForm);

  const stats = useMemo(() => {
    const active = offers.filter((o) => o.isActive).length;
    const expired = offers.filter(
      (o) => new Date(o.endDate) < new Date()
    ).length;
    const totalUsed = offers.reduce((sum, o) => sum + o.usedCount, 0);
    return { total: offers.length, active, expired, totalUsed };
  }, [offers]);

  const openAdd = () => {
    setEditingOffer(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title,
      titleEn: offer.titleEn,
      description: offer.description,
      descriptionEn: offer.descriptionEn,
      discount: offer.discount,
      discountType: offer.discountType,
      code: offer.code,
      startDate: offer.startDate,
      endDate: offer.endDate,
      maxUses: offer.maxUses,
      isActive: offer.isActive,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.titleEn || !form.code) return;
    if (editingOffer) {
      updateOffer(editingOffer.id, form);
    } else {
      addOffer(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteOffer(id);
    setDeleteConfirm(null);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  const getUsagePercent = (offer: Offer) => {
    if (offer.maxUses === 0) return 0;
    return Math.min((offer.usedCount / offer.maxUses) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة العروض"
        subtitle="إضافة وتعديل وحذف العروض والخصومات"
        gradient
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'العروض' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAdd}>
            إضافة عرض
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي العروض', value: stats.total, color: '#2580eb', icon: Tag },
          { label: 'نشطة', value: stats.active, color: '#14b8a6', icon: Eye },
          { label: 'منتهية', value: stats.expired, color: '#7c3aed', icon: EyeOff },
          { label: 'إجمالي الاستخدامات', value: stats.totalUsed, color: '#f59e0b', icon: Hash },
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {offers.map((offer, i) => {
          const usagePercent = getUsagePercent(offer);
          const isExpired = new Date(offer.endDate) < new Date();

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card padding="none" className="overflow-hidden h-full flex flex-col">
                <div className="h-28 bg-gradient-to-br from-[#2580eb]/10 via-[#14b8a6]/10 to-[#7c3aed]/10 flex items-center justify-center relative">
                  <div className="text-center">
                    <p className="text-3xl font-black text-[#2580eb]">
                      {offer.discountType === 'percentage' ? `${offer.discount}%` : `${offer.discount} ر.س`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {offer.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button onClick={() => toggleOfferActive(offer.id)}>
                      <Badge variant={offer.isActive ? 'success' : isExpired ? 'danger' : 'warning'} size="sm" dot>
                        {offer.isActive ? 'نشط' : isExpired ? 'منتهي' : 'معطل'}
                      </Badge>
                    </button>
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {offer.title}
                    </h3>
                    <Badge variant="primary" size="sm" className="shrink-0">
                      <Hash size={10} />
                      {offer.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-1 line-clamp-1">{offer.titleEn}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 flex-1">
                    {offer.description}
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar size={12} />
                      <span>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Percent size={12} />
                      <span>{offer.usedCount} / {offer.maxUses} استخدام</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          usagePercent >= 90
                            ? 'bg-red-500'
                            : usagePercent >= 60
                            ? 'bg-amber-500'
                            : 'bg-[#2580eb]'
                        )}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={() => toggleOfferActive(offer.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
                      title={offer.isActive ? 'إلغاء التنشيط' : 'تنشيط'}
                    >
                      {offer.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(offer)}
                      className="p-1.5 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(offer.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {offers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Tag size={48} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد عروض</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
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
                  placeholder="عنوان العرض بالعربي"
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
                  placeholder="Offer title in English"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                الوصف (عربي)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className={cn(inputClass, 'resize-none')}
                placeholder="وصف العرض"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                الوصف (إنجليزي)
              </label>
              <textarea
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                rows={2}
                className={cn(inputClass, 'resize-none')}
                placeholder="Offer description in English"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع الخصم
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
                  className={inputClass}
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ر.س)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  قيمة الخصم *
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.discount || ''}
                  onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                  className={inputClass}
                  placeholder={form.discountType === 'percentage' ? '25' : '50'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  كود الخصم *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={inputClass}
                  placeholder="SUMMER25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  الحد الأقصى للاستخدامات
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses || ''}
                  onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                  className={inputClass}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ البدء
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">تفعيل العرض</p>
                <p className="text-xs text-slate-500">عرض العرض للمستخدمين</p>
              </div>
              <button
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.isActive ? 'bg-[#2580eb]' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                    form.isActive ? 'translate-x-1 rtl:-translate-x-1' : 'translate-x-0.5 rtl:-translate-x-0.5'
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
            disabled={!form.title || !form.titleEn || !form.code}
          >
            {editingOffer ? 'حفظ التعديلات' : 'إضافة العرض'}
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
              حذف العرض
            </h3>
            <p className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.
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
