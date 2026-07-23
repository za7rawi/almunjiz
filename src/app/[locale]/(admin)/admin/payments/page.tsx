'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Search,
  RotateCcw,
  DollarSign,
  Clock,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

type MethodFilter = 'ALL' | 'mada' | 'visa' | 'mastercard' | 'apple_pay' | 'bank_transfer';
type StatusFilter = 'ALL' | 'completed' | 'pending' | 'refunded';
type PaymentMethod = 'mada' | 'visa' | 'mastercard' | 'apple_pay' | 'bank_transfer';
type PaymentStatus = 'completed' | 'pending' | 'refunded';

interface Payment {
  id: string;
  customer: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

const payments: Payment[] = [
  { id: 'PAY-001', customer: 'محمد أحمد', amount: 2500, method: 'mada', status: 'completed', date: '2026-07-23' },
  { id: 'PAY-002', customer: 'خالد سعيد', amount: 1200, method: 'visa', status: 'completed', date: '2026-07-23' },
  { id: 'PAY-003', customer: 'فهد العلي', amount: 3400, method: 'mastercard', status: 'pending', date: '2026-07-22' },
  { id: 'PAY-004', customer: 'أحمد الشمري', amount: 800, method: 'apple_pay', status: 'completed', date: '2026-07-22' },
  { id: 'PAY-005', customer: 'سعد الدوسري', amount: 5600, method: 'bank_transfer', status: 'completed', date: '2026-07-21' },
  { id: 'PAY-006', customer: 'عبدالله القحطاني', amount: 1500, method: 'mada', status: 'refunded', date: '2026-07-21' },
  { id: 'PAY-007', customer: 'يوسف العتيبي', amount: 2200, method: 'visa', status: 'completed', date: '2026-07-20' },
  { id: 'PAY-008', customer: 'سلطان المطيري', amount: 900, method: 'mastercard', status: 'pending', date: '2026-07-20' },
  { id: 'PAY-009', customer: 'عمر الحربي', amount: 4100, method: 'apple_pay', status: 'completed', date: '2026-07-19' },
  { id: 'PAY-010', customer: 'راشد السبيعي', amount: 750, method: 'bank_transfer', status: 'pending', date: '2026-07-19' },
];

const methodConfig: Record<string, { label: string; labelEn: string; color: string }> = {
  mada: { label: 'مدى', labelEn: 'Mada', color: '#14b8a6' },
  visa: { label: 'فيزا', labelEn: 'Visa', color: '#2580eb' },
  mastercard: { label: 'ماستركارد', labelEn: 'Mastercard', color: '#7c3aed' },
  apple_pay: { label: 'آبل باي', labelEn: 'Apple Pay', color: '#1a1a1a' },
  bank_transfer: { label: 'تحويل بنكي', labelEn: 'Bank Transfer', color: '#f59e0b' },
};

const statusConfig: Record<string, { label: string; labelEn: string; variant: 'success' | 'warning' | 'danger' }> = {
  completed: { label: 'مكتمل', labelEn: 'Completed', variant: 'success' },
  pending: { label: 'قيد المراجعة', labelEn: 'Pending', variant: 'warning' },
  refunded: { label: 'مسترجع', labelEn: 'Refunded', variant: 'danger' },
};

const methodTabs: { id: MethodFilter; label: string; labelEn: string }[] = [
  { id: 'ALL', label: 'الكل', labelEn: 'All' },
  { id: 'mada', label: 'مدى', labelEn: 'Mada' },
  { id: 'visa', label: 'فيزا', labelEn: 'Visa' },
  { id: 'mastercard', label: 'ماستركارد', labelEn: 'MC' },
  { id: 'apple_pay', label: 'آبل باي', labelEn: 'Apple Pay' },
  { id: 'bank_transfer', label: 'تحويل بنكي', labelEn: 'Bank' },
];

export default function PaymentsPage() {
  const { language } = useLanguageStore();
  const [activeMethod, setActiveMethod] = useState<MethodFilter>('ALL');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentsList, setPaymentsList] = useState<Payment[]>(payments);

  const filtered = useMemo(() => {
    return paymentsList.filter((p) => {
      const matchesMethod = activeMethod === 'ALL' || p.method === activeMethod;
      const matchesStatus = activeStatus === 'ALL' || p.status === activeStatus;
      const matchesSearch =
        !searchQuery ||
        p.customer.includes(searchQuery) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMethod && matchesStatus && matchesSearch;
    });
  }, [activeMethod, activeStatus, searchQuery, paymentsList]);

  const stats = useMemo(() => ({
    total: paymentsList.reduce((sum, p) => sum + p.amount, 0),
    pending: paymentsList.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    completed: paymentsList.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
  }), [paymentsList]);

  const handleRefund = (id: string) => {
    setPaymentsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'refunded' as const } : p))
    );
  };

  const statCards = [
    { label: 'إجمالي المدفوعات', value: `${stats.total.toLocaleString()} ر.س`, icon: DollarSign, color: '#2580eb' },
    { label: 'قيد المراجعة', value: `${stats.pending.toLocaleString()} ر.س`, icon: Clock, color: '#f59e0b' },
    { label: 'المكتملة', value: `${stats.completed.toLocaleString()} ر.س`, icon: CheckCircle2, color: '#14b8a6' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'ar' ? 'إدارة المدفوعات' : 'Manage Payments'}
        subtitle={language === 'ar' ? 'متابعة جميع المعاملات المالية' : 'Track all financial transactions'}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: language === 'ar' ? 'المدفوعات' : 'Payments' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glass>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم أو رقم الدفع...' : 'Search by name or payment ID...'}
            className={cn(
              'w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200',
              'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400',
              'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            )}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {methodTabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMethod(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeMethod === tab.id
                  ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10',
              )}
            >
              {language === 'ar' ? tab.label : tab.labelEn}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['ALL', 'completed', 'pending', 'refunded'] as StatusFilter[]).map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveStatus(status)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeStatus === status
                  ? 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/25'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10',
              )}
            >
              {status === 'ALL' ? (language === 'ar' ? 'كل الحالات' : 'All Status') : (language === 'ar' ? statusConfig[status]?.label : statusConfig[status]?.labelEn)}
            </motion.button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'رقم الدفع' : 'Payment ID'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'العميل' : 'Customer'}
                  </th>
                  <th className="text-end py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                    {language === 'ar' ? 'الطريقة' : 'Method'}
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
                {filtered.map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-medium text-[#2580eb]">{payment.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {payment.customer.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{payment.customer}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end font-bold text-slate-900 dark:text-white">{payment.amount.toLocaleString()} ر.س</td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${methodConfig[payment.method]?.color}10`,
                          color: methodConfig[payment.method]?.color,
                          borderColor: `${methodConfig[payment.method]?.color}30`,
                        }}
                      >
                        {language === 'ar' ? methodConfig[payment.method]?.label : methodConfig[payment.method]?.labelEn}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={statusConfig[payment.status]?.variant || 'primary'} size="sm" dot>
                        {language === 'ar' ? statusConfig[payment.status]?.label : statusConfig[payment.status]?.labelEn}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{payment.date}</td>
                    <td className="py-3 px-4 text-center">
                      {payment.status === 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRefund(payment.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title={language === 'ar' ? 'استرجاع' : 'Refund'}
                        >
                          <RotateCcw size={16} />
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CreditCard size={48} className="mx-auto mb-3 opacity-30" />
              <p>{language === 'ar' ? 'لا توجد مدفوعات' : 'No payments found'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
