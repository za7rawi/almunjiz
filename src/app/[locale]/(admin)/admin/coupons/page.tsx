'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Percent,
  Calendar,
  Hash,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

const coupons = [
  { id: '1', code: 'WELCOME10', discount: 10, type: 'percentage' as const, usedCount: 45, maxUses: 100, expiry: '2026-12-31', isActive: true },
  { id: '2', code: 'RAMADAN50', discount: 50, type: 'fixed' as const, usedCount: 23, maxUses: 50, expiry: '2026-04-30', isActive: false },
  { id: '3', code: 'SUMMER25', discount: 25, type: 'percentage' as const, usedCount: 67, maxUses: 200, expiry: '2026-09-30', isActive: true },
  { id: '4', code: 'VIP100', discount: 100, type: 'fixed' as const, usedCount: 12, maxUses: 20, expiry: '2026-08-15', isActive: true },
  { id: '5', code: 'NEWHOME15', discount: 15, type: 'percentage' as const, usedCount: 0, maxUses: 500, expiry: '2027-01-01', isActive: true },
  { id: '6', code: 'FREESHIP', discount: 30, type: 'fixed' as const, usedCount: 89, maxUses: 150, expiry: '2026-06-30', isActive: false },
];

export default function CouponsPage() {
  const { language } = useLanguageStore();
  const [couponsList, setCouponsList] = useState(coupons);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<typeof coupons[0] | null>(null);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percentage', maxUses: '', expiry: '' });

  const filtered = useMemo(() => {
    return couponsList.filter((c) => {
      return !searchQuery || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, couponsList]);

  const toggleActive = (id: string) => {
    setCouponsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = (id: string) => {
    setCouponsList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveCoupon = () => {
    if (editCoupon) {
      setCouponsList((prev) =>
        prev.map((c) =>
          c.id === editCoupon.id
            ? { ...c, code: newCoupon.code, discount: Number(newCoupon.discount), type: newCoupon.type as 'percentage' | 'fixed', maxUses: Number(newCoupon.maxUses), expiry: newCoupon.expiry }
            : c
        )
      );
    } else {
      setCouponsList((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          code: newCoupon.code,
          discount: Number(newCoupon.discount),
          type: newCoupon.type as 'percentage' | 'fixed',
          usedCount: 0,
          maxUses: Number(newCoupon.maxUses),
          expiry: newCoupon.expiry,
          isActive: true,
        },
      ]);
    }
    setNewCoupon({ code: '', discount: '', type: 'percentage', maxUses: '', expiry: '' });
    setShowAddModal(false);
    setEditCoupon(null);
  };

  const openEditModal = (coupon: typeof coupons[0]) => {
    setEditCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      discount: String(coupon.discount),
      type: coupon.type,
      maxUses: String(coupon.maxUses),
      expiry: coupon.expiry,
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'ar' ? 'إدارة الكوبونات' : 'Manage Coupons'}
        subtitle={language === 'ar' ? 'إنشاء وتعديل كوبونات الخصم' : 'Create and manage discount coupons'}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: language === 'ar' ? 'الكوبونات' : 'Coupons' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Plus size={16} />}
            onClick={() => { setEditCoupon(null); setNewCoupon({ code: '', discount: '', type: 'percentage', maxUses: '', expiry: '' }); setShowAddModal(true); }}
          >
            {language === 'ar' ? 'إضافة كوبون' : 'Add Coupon'}
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
            placeholder={language === 'ar' ? 'بحث بكود الكوبون...' : 'Search by coupon code...'}
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
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الكود' : 'Code'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الخصم' : 'Discount'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الاستخدام' : 'Usage'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">
                    {language === 'ar' ? 'الانتهاء' : 'Expiry'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'إجراءات' : 'Actions'}
                  </th>
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
                        {coupon.discount}{coupon.type === 'percentage' ? '%' : ' ر.س'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <Badge variant={coupon.type === 'percentage' ? 'primary' : 'info'} size="sm">
                        {coupon.type === 'percentage' ? (language === 'ar' ? 'نسبة مئوية' : 'Percentage') : (language === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6]"
                            style={{ width: `${(coupon.usedCount / coupon.maxUses) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{coupon.usedCount}/{coupon.maxUses}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{coupon.expiry}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={coupon.isActive ? 'success' : 'danger'} size="sm" dot>
                        {coupon.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
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
                          onClick={() => deleteCoupon(coupon.id)}
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
              <p>{language === 'ar' ? 'لا توجد كوبونات' : 'No coupons found'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setEditCoupon(null); }} size="md">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editCoupon
              ? (language === 'ar' ? 'تعديل الكوبون' : 'Edit Coupon')
              : (language === 'ar' ? 'إضافة كوبون جديد' : 'Add New Coupon')}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'كود الكوبون' : 'Coupon Code'}
              </label>
              <input
                type="text"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder={language === 'ar' ? 'مثال: WELCOME10' : 'e.g., WELCOME10'}
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
                  {language === 'ar' ? 'قيمة الخصم' : 'Discount Value'}
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
                  {language === 'ar' ? 'نوع الخصم' : 'Discount Type'}
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
                  <option value="percentage">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</option>
                  <option value="fixed">{language === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'حد الاستخدام الأقصى' : 'Max Uses'}
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
                  {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
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
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSaveCoupon}>
            {editCoupon ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة' : 'Add')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
