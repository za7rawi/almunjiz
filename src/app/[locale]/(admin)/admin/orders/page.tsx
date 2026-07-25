'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Eye, X, User, Calendar, DollarSign, FileText, Loader2,
  Phone, Mail, CreditCard, Hash, MessageSquare, Paperclip, Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { printInvoice } from '@/lib/print-invoice';
import type { ApiOrder } from '@/types/api-order';
import { cn } from '@/lib/utils';

type OrderStatus = 'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'WAITING_CLIENT' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'danger' | 'info' | 'secondary' }> = {
  PENDING: { label: 'قيد الانتظار', variant: 'warning' },
  UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'info' },
  WAITING_CLIENT: { label: 'بانتظار العميل', variant: 'secondary' },
  IN_PROGRESS: { label: 'جار التنفيذ', variant: 'primary' },
  COMPLETED: { label: 'مكتمل', variant: 'success' },
  DELIVERED: { label: 'تم التسليم', variant: 'success' },
  CANCELLED: { label: 'ملغى', variant: 'danger' },
};

const paymentStatusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' | 'danger' }> = {
  PENDING: { label: 'بانتظار الدفع', variant: 'warning' },
  PROCESSING: { label: 'جار المعالجة', variant: 'primary' },
  PAID: { label: 'مدفوع', variant: 'success' },
  FAILED: { label: 'فشل', variant: 'danger' },
  REFUNDED: { label: 'مسترد', variant: 'warning' },
  CANCELLED: { label: 'ملغي', variant: 'danger' },
};

