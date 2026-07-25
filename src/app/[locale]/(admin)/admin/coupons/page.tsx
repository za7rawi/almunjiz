'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  maxUses?: number;
  usedCount: number;
  minAmount?: number;
  isActive: boolean;
  expiresAt?: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percentage', maxUses: '', expiry: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/coupons');
      const data = await res.json();
      if (data.success) setCoupons(data.data);
    } catch {
      console.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      return !searchQuery || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, coupons]);

  const handleSaveCoupon = async () => {
    setSaving(true);
    try {
      if (editCoupon) {
        const res = await fetch(`/api/cms/coupons/${editCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: newCoupon.code,
            discount: Number(newCoupon.discount),
            discountType: newCoupon.type as 'percentage' | 'fixed',
            maxUses: Number(newCoupon.maxUses),
            expiresAt: newCoupon.expiry,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCoupons((prev) => prev.map((c) =>
            c.id === editCoupon.id
              ? { ...c, code: newCoupon.code, discount: Number(newCoupon.discount), discountType: newCoupon.type as 'percentage' | 'fixed', maxUses: Number(newCoupon.maxUses), expiresAt: newCoupon.expiry }
              : c
          ));
        }
      } else {
        const res = await fetch('/api/cms/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: newCoupon.code,
            discount: Number(newCoupon.discount),
            discountType: newCoupon.type as 'percentage' | 'fixed',
            maxUses: Number(newCoupon.maxUses),
            expiresAt: newCoupon.expiry,
            isActive: true,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCoupons((prev) => [...prev, data.data]);
        }
      }
      setNewCoupon({ code: '', discount: '', type: 'percentage', maxUses: '', expiry: '' });
      setShowAddModal(false);
      setEditCoupon(null);
    } catch {
      console.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      discount: String(coupon.discount),
      type: coupon.discountType,
      maxUses: String(coupon.maxUses ?? ''),
      expiry: coupon.expiresAt ?? '',
    });
    setShowAddModal(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/cms/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      console.error('Failed to delete coupon');
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const newActive = !coupon.isActive;
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: newActive } : c)));
    try {
      await fetch(`/api/cms/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
    } catch {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !newActive } : c)));
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
        title="إدارة الكوبونات"
        subtitle="إنشاء وتعديل كوبونات الخصم"
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/admin' },
          { label: 'الكوبونات' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Plus size={16} />}
            onClick={() => { setEditCoupon(null); setNewCoupon({ code: '', discount: '', type: 'percentage', maxUses: '', expiry: '' }); setShowAddModal(true); }}
          >
            إضافة كوبون
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بكود الكوبون..."
            className={cn(
              'w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200',
              'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400',
              'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            )}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">الكود</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">الخصم</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">النوع</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">الاستخدام</th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">الانتهاء</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">الحالة</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coupon, i) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-2.5 py-1 rounded-lg text-xs">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {coupon.discount}{coupon.discountType === 'percentage' ? '%' : ' ر.س'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <Badge variant={coupon.discountType === 'percentage' ? 'primary' : 'info'} size="sm">
                        {coupon.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6]"
                            style={{ width: `${coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{coupon.usedCount}/{coupon.maxUses ?? '∞'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{coupon.expiresAt}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={coupon.isActive ? 'success' : 'danger'} size="sm" dot>
                        {coupon.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(coupon)}
                          className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleActive(coupon.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                          {coupon.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteConfirm(coupon.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Ticket size={48} className="mx-auto mb-3 opacity-30" />
              <p>لا توجد كوبونات</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setEditCoupon(null); }} size="md">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                كود الكوبون
              </label>
              <input
                type="text"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder="مثال: WELCOME10"
                className={cn(
                  'w-full px-4 py-2.5 text-sm font-mono rounded-xl transition-all duration-200',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white placeholder:text-slate-400',
                  'focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30',
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  قيمة الخصم
                </label>
                <input
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                  placeholder="0"
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30',
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع الخصم
                </label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white',
                    'focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30',
                  )}
                >
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  حد الاستخدام الأقصى
                </label>
                <input
                  type="number"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                  placeholder="100"
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white placeholder:text-slate-400',
                    'focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30',
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  value={newCoupon.expiry}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                    'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                    'text-slate-900 dark:text-white',
                    'focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30',
                  )}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowAddModal(false); setEditCoupon(null); }}>
            إلغاء
          </Button>
          <Button onClick={handleSaveCoupon} disabled={saving} iconLeft={saving ? <Loader2 size={16} className="animate-spin" /> : undefined}>
            {editCoupon ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} size="sm">
        <ModalBody>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">حذف الكوبون</h3>
            <p className="text-sm text-slate-500">هل أنت متأكد من حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>إلغاء</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDeleteCoupon(deleteConfirm)} iconLeft={<Trash2 size={14} />}>حذف</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
