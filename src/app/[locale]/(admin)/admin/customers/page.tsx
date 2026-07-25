'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Eye, UserCheck, UserX, Mail, Phone, Calendar, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

interface ApiOrder {
  id: string; customerEmail: string; total: number;
}

interface ApiUser {
  id: string; name: string; email: string; phone: string; role: string; avatar: string | null; createdAt: Date | string;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'BLOCKED';

type CustomerRow = { id: string; name: string; email: string; phone: string; orders: number; totalSpent: number; joinDate: string; status: 'ACTIVE' | 'BLOCKED' };

const statusTabs: { id: StatusFilter; label: string; labelEn: string }[] = [
  { id: 'ALL', label: 'الكل', labelEn: 'All' },
  { id: 'ACTIVE', label: 'نشط', labelEn: 'Active' },
  { id: 'BLOCKED', label: 'محظور', labelEn: 'Blocked' },
];

export default function CustomersPage() {
  const { language } = useLanguageStore();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then((data) => { if (data.success && data.data) setUsers(data.data); }).catch(() => {});
    fetch('/api/orders?limit=100').then((r) => r.json()).then((data) => { if (data.success && data.data) setOrders(data.data); }).catch(() => {});
  }, []);

  const customersList = useMemo<CustomerRow[]>(() => {
    return users.map((u) => {
      const customerOrders = orders.filter((o) => o.customerEmail?.toLowerCase() === u.email.toLowerCase());
      return { id: u.id, name: u.name, email: u.email, phone: u.phone, orders: customerOrders.length, totalSpent: customerOrders.reduce((sum, o) => sum + Number(o.total || 0), 0), joinDate: typeof u.createdAt === 'string' ? u.createdAt : u.createdAt.toISOString(), status: 'ACTIVE' as const };
    });
  }, [users, orders]);

  const filtered = useMemo(() => {
    return customersList.filter((c) => {
      const matchesStatus = activeStatus === 'ALL' || c.status === activeStatus;
      const matchesSearch = !searchQuery || c.name.includes(searchQuery) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, searchQuery, customersList]);

  const stats = useMemo(() => ({ total: customersList.length, active: customersList.filter((c) => c.status === 'ACTIVE').length, blocked: customersList.filter((c) => c.status === 'BLOCKED').length }), [customersList]);

  const statCards = [
    { label: 'إجمالي العملاء', value: stats.total, icon: Users, color: '#2580eb' },
    { label: 'النشطين', value: stats.active, icon: UserCheck, color: '#14b8a6' },
    { label: 'المحظورين', value: stats.blocked, icon: UserX, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={language === 'ar' ? 'إدارة العملاء' : 'Manage Customers'} subtitle={language === 'ar' ? 'عرض وإدارة حسابات العملاء' : 'View and manage customer accounts'} breadcrumbs={[{ label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' }, { label: language === 'ar' ? 'العملاء' : 'Customers' }]} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card glass><CardContent><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p></div><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}><stat.icon size={20} style={{ color: stat.color }} /></div></div></CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={language === 'ar' ? 'بحث بالاسم، البريد، أو الهاتف...' : 'Search by name, email, or phone...'} className={cn('w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200', 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10', 'text-slate-900 dark:text-white placeholder:text-slate-400', 'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30')} />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <motion.button key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveStatus(tab.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200', activeStatus === tab.id ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10')}>
            {language === 'ar' ? tab.label : tab.labelEn}
          </motion.button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden lg:table-cell">{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">{language === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <motion.tr key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">{customer.name.charAt(0)}</div><span className="font-medium text-slate-900 dark:text-white">{customer.name}</span></div></td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{customer.email}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden lg:table-cell">{customer.phone}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white">{customer.orders}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{customer.joinDate}</td>
                    <td className="py-3 px-4 text-center"><Badge variant={customer.status === 'ACTIVE' ? 'success' : 'danger'} size="sm" dot>{customer.status === 'ACTIVE' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'محظور' : 'Blocked')}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setSelectedCustomer(customer); setShowDetailModal(true); }} className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"><Eye size={16} /></motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-12 text-center text-slate-400"><Users size={48} className="mx-auto mb-3 opacity-30" /><p>{language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}</p></div>}
        </CardContent>
      </Card>

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        <ModalHeader><h3 className="text-lg font-bold text-slate-900 dark:text-white">{language === 'ar' ? 'تفاصيل العميل' : 'Customer Details'}</h3></ModalHeader>
        <ModalBody>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#2580eb]/5 to-[#14b8a6]/5 border border-[#2580eb]/10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xl font-bold">{selectedCustomer.name.charAt(0)}</div>
                <div><h4 className="font-bold text-slate-900 dark:text-white text-lg">{selectedCustomer.name}</h4><Badge variant="success" size="sm" dot>{language === 'ar' ? 'نشط' : 'Active'}</Badge></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5"><Mail size={18} className="text-[#2580eb] mt-0.5" /><div><p className="text-xs text-slate-400">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p><p className="font-medium text-slate-900 dark:text-white">{selectedCustomer.email}</p></div></div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5"><Phone size={18} className="text-[#14b8a6] mt-0.5" /><div><p className="text-xs text-slate-400">{language === 'ar' ? 'الهاتف' : 'Phone'}</p><p className="font-medium text-slate-900 dark:text-white">{selectedCustomer.phone}</p></div></div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5"><ShoppingCart size={18} className="text-[#7c3aed] mt-0.5" /><div><p className="text-xs text-slate-400">{language === 'ar' ? 'عدد الطلبات' : 'Orders Count'}</p><p className="font-bold text-slate-900 dark:text-white">{selectedCustomer.orders}</p></div></div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5"><Calendar size={18} className="text-amber-500 mt-0.5" /><div><p className="text-xs text-slate-400">{language === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}</p><p className="font-medium text-slate-900 dark:text-white">{selectedCustomer.joinDate}</p></div></div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter><Button variant="ghost" onClick={() => setShowDetailModal(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button></ModalFooter>
      </Modal>
    </div>
  );
}