export default function OrdersPage() {
  const { language } = useLanguageStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    fetch('/api/orders?limit=200')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.data) setOrders(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusTabs = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return [
      { id: 'ALL' as OrderStatus, label: 'الكل', count: counts.ALL },
      { id: 'PENDING' as OrderStatus, label: 'قيد الانتظار', count: counts.PENDING || 0 },
      { id: 'UNDER_REVIEW' as OrderStatus, label: 'قيد المراجعة', count: counts.UNDER_REVIEW || 0 },
      { id: 'IN_PROGRESS' as OrderStatus, label: 'جار التنفيذ', count: counts.IN_PROGRESS || 0 },
      { id: 'COMPLETED' as OrderStatus, label: 'مكتمل', count: counts.COMPLETED || 0 },
      { id: 'DELIVERED' as OrderStatus, label: 'تم التسليم', count: counts.DELIVERED || 0 },
      { id: 'CANCELLED' as OrderStatus, label: 'ملغى', count: counts.CANCELLED || 0 },
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeStatus === 'ALL' || order.status === activeStatus;
      const matchesSearch =
        searchQuery === '' ||
        (order.customerName && order.customerName.includes(searchQuery)) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.service?.name || '').includes(searchQuery) ||
        (order.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerPhone || '').includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, searchQuery, orders]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, internalNotes: internalNotes || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status, ...data.data } : o));
          setSelectedOrder({ ...selectedOrder, status, ...data.data });
        } else {
          setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status } : o));
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch {}
  };

  const handleDownloadInvoice = async (order: ApiOrder) => {
    const invDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';
    printInvoice({
      invoiceNumber: order.invoice?.invoiceNumber || `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      customer: order.customerName || '',
      email: order.customerEmail || '',
      phone: order.customerPhone || '',
      service: order.service?.name || '',
      amount: Number(order.total || 0) - Number(order.tax || 0),
      tax: Number(order.tax || 0),
      total: Number(order.total || 0),
      date: invDate,
      dueDate: invDate,
      status: order.paymentStatus === 'PAID' ? 'paid' : 'pending',
    });
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
            placeholder={language === 'ar' ? 'بحث بالاسم، رقم الطلب، البريد، الجوال...' : 'Search by name, order ID, email, phone...'}
            className={cn(
              'w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200',
              'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400',
              'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            )}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
            <span className={cn('px-1.5 py-0.5 text-xs rounded-full', activeStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500')}>
              {tab.count}
            </span>
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#2580eb]" size={32} /></div>
      ) : (
        <Card>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'رقم الطلب' : 'Order'}</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">{language === 'ar' ? 'الخدمة' : 'Service'}</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">{language === 'ar' ? 'الدفع' : 'Payment'}</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-mono text-xs font-medium text-[#2580eb]">{order.orderNumber}</span>
                          {order.invoice?.invoiceNumber && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.invoice.invoiceNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">{(order.customerName || '?').charAt(0)}</div>
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white block">{order.customerName || '-'}</span>
                            {order.customerPhone && <span className="text-[10px] text-slate-400 block" dir="ltr">{order.customerPhone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden lg:table-cell">{order.service?.name || '-'}</td>
                      <td className="py-3 px-4 text-end font-bold text-slate-900 dark:text-white hidden md:table-cell">{Number(order.total || 0).toLocaleString()} ر.س</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {order.paymentStatus && paymentStatusConfig[order.paymentStatus] ? (
                          <Badge variant={paymentStatusConfig[order.paymentStatus].variant} size="sm">{paymentStatusConfig[order.paymentStatus].label}</Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4"><Badge variant={statusConfig[order.status]?.variant || 'primary'} size="sm">{statusConfig[order.status]?.label || order.status}</Badge></td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</td>
                      <td className="py-3 px-4 text-center">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setSelectedOrder(order); setInternalNotes(order.internalNotes || ''); setShowDetailModal(true); }} className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors">
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
      )}

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        <ModalHeader><h3 className="text-lg font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</h3></ModalHeader>
        <ModalBody>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                <div>
                  <p className="text-xs text-slate-400">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</p>
                  <p className="font-mono font-bold text-[#2580eb]">{selectedOrder.orderNumber}</p>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.paymentStatus && paymentStatusConfig[selectedOrder.paymentStatus] && (
                    <Badge variant={paymentStatusConfig[selectedOrder.paymentStatus].variant}>{paymentStatusConfig[selectedOrder.paymentStatus].label}</Badge>
                  )}
                  <Badge variant={statusConfig[selectedOrder.status]?.variant || 'primary'}>{statusConfig[selectedOrder.status]?.label || selectedOrder.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <User size={18} className="text-[#2580eb] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'العميل' : 'Customer'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.customerName || '-'}</p>
                    {selectedOrder.customerEmail && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail size={10} /> {selectedOrder.customerEmail}</p>
                    )}
                    {selectedOrder.customerPhone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1" dir="ltr"><Phone size={10} /> {selectedOrder.customerPhone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <FileText size={18} className="text-[#14b8a6] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'الخدمة' : 'Service'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedOrder.service?.name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <DollarSign size={18} className="text-[#7c3aed] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'المبلغ' : 'Amount'}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{Number(selectedOrder.total || 0).toLocaleString()} ر.س</p>
                    {Number(selectedOrder.discount || 0) > 0 && <p className="text-[10px] text-green-500">خصم: {Number(selectedOrder.discount || 0).toLocaleString()} ر.س</p>}
                    {Number(selectedOrder.tax || 0) > 0 && <p className="text-[10px] text-slate-400">ضريبة: {Number(selectedOrder.tax || 0).toLocaleString()} ر.س</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Calendar size={18} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'التاريخ' : 'Date'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-[10px] text-slate-400">{new Date(selectedOrder.createdAt).toLocaleTimeString('ar-SA')}</p>
                  </div>
                </div>
              </div>

              {(selectedOrder as ApiOrder & { gateway?: { name: string }; transactionId?: string; paymentMethod?: string }).paymentMethod && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <CreditCard size={18} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</p>
                    <p className="text-sm text-blue-700">{(selectedOrder as ApiOrder & { paymentMethod?: string }).paymentMethod}</p>
                    {(selectedOrder as ApiOrder & { transactionId?: string }).transactionId && (
                      <p className="text-[10px] text-slate-400 mt-1">Transaction: {(selectedOrder as ApiOrder & { transactionId?: string }).transactionId}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <MessageSquare size={18} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">{language === 'ar' ? 'ملاحظات' : 'Notes'}</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                  <Paperclip size={18} className="text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">{language === 'ar' ? 'الملفات المرفقة' : 'Attachments'} ({selectedOrder.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.attachments.map((file: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-white/10 border border-purple-200 dark:border-purple-500/20 text-xs text-purple-700 dark:text-purple-300">
                          <Paperclip size={10} /> {file}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{language === 'ar' ? 'ملاحظات داخلية (للإدارة فقط)' : 'Internal Notes (Admin Only)'}</label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder={language === 'ar' ? 'ملاحظات داخلية لا تظهر للعميل...' : 'Internal notes not visible to customer...'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{language === 'ar' ? 'تحديث الحالة' : 'Update Status'}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <motion.button key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleUpdateStatus(key)} className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all border', selectedOrder.status === key ? 'border-[#2580eb] bg-[#2580eb]/10 text-[#2580eb]' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300')}>
                      {config.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDetailModal(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
          {selectedOrder && (
            <Button variant="primary" onClick={() => handleDownloadInvoice(selectedOrder)}>
              <Download size={14} className="me-1" /> {language === 'ar' ? 'تحميل الفاتورة' : 'Download Invoice'}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
