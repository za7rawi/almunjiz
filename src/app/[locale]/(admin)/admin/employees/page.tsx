'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Search, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

type RoleFilter = 'ALL' | 'admin' | 'manager' | 'employee' | 'support' | 'accountant';

type Employee = {
  id: string;
  name: string;
  email: string;
  role: RoleFilter;
  status: 'ACTIVE';
};

const roleConfig: Record<string, { label: string; labelEn: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'; color: string }> = {
  admin: { label: 'مدير', labelEn: 'Admin', variant: 'danger', color: '#ef4444' },
  manager: { label: 'مدير قسم', labelEn: 'Manager', variant: 'primary', color: '#2580eb' },
  employee: { label: 'موظف', labelEn: 'Employee', variant: 'success', color: '#14b8a6' },
  support: { label: 'دعم فني', labelEn: 'Support', variant: 'info', color: '#0ea5e9' },
  accountant: { label: 'محاسب', labelEn: 'Accountant', variant: 'warning', color: '#f59e0b' },
};

const staffRoles = ['admin', 'manager', 'employee', 'support', 'accountant'] as const;

interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  createdAt: Date | string;
}

export default function EmployeesPage() {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [activeRole, setActiveRole] = useState<RoleFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<string>('employee');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.data) setUsers(data.data);
    } catch {
      toast.error(isAr ? 'فشل تحميل الموظفين' : 'Failed to load employees');
    }
  };

  useEffect(() => { fetchUsers(); const interval = setInterval(fetchUsers, 30000); return () => clearInterval(interval); }, []);

  const employeesList = useMemo(() => {
    return users
      .filter((u) => staffRoles.includes((u.role as string) as typeof staffRoles[number]))
      .filter((u) => !removedIds.has(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as RoleFilter,
        status: 'ACTIVE' as const,
      }));
  }, [users, removedIds]);

  const roleTabs = useMemo(() => {
    return [
      { id: 'ALL' as RoleFilter, label: 'الكل', labelEn: 'All', count: employeesList.length },
      ...staffRoles
        .filter((role) => employeesList.some((e) => e.role === role))
        .map((role) => ({
          id: role as RoleFilter,
          label: roleConfig[role].label,
          labelEn: roleConfig[role].labelEn,
          count: employeesList.filter((e) => e.role === role).length,
        })),
    ];
  }, [employeesList]);

  const filtered = useMemo(() => {
    return employeesList.filter((e) => {
      const matchesRole = activeRole === 'ALL' || e.role === activeRole;
      const matchesSearch =
        !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [activeRole, searchQuery, employeesList]);

  useEffect(() => { setCurrentPage(1); }, [activeRole, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const removeEmployee = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch {
      toast.error(isAr ? 'فشل حذف الموظف' : 'Failed to delete employee');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await removeEmployee(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'إدارة الموظفين' : 'Manage Employees'}
        subtitle={isAr ? 'إدارة حسابات وصلاحيات الموظفين' : 'Manage employee accounts and permissions'}
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: isAr ? 'الموظفين' : 'Employees' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={() => { setFormName(''); setFormEmail(''); setFormRole('employee'); setShowAddModal(true); }}>
            {isAr ? 'إضافة موظف' : 'Add Employee'}
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
            placeholder={isAr ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
            className={cn(
              'w-full ps-10 pe-4 py-2.5 text-sm rounded-xl transition-all duration-200',
              'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder:text-slate-400',
              'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
            )}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {roleTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveRole(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeRole === tab.id
                ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10',
            )}
          >
            {isAr ? tab.label : tab.labelEn}
            <span className="text-xs opacity-60">({tab.count})</span>
          </motion.button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الموظف' : 'Employee'}</th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الدور' : 'Role'}</th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((emp, i) => (
                  <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2580eb] flex items-center justify-center text-white text-xs font-bold shrink-0">{emp.name.charAt(0)}</div>
                        <span className="font-medium text-slate-900 dark:text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{emp.email}</td>
                    <td className="py-3 px-4 text-center"><Badge variant={roleConfig[emp.role]?.variant || 'secondary'} size="sm">{isAr ? roleConfig[emp.role]?.label : roleConfig[emp.role]?.labelEn}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setEditEmployee(emp); setFormName(emp.name); setFormEmail(emp.email); setFormRole(emp.role); }} className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"><Edit size={16} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteId(emp.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={16} /></motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <UserCog size={48} className="mx-auto mb-3 opacity-30" />
              <p>{isAr ? 'لا يوجد موظفين بعد' : 'No employees yet'}</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-white/5">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-50 dark:text-slate-300">{isAr ? 'السابق' : 'Previous'}</button>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-50 dark:text-slate-300">{isAr ? 'التالي' : 'Next'}</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showAddModal || !!editEmployee} onClose={() => { setShowAddModal(false); setEditEmployee(null); }} size="md">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editEmployee ? (isAr ? 'تعديل موظف' : 'Edit Employee') : (isAr ? 'إضافة موظف جديد' : 'Add New Employee')}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الاسم' : 'Name'}</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={isAr ? 'أدخل اسم الموظف' : 'Enter employee name'} className={cn('w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200', 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10', 'text-slate-900 dark:text-white placeholder:text-slate-400', 'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder={isAr ? 'أدخل البريد الإلكتروني' : 'Enter email address'} className={cn('w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200', 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10', 'text-slate-900 dark:text-white placeholder:text-slate-400', 'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الدور' : 'Role'}</label>
              <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className={cn('w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200', 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10', 'text-slate-900 dark:text-white', 'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30')}>
                {Object.entries(roleConfig).map(([key, config]) => (
                  <option key={key} value={key}>{isAr ? config.label : config.labelEn}</option>
                ))}
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowAddModal(false); setEditEmployee(null); }}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={async () => {
            try {
              if (editEmployee) {
                const res = await fetch(`/api/users/${editEmployee.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: formName, email: formEmail, role: formRole }),
                });
                const data = await res.json();
                if (data.success && data.data) {
                  setUsers((prev) => prev.map((u) => u.id === editEmployee.id ? { ...u, ...data.data } : u));
                }
              } else {
                const res = await fetch('/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: formName, email: formEmail, role: formRole }),
                });
                const data = await res.json();
                if (data.success && data.data) {
                  setUsers((prev) => [data.data, ...prev]);
                }
              }
            } catch {
              toast.error(isAr ? 'فشل حفظ الموظف' : 'Failed to save employee');
            }
            setShowAddModal(false);
            setEditEmployee(null);
          }}>{editEmployee ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة' : 'Add')}</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-slate-600 dark:text-slate-300">{isAr ? 'هل أنت متأكد من حذف هذا الموظف؟' : 'Are you sure you want to delete this employee?'}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
          <Button variant="danger" onClick={handleDelete}>{isAr ? 'حذف' : 'Delete'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
