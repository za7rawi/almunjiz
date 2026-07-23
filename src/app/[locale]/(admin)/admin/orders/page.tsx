'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Eye,
  ChevronDown,
  Filter,
  X,
  User,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

type OrderStatus = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'danger' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  CANCELLED: { label: 'ملغى', variant: 'danger' },
};

const orders = [
  { id: 'AM-XYZ-1234', customer: 'محمد أحمد', customerEmail: 'mohammed@email.com', customerPhone: '+966501234567', service: 'تأشيرة سياحية', status: 'PENDING', amount: 250, date: '2026-07-23', notes: 'يحتاج مراجعة الأوراق' },
  { id: 'AM-ABC-5678', customer: 'خالد سعيد', customerEmail: 'khalid@email.com', customerPhone: '+966507654321', service: 'تسجيل مركبة', status: 'IN_PROGRESS', amount: 300, date: '2026-07-22', notes: '' },
  { id: 'AM-DEF-9012', customer: 'فهد العلي', customerEmail: 'fahad@email.com', customerPhone: '+966509876543', service: 'عقد إيجار', status: 'COMPLETED', amount: 200, date: '2026-07-22', notes: '' },
  { id: 'AM-GHI-3456', customer: 'أحمد الشمري', customerEmail: 'ahmed@email.com', customerPhone: '+966502345678', service: 'تأشيرة عمل', status: 'PENDING', amount: 450, date: '2026-07-21', notes: 'في انتظار الموافقة' },
  { id: 'AM-JKL-7890', customer: 'سعد الدوسري', customerEmail: 'saad@email.com', customerPhone: '+966503456789', service: 'ترجمة وثائق', status: 'IN_PROGRESS', amount: 180, date: '2026-07-21', notes: '' },
  { id: 'AM-MNO-1122', customer: 'عبدالله القحطاني', customerEmail: 'abdullah@email.com', customerPhone: '+966504567890', service: 'تأمين مركبة', status: 'COMPLETED', amount: 350, date: '2026-07-20', notes: '' },
  { id: 'AM-PQR-3344', customer: 'يوسف العتيبي', customerEmail: 'yousef@email.com', customerPhone: '+966505678901', service: 'تجديد إقامة', status: 'CANCELLED', amount: 400, date: '2026-07-20', notes: 'تم الإلغاء بطلب العميل' },
  { id: 'AM-STU-5566', customer: 'سلطان المطيري', customerEmail: 'sultan@email.com', customerPhone: '+966506789012', service: 'استخراج شهادة', status: 'PENDING', amount: 150, date: '2026-07-19', notes: '' },
];

const statusTabs: { id: OrderStatus; label: string; count: number }[] = [
  { id: 'ALL', label: 'الكل', count: 8 },
  { id: 'PENDING', label: 'قيد الانتظار', count: 3 },
  { id: 'IN_PROGRESS', label: 'جار التنفيذ', count: 2 },
  { id: 'COMPLETED', label: 'مكتمل', count: 2 },
  { id: 'CANCELLED', label: 'ملغى', count: 1 },
];

export default function OrdersPage() {
  const { language } = useLanguageStore();
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeStatus === 'ALL' || order.status === activeStatus;
      const matchesSearch =
        searchQuery === '' ||
        order.customer.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.service.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, searchQuery]);

  const handleViewDetail = (order: typeof orders[0]) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}
        subtitle={language === 'ar' ? 'متابعة وإدارة جميع الطلبات' : 'Track and manage all orders'}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: language === 'ar' ? 'الطلبات' : 'Orders' },
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم، رقم الطلب، أو الخدمة...' : 'Search by name, order ID, or service...'}
            className={cn(
              'w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200',
              'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400',
              'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {statusTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveStatus(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeStatus === tab.id
                ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                activeStatus === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500',
              )}
            >
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'رقم الطلب' : 'Order ID'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'العميل' : 'Customer'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                    {language === 'ar' ? 'الخدمة' : 'Service'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="text-end py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-medium text-[#2580eb]">{order.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {order.customer.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{order.customer}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{order.service}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusConfig[order.status]?.variant || 'primary'} size="sm">
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{order.date}</td>
                    <td className="py-3 px-4 text-end font-bold text-slate-900 dark:text-white">{order.amount} ر.س</td>
                    <td className="py-3 px-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetail(order)}
                        className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                      >
                        <Eye size={16} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p>{language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
          </h3>
        </ModalHeader>
        <ModalBody>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                <div>
                  <p className="text-xs text-slate-400">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</p>
                  <p className="font-mono font-bold text-[#2580eb]">{selectedOrder.id}</p>
                </div>
                <Badge variant={statusConfig[selectedOrder.status]?.variant || 'primary'}>
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <User size={18} className="text-[#2580eb] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'العميل' : 'Customer'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customer}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.customerEmail}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <FileText size={18} className="text-[#14b8a6] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'الخدمة' : 'Service'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.service}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <DollarSign size={18} className="text-[#7c3aed] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'المبلغ' : 'Amount'}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.amount} ر.س</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Calendar size={18} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.date}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                        selectedOrder.status === key
                          ? 'border-[#2580eb] bg-[#2580eb]/10 text-[#2580eb]'
                          : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      {config.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
          <Button>
            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
