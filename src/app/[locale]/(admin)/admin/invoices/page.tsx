'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { StatCard } from '@/components/ui/stat-card';
import { useLanguageStore } from '@/store/language-store';
import { printInvoice } from '@/lib/print-invoice';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  email: string;
  service: string;
  amount: number;
  tax: number;
  total: number;
  notes: string;
  dueDate: string;
  date: string;
  status: InvoiceStatus;
}

type FilterStatus = 'ALL' | InvoiceStatus;

const STATUS_MAP: Record<string, InvoiceStatus> = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export default function InvoicesPage() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const statusConfig: Record<InvoiceStatus, { label: string; labelEn: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = useMemo(() => ({
    paid: { label: 'مدفوعة', labelEn: 'Paid', variant: 'success' },
    pending: { label: 'معلقة', labelEn: 'Pending', variant: 'warning' },
    overdue: { label: 'متأخرة', labelEn: 'Overdue', variant: 'danger' },
    cancelled: { label: 'ملغاة', labelEn: 'Cancelled', variant: 'secondary' },
  }), []);

  const emptyForm = {
    customer: '',
    email: '',
    service: '',
    amount: '',
    tax: '',
    notes: '',
    dueDate: '',
    status: 'pending' as InvoiceStatus,
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices?limit=100');
      const json = await res.json();
      if (json.success && json.data) {
        const mapped: Invoice[] = json.data.map((inv: Record<string, unknown>) => {
          const user = inv.user as { name?: string; email?: string; phone?: string } | null;
          const order = inv.order as { orderNumber?: string; serviceName?: string; service?: { name?: string } } | null;
          return {
            id: inv.id as string,
            invoiceNumber: inv.invoiceNumber as string,
            customer: user?.name || '',
            email: user?.email || '',
            service: order?.service?.name || order?.serviceName || '',
            amount: Number(inv.subtotal ?? inv.amount ?? 0),
            tax: Number(inv.tax ?? 0),
            total: Number(inv.total ?? 0),
            notes: (inv.notes as string) || '',
            dueDate: inv.dueDate ? new Date(inv.dueDate as string).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : '',
            date: inv.createdAt ? new Date(inv.createdAt as string).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : '',
            status: STATUS_MAP[inv.status as string] || 'pending',
          };
        });
        setInvoices(mapped);
      }
    } catch {
      toast.error(isAr ? 'فشل تحميل الفواتير' : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    const load = () => fetchInvoices();
    load();
    const interval = setInterval(fetchInvoices, 30000);
    return () => clearInterval(interval);
  }, [fetchInvoices]);

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [viewTarget, setViewTarget] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === 'paid');
    const pendingAmount = invoices
      .filter((i) => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);
    const paidAmount = paid.reduce((sum, i) => sum + i.total, 0);
    return { total, paidCount: paid.length, pendingAmount, paidAmount };
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesFilter = activeFilter === 'ALL' || inv.status === activeFilter;
      const matchesSearch =
        !searchQuery ||
        inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    }, [invoices, activeFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filterTabs: { id: FilterStatus; label: string; count: number }[] = useMemo(
    () => [
      { id: 'ALL', label: isAr ? 'الكل' : 'All', count: invoices.length },
      { id: 'paid', label: isAr ? 'مدفوعة' : 'Paid', count: invoices.filter((i) => i.status === 'paid').length },
      { id: 'pending', label: isAr ? 'معلقة' : 'Pending', count: invoices.filter((i) => i.status === 'pending').length },
      { id: 'overdue', label: isAr ? 'متأخرة' : 'Overdue', count: invoices.filter((i) => i.status === 'overdue').length },
      { id: 'cancelled', label: isAr ? 'ملغاة' : 'Cancelled', count: invoices.filter((i) => i.status === 'cancelled').length },
    ],
    [invoices, isAr],
  );

  const openAddModal = () => {
    setEditInvoice(null);
    setForm(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (inv: Invoice) => {
    setEditInvoice(inv);
    setForm({
      customer: inv.customer,
      email: inv.email,
      service: inv.service,
      amount: String(inv.amount),
      tax: String(inv.tax),
      notes: inv.notes,
      dueDate: inv.dueDate,
      status: inv.status,
    });
    setShowFormModal(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount) || 0;

    try {
      if (editInvoice) {
        const res = await fetch(`/api/invoices/${editInvoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: form.status.toUpperCase(),
            dueDate: form.dueDate || null,
            amount,
            tax: 0,
          }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: form.customer,
            email: form.email,
            service: form.service,
            amount,
            tax: 0,
            notes: form.notes,
            dueDate: form.dueDate || null,
            status: form.status.toUpperCase(),
          }),
        });
        if (!res.ok) throw new Error('Failed to create');
      }
      await fetchInvoices();
    } catch {
      toast.error(isAr ? 'فشل حفظ الفاتورة' : 'Failed to save invoice');
    }
    setShowFormModal(false);
    setEditInvoice(null);
    setForm(emptyForm);
  };

  const confirmDelete = (inv: Invoice) => {
    setDeleteTarget(inv);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await fetch(`/api/invoices/${deleteTarget.id}`, { method: 'DELETE' });
        await fetchInvoices();
      } catch {
        toast.error(isAr ? 'فشل حذف الفاتورة' : 'Failed to delete invoice');
      }
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleView = (inv: Invoice) => {
    setViewTarget(inv);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'إدارة الفواتير' : 'Manage Invoices'}
        subtitle={isAr ? 'متابعة وإدارة جميع الفواتير' : 'Track and manage all invoices'}
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'الفواتير' : 'Invoices' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAddModal}>
            {isAr ? 'إضافة فاتورة' : 'Add Invoice'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<FileText size={20} />}
          value={stats.total}
          label={isAr ? 'إجمالي الفواتير' : 'Total Invoices'}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={stats.paidCount}
          label={isAr ? 'الفواتير المدفوعة' : 'Paid Invoices'}
        />
        <StatCard
          icon={<Clock size={20} />}
          value={Math.round(stats.pendingAmount)}
          label={isAr ? 'المبلغ المعلق / المتأخر' : 'Pending / Overdue Amount'}
          suffix={isAr ? ' ر.س' : ' SAR'}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder={isAr ? 'بحث بالاسم، رقم الفاتورة، أو الخدمة...' : 'Search by name, invoice ID, or service...'}
            className={cn(
              'w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200',
              'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400',
              'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            )}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filterTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setActiveFilter(tab.id); setCurrentPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeFilter === tab.id
                ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                activeFilter === tab.id
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
                    {isAr ? 'رقم الفاتورة' : 'Invoice #'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {isAr ? 'العميل' : 'Customer'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                    {isAr ? 'الخدمة' : 'Service'}
                  </th>
                  <th className="text-end py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">
                    {isAr ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-end py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {isAr ? 'الإجمالي' : 'Total'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {isAr ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">
                    {isAr ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {isAr ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((inv) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-medium text-[#2580eb]">{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {inv.customer.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">{inv.customer}</span>
                          <p className="text-xs text-slate-400 hidden sm:block">{inv.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{inv.service}</td>
                    <td className="py-3 px-4 text-end text-slate-700 dark:text-slate-200 hidden lg:table-cell">{inv.amount.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</td>
                    <td className="py-3 px-4 text-end font-bold text-slate-900 dark:text-white">{inv.total.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={statusConfig[inv.status]?.variant || 'secondary'} size="sm" dot>
                        {isAr ? statusConfig[inv.status]?.label : statusConfig[inv.status]?.labelEn}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{inv.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleView(inv)}
                          className="p-2 rounded-lg hover:bg-[#14b8a6]/10 text-[#14b8a6] transition-colors"
                          title={isAr ? 'عرض' : 'View'}
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => printInvoice({
                            invoiceNumber: inv.invoiceNumber,
                            customer: inv.customer,
                            email: inv.email,
                            service: inv.service,
                            amount: inv.amount,
                            tax: inv.tax,
                            discount: 0,
                            total: inv.total,
                            notes: inv.notes,
                            dueDate: inv.dueDate,
                            date: inv.date,
                            status: inv.status,
                          })}
                          className="p-2 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-colors"
                          title={isAr ? 'طباعة' : 'Print'}
                        >
                          <Printer size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(inv)}
                          className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                          title={isAr ? 'تعديل' : 'Edit'}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => confirmDelete(inv)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title={isAr ? 'حذف' : 'Delete'}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-white/5">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-50 dark:text-slate-300"
                >
                  {isAr ? 'السابق' : 'Previous'}
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-50 dark:text-slate-300"
                >
                  {isAr ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>{loading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'لا توجد فواتير' : 'No invoices found')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showFormModal} onClose={() => { setShowFormModal(false); setEditInvoice(null); }} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editInvoice
              ? (isAr ? 'تعديل الفاتورة' : 'Edit Invoice')
              : (isAr ? 'إضافة فاتورة جديدة' : 'Add New Invoice')}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'اسم العميل' : 'Customer Name'}
                </label>
                <input
                  type="text"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  placeholder={isAr ? 'اسم العميل' : 'Customer name'}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'الخدمة' : 'Service'}
              </label>
              <input
                type="text"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder={isAr ? 'نوع الخدمة' : 'Service type'}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'المبلغ' : 'Amount'}
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'تاريخ الاستحقاق' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                >
                  <option value="paid">{isAr ? 'مدفوعة' : 'Paid'}</option>
                  <option value="pending">{isAr ? 'معلقة' : 'Pending'}</option>
                  <option value="overdue">{isAr ? 'متأخرة' : 'Overdue'}</option>
                  <option value="cancelled">{isAr ? 'ملغاة' : 'Cancelled'}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={isAr ? 'ملاحظات إضافية...' : 'Additional notes...'}
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30 resize-none"
              />
            </div>
            {form.amount && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {parseFloat(form.amount || '0').toFixed(2)} {isAr ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowFormModal(false); setEditInvoice(null); }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            {editInvoice ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة' : 'Add')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} size="sm">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {isAr
              ? `هل أنت متأكد من حذف الفاتورة "${deleteTarget?.invoiceNumber}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete invoice "${deleteTarget?.invoiceNumber}"? This action cannot be undone.`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {isAr ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showDetailModal} onClose={() => { setShowDetailModal(false); setViewTarget(null); }} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isAr ? 'تفاصيل الفاتورة' : 'Invoice Details'}
          </h3>
        </ModalHeader>
        <ModalBody>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                <div>
                  <p className="text-xs text-slate-400">{isAr ? 'رقم الفاتورة' : 'Invoice Number'}</p>
                  <p className="font-mono font-bold text-[#2580eb]">{viewTarget.invoiceNumber}</p>
                </div>
                <Badge variant={statusConfig[viewTarget.status]?.variant || 'secondary'}>
                  {isAr ? statusConfig[viewTarget.status]?.label : statusConfig[viewTarget.status]?.labelEn}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <FileText size={18} className="text-[#2580eb] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{isAr ? 'العميل' : 'Customer'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.customer}</p>
                    <p className="text-xs text-slate-500">{viewTarget.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <FileText size={18} className="text-[#14b8a6] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{isAr ? 'الخدمة' : 'Service'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.service}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <DollarSign size={18} className="text-[#7c3aed] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{isAr ? 'المبلغ' : 'Amount'}</p>
                    <p className="text-slate-900 dark:text-white">{viewTarget.amount.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Clock size={18} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Clock size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.date}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[#2580eb]/5 to-[#7c3aed]/5 border border-[#2580eb]/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{viewTarget.total.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                </div>
              </div>

              {viewTarget.notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                    {isAr ? 'ملاحظات' : 'Notes'}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{viewTarget.notes}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowDetailModal(false); setViewTarget(null); }}>
            {isAr ? 'إغلاق' : 'Close'}
          </Button>
          {viewTarget && (
            <Button
              variant="primary"
              iconLeft={<Printer size={16} />}
              onClick={() => {
                printInvoice({
                  invoiceNumber: viewTarget.invoiceNumber,
                  customer: viewTarget.customer,
                  email: viewTarget.email,
                  service: viewTarget.service,
                  amount: viewTarget.amount,
                  tax: viewTarget.tax,
                  discount: 0,
                  total: viewTarget.total,
                  notes: viewTarget.notes,
                  dueDate: viewTarget.dueDate,
                  date: viewTarget.date,
                  status: viewTarget.status,
                });
              }}
            >
              {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
