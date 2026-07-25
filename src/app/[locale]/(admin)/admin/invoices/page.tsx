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

const statusConfig: Record<InvoiceStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  paid: { label: 'مدفوعة', variant: 'success' },
  pending: { label: 'معلقة', variant: 'warning' },
  overdue: { label: 'متأخرة', variant: 'danger' },
  cancelled: { label: 'ملغاة', variant: 'secondary' },
};

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

export default function InvoicesPage() {
  const { language } = useLanguageStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices?limit=100');
      const json = await res.json();
      if (json.success && json.data) {
        const mapped: Invoice[] = json.data.map((inv: Record<string, unknown>) => {
          const user = inv.user as { name?: string; email?: string } | null;
          return {
            id: inv.id as string,
            invoiceNumber: inv.invoiceNumber as string,
            customer: user?.name || '',
            email: user?.email || '',
            service: (inv.order as Record<string, unknown>)?.serviceName as string || '',
            amount: Number(inv.subtotal ?? inv.amount ?? 0),
            tax: Number(inv.tax ?? 0),
            total: Number(inv.total ?? 0),
            notes: '',
            dueDate: inv.dueDate ? new Date(inv.dueDate as string).toLocaleDateString('sv-SE') : '',
            date: inv.createdAt ? new Date(inv.createdAt as string).toLocaleDateString('sv-SE') : '',
            status: STATUS_MAP[inv.status as string] || 'pending',
          };
        });
        setInvoices(mapped);
      }
    } catch {
      // API may require auth - show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [viewTarget, setViewTarget] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);

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
        inv.customer.includes(searchQuery) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.service.includes(searchQuery) ||
        inv.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [invoices, activeFilter, searchQuery]);

  const filterTabs: { id: FilterStatus; label: string; count: number }[] = useMemo(
    () => [
      { id: 'ALL', label: language === 'ar' ? 'الكل' : 'All', count: invoices.length },
      { id: 'paid', label: language === 'ar' ? 'مدفوعة' : 'Paid', count: invoices.filter((i) => i.status === 'paid').length },
      { id: 'pending', label: language === 'ar' ? 'معلقة' : 'Pending', count: invoices.filter((i) => i.status === 'pending').length },
      { id: 'overdue', label: language === 'ar' ? 'متأخرة' : 'Overdue', count: invoices.filter((i) => i.status === 'overdue').length },
      { id: 'cancelled', label: language === 'ar' ? 'ملغاة' : 'Cancelled', count: invoices.filter((i) => i.status === 'cancelled').length },
    ],
    [invoices, language],
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

  const handleSave = () => {
    const amount = parseFloat(form.amount) || 0;
    const total = amount;
    const today = new Date().toISOString().split('T')[0];

    if (editInvoice) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editInvoice.id
            ? { ...inv, customer: form.customer, email: form.email, service: form.service, amount, tax: 0, total, notes: form.notes, dueDate: form.dueDate, status: form.status }
            : inv,
        ),
      );
    } else {
      setInvoices((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          invoiceNumber: `INV-LOCAL-${String(prev.length + 1).padStart(3, '0')}`,
          customer: form.customer,
          email: form.email,
          service: form.service,
          amount,
          tax: 0,
          total,
          notes: form.notes,
          dueDate: form.dueDate,
          date: today,
          status: form.status,
        },
      ]);
    }
    setShowFormModal(false);
    setEditInvoice(null);
    setForm(emptyForm);
  };

  const confirmDelete = (inv: Invoice) => {
    setDeleteTarget(inv);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
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
        title={language === 'ar' ? 'إدارة الفواتير' : 'Manage Invoices'}
        subtitle={language === 'ar' ? 'متابعة وإدارة جميع الفواتير' : 'Track and manage all invoices'}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: language === 'ar' ? 'الفواتير' : 'Invoices' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={openAddModal}>
            {language === 'ar' ? 'إضافة فاتورة' : 'Add Invoice'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<FileText size={20} />}
          value={stats.total}
          label={language === 'ar' ? 'إجمالي الفواتير' : 'Total Invoices'}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          value={stats.paidCount}
          label={language === 'ar' ? 'الفواتير المدفوعة' : 'Paid Invoices'}
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          icon={<Clock size={20} />}
          value={Math.round(stats.pendingAmount)}
          label={language === 'ar' ? 'المبلغ المعلق / المتأخر' : 'Pending / Overdue Amount'}
          suffix=" ر.س"
          trend={{ value: 5, isUp: false }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم، رقم الفاتورة، أو الخدمة...' : 'Search by name, invoice ID, or service...'}
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
            onClick={() => setActiveFilter(tab.id)}
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
                    {language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'العميل' : 'Customer'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                    {language === 'ar' ? 'الخدمة' : 'Service'}
                  </th>
                  <th className="text-end py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">
                    {language === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-end py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الإجمالي' : 'Total'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
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
                    <td className="py-3 px-4 text-end text-slate-700 dark:text-slate-200 hidden lg:table-cell">{inv.amount.toFixed(2)} ر.س</td>
                    <td className="py-3 px-4 text-end font-bold text-slate-900 dark:text-white">{inv.total.toFixed(2)} ر.س</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={statusConfig[inv.status]?.variant || 'secondary'} size="sm" dot>
                        {statusConfig[inv.status]?.label || inv.status}
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
                          title={language === 'ar' ? 'عرض' : 'View'}
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
                            total: inv.total,
                            notes: inv.notes,
                            dueDate: inv.dueDate,
                            date: inv.date,
                            status: inv.status,
                          })}
                          className="p-2 rounded-lg hover:bg-[#7c3aed]/10 text-[#7c3aed] transition-colors"
                          title={language === 'ar' ? 'طباعة' : 'Print'}
                        >
                          <Printer size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(inv)}
                          className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                          title={language === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => confirmDelete(inv)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
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
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>{loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'لا توجد فواتير' : 'No invoices found')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showFormModal} onClose={() => { setShowFormModal(false); setEditInvoice(null); }} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editInvoice
              ? (language === 'ar' ? 'تعديل الفاتورة' : 'Edit Invoice')
              : (language === 'ar' ? 'إضافة فاتورة جديدة' : 'Add New Invoice')}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'اسم العميل' : 'Customer Name'}
                </label>
                <input
                  type="text"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  placeholder={language === 'ar' ? 'اسم العميل' : 'Customer name'}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'الخدمة' : 'Service'}
              </label>
              <input
                type="text"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder={language === 'ar' ? 'نوع الخدمة' : 'Service type'}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'المبلغ' : 'Amount'}
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
                  {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
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
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30"
                >
                  <option value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</option>
                  <option value="pending">{language === 'ar' ? 'معلقة' : 'Pending'}</option>
                  <option value="overdue">{language === 'ar' ? 'متأخرة' : 'Overdue'}</option>
                  <option value="cancelled">{language === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30 resize-none"
              />
            </div>
            {form.amount && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {parseFloat(form.amount || '0').toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowFormModal(false); setEditInvoice(null); }}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            {editInvoice ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة' : 'Add')}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }} size="sm">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {language === 'ar'
              ? `هل أنت متأكد من حذف الفاتورة "${deleteTarget?.invoiceNumber}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete invoice "${deleteTarget?.invoiceNumber}"? This action cannot be undone.`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showDetailModal} onClose={() => { setShowDetailModal(false); setViewTarget(null); }} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
          </h3>
        </ModalHeader>
        <ModalBody>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5">
                <div>
                  <p className="text-xs text-slate-400">{language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}</p>
                  <p className="font-mono font-bold text-[#2580eb]">{viewTarget.invoiceNumber}</p>
                </div>
                <Badge variant={statusConfig[viewTarget.status]?.variant || 'secondary'}>
                  {statusConfig[viewTarget.status]?.label || viewTarget.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <FileText size={18} className="text-[#2580eb] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'العميل' : 'Customer'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.customer}</p>
                    <p className="text-xs text-slate-500">{viewTarget.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <FileText size={18} className="text-[#14b8a6] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'الخدمة' : 'Service'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.service}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <DollarSign size={18} className="text-[#7c3aed] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'المبلغ' : 'Amount'}</p>
                    <p className="text-slate-900 dark:text-white">{viewTarget.amount.toFixed(2)} ر.س</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Clock size={18} className="text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Clock size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{viewTarget.date}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[#2580eb]/5 to-[#7c3aed]/5 border border-[#2580eb]/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{viewTarget.total.toFixed(2)} ر.س</span>
                </div>
              </div>

              {viewTarget.notes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                    {language === 'ar' ? 'ملاحظات' : 'Notes'}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{viewTarget.notes}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowDetailModal(false); setViewTarget(null); }}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
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
                  total: viewTarget.total,
                  notes: viewTarget.notes,
                  dueDate: viewTarget.dueDate,
                  date: viewTarget.date,
                  status: viewTarget.status,
                });
              }}
            >
              {language === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
