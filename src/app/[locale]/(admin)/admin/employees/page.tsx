'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog,
  Search,
  Edit,
  Trash2,
  Plus,
  Mail,
  Briefcase,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { PageHeader } from '@/components/ui/page-header';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

type RoleFilter = 'ALL' | 'admin' | 'manager' | 'employee' | 'support' | 'accountant';

const employees = [
  { id: '1', name: 'عبدالرحمن الشمري', email: 'abdulrahman@almunjiz.com', role: 'admin' as const, assignedOrders: 0, status: 'ACTIVE' as const },
  { id: '2', name: 'سارة الدوسري', email: 'sara@almunjiz.com', role: 'manager' as const, assignedOrders: 24, status: 'ACTIVE' as const },
  { id: '3', name: 'يوسف القحطاني', email: 'yousef@almunjiz.com', role: 'employee' as const, assignedOrders: 15, status: 'ACTIVE' as const },
  { id: '4', name: 'نورة العتيبي', email: 'noura@almunjiz.com', role: 'support' as const, assignedOrders: 8, status: 'ACTIVE' as const },
  { id: '5', name: 'ماجد السبيعي', email: 'majed@almunjiz.com', role: 'accountant' as const, assignedOrders: 0, status: 'ACTIVE' as const },
];

const roleConfig: Record<string, { label: string; labelEn: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'; color: string }> = {
  admin: { label: 'مدير', labelEn: 'Admin', variant: 'danger', color: '#ef4444' },
  manager: { label: 'مدير قسم', labelEn: 'Manager', variant: 'primary', color: '#2580eb' },
  employee: { label: 'موظف', labelEn: 'Employee', variant: 'success', color: '#14b8a6' },
  support: { label: 'دعم فني', labelEn: 'Support', variant: 'info', color: '#0ea5e9' },
  accountant: { label: 'محاسب', labelEn: 'Accountant', variant: 'warning', color: '#f59e0b' },
};

const roleTabs: { id: RoleFilter; label: string; labelEn: string }[] = [
  { id: 'ALL', label: 'الكل', labelEn: 'All' },
  { id: 'admin', label: 'مدير', labelEn: 'Admin' },
  { id: 'manager', label: 'مدير قسم', labelEn: 'Manager' },
  { id: 'employee', label: 'موظف', labelEn: 'Employee' },
  { id: 'support', label: 'دعم فني', labelEn: 'Support' },
  { id: 'accountant', label: 'محاسب', labelEn: 'Accountant' },
];

export default function EmployeesPage() {
  const { language } = useLanguageStore();
  const [activeRole, setActiveRole] = useState<RoleFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [employeesList, setEmployeesList] = useState(employees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<typeof employees[0] | null>(null);

  const filtered = useMemo(() => {
    return employeesList.filter((e) => {
      const matchesRole = activeRole === 'ALL' || e.role === activeRole;
      const matchesSearch =
        !searchQuery ||
        e.name.includes(searchQuery) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [activeRole, searchQuery, employeesList]);

  const removeEmployee = (id: string) => {
    setEmployeesList((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'ar' ? 'إدارة الموظفين' : 'Manage Employees'}
        subtitle={language === 'ar' ? 'إدارة حسابات وصلاحيات الموظفين' : 'Manage employee accounts and permissions'}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: language === 'ar' ? 'الموظفين' : 'Employees' },
        ]}
        actions={
          <Button variant="primary" size="sm" iconLeft={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
            {language === 'ar' ? 'إضافة موظف' : 'Add Employee'}
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
            placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
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
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الموظف' : 'Employee'}
                  </th>
                  <th className="text-start py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden md:table-cell">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'الدور' : 'Role'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium hidden sm:table-cell">
                    {language === 'ar' ? 'الطلبات المُسندة' : 'Assigned Orders'}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'ar' ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2580eb] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{emp.email}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={roleConfig[emp.role]?.variant || 'secondary'} size="sm">
                        {language === 'ar' ? roleConfig[emp.role]?.label : roleConfig[emp.role]?.labelEn}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white hidden sm:table-cell">{emp.assignedOrders}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditEmployee(emp)}
                          className="p-2 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeEmployee(emp.id)}
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
              <UserCog size={48} className="mx-auto mb-3 opacity-30" />
              <p>{language === 'ar' ? 'لا يوجد موظفين' : 'No employees found'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showAddModal || !!editEmployee} onClose={() => { setShowAddModal(false); setEditEmployee(null); }} size="md">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editEmployee
              ? (language === 'ar' ? 'تعديل موظف' : 'Edit Employee')
              : (language === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee')}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </label>
              <input
                type="text"
                defaultValue={editEmployee?.name || ''}
                placeholder={language === 'ar' ? 'أدخل اسم الموظف' : 'Enter employee name'}
                className={cn(
                  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white placeholder:text-slate-400',
                  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                defaultValue={editEmployee?.email || ''}
                placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                className={cn(
                  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white placeholder:text-slate-400',
                  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'ar' ? 'الدور' : 'Role'}
              </label>
              <select
                defaultValue={editEmployee?.role || 'employee'}
                className={cn(
                  'w-full px-4 py-2.5 text-sm rounded-xl transition-all duration-200',
                  'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10',
                  'text-slate-900 dark:text-white',
                  'focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30',
                )}
              >
                {Object.entries(roleConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {language === 'ar' ? config.label : config.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => { setShowAddModal(false); setEditEmployee(null); }}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={() => { setShowAddModal(false); setEditEmployee(null); }}>
            {editEmployee ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة' : 'Add')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
