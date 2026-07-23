'use client';

import { useState, useRef, useEffect, useSyncExternalStore, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Trash2,
  Send,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { useLanguageStore } from '@/store/language-store';
import { useAdminDataStore } from '@/store/admin-data-store';
import type { NotificationType, NotificationTarget } from '@/store/admin-data-store';
import { cn } from '@/lib/utils';

const typeIcons: Record<NotificationType, typeof Bell> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors: Record<NotificationType, string> = {
  info: '#2580eb',
  success: '#14b8a6',
  warning: '#f59e0b',
  error: '#ef4444',
};

const typeBadgeVariant: Record<NotificationType, 'primary' | 'success' | 'warning' | 'danger'> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

type FilterType = 'ALL' | NotificationType;
type FilterRead = 'ALL' | 'read' | 'unread';

export default function NotificationsPage() {
  const { language } = useLanguageStore();
  const { notifications, addNotification, markAsRead, markAllAsRead, deleteNotification } =
    useAdminDataStore();
  const now = useSyncExternalStore(
    () => () => {},
    () => Date.now(),
    () => 0,
  );
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterRead, setFilterRead] = useState<FilterRead>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formMessageEn, setFormMessageEn] = useState('');
  const [formType, setFormType] = useState<NotificationType>('info');
  const [formTarget, setFormTarget] = useState<NotificationTarget>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType !== 'ALL' && n.type !== filterType) return false;
      if (filterRead === 'read' && !n.isRead) return false;
      if (filterRead === 'unread' && n.isRead) return false;
      return true;
    });
  }, [notifications, filterType, filterRead]);

  const total = notifications.length;
  const unread = notifications.filter((n) => !n.isRead).length;
  const read = total - unread;

  function resetForm() {
    setFormTitle('');
    setFormTitleEn('');
    setFormMessage('');
    setFormMessageEn('');
    setFormType('info');
    setFormTarget('all');
  }

  function handleSend() {
    if (!formTitle.trim() || !formMessage.trim()) return;
    addNotification({
      title: formTitle,
      titleEn: formTitleEn || formTitle,
      message: formMessage,
      messageEn: formMessageEn || formMessage,
      type: formType,
      target: formTarget,
    });
    resetForm();
    setIsModalOpen(false);
  }

  function handleDelete() {
    if (deleteId) {
      deleteNotification(deleteId);
      setDeleteId(null);
    }
  }

  function relativeTime(dateStr: string): string {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return language === 'ar' ? 'الآن' : 'Just now';
    if (mins < 60) return language === 'ar' ? `منذ ${mins} دقيقة` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return language === 'ar' ? `منذ ${hrs} ساعة` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return language === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
  }

  const filterTypeLabels: Record<FilterType, string> = {
    ALL: language === 'ar' ? 'الكل' : 'All',
    info: language === 'ar' ? 'معلومات' : 'Info',
    success: language === 'ar' ? 'نجاح' : 'Success',
    warning: language === 'ar' ? 'تحذير' : 'Warning',
    error: language === 'ar' ? 'خطأ' : 'Error',
  };

  const filterReadLabels: Record<FilterRead, string> = {
    ALL: language === 'ar' ? 'الكل' : 'All',
    read: language === 'ar' ? 'مقروء' : 'Read',
    unread: language === 'ar' ? 'غير مقروء' : 'Unread',
  };

  const inputClass =
    'w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30';

  return (
    <div>
      <PageHeader
        title="إدارة الإشعارات"
        breadcrumbs={[
          { label: language === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
          { label: language === 'ar' ? 'الإدارة' : 'Admin', href: '/admin' },
          { label: language === 'ar' ? 'الإشعارات' : 'Notifications' },
        ]}
        actions={
          <Button
            iconLeft={<Plus size={18} />}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            {language === 'ar' ? 'إرسال إشعار جديد' : 'Send New Notification'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2580eb]/10 flex items-center justify-center">
                  <Bell size={22} className="text-[#2580eb]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
                  <Bell size={22} className="text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{unread}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'غير مقروء' : 'Unread'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center">
                  <CheckCheck size={22} className="text-[#14b8a6]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{read}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'مقروء' : 'Read'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === 'ar' ? 'النوع:' : 'Type:'}
              </span>
              {(['ALL', 'info', 'success', 'warning', 'error'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    filterType === t
                      ? 'bg-[#2580eb] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20'
                  )}
                >
                  {filterTypeLabels[t]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === 'ar' ? 'الحالة:' : 'Status:'}
              </span>
              {(['ALL', 'unread', 'read'] as FilterRead[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRead(r)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    filterRead === r
                      ? 'bg-[#2580eb] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20'
                  )}
                >
                  {filterReadLabels[r]}
                </button>
              ))}
            </div>

            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<CheckCheck size={16} />}
                onClick={markAllAsRead}
              >
                {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All Read'}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                  </p>
                </motion.div>
              ) : (
                filtered.map((notification, index) => {
                  const Icon = typeIcons[notification.type];
                  const color = typeColors[notification.type];
                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-xl border transition-colors',
                        notification.isRead
                          ? 'bg-white/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5'
                          : 'bg-[#2580eb]/5 dark:bg-[#2580eb]/10 border-[#2580eb]/20 dark:border-[#2580eb]/20'
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon size={20} style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={cn(
                              'text-sm font-semibold truncate',
                              'text-slate-900 dark:text-white'
                            )}
                          >
                            {language === 'ar' ? notification.title : notification.titleEn}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#2580eb] shrink-0" />
                          )}
                          <Badge variant={typeBadgeVariant[notification.type]} size="sm">
                            {filterTypeLabels[notification.type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                          {language === 'ar' ? notification.message : notification.messageEn}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          {relativeTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconLeft={<CheckCheck size={14} />}
                            onClick={() => markAsRead(notification.id)}
                            className="text-[#2580eb]"
                          >
                            {language === 'ar' ? 'مقروء' : 'Read'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={<Trash2 size={14} />}
                          onClick={() => setDeleteId(notification.id)}
                          className="text-red-500 hover:text-red-600"
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'إرسال إشعار جديد' : 'Send New Notification'}
          </h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل العنوان' : 'Enter title'}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                </label>
                <input
                  type="text"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل العنوان بالإنجليزية' : 'Enter title in English'}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الرسالة (عربي)' : 'Message (Arabic)'}
                </label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل الرسالة' : 'Enter message'}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الرسالة (إنجليزي)' : 'Message (English)'}
                </label>
                <textarea
                  value={formMessageEn}
                  onChange={(e) => setFormMessageEn(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل الرسالة بالإنجليزية' : 'Enter message in English'}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'نوع الإشعار' : 'Notification Type'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['info', 'success', 'warning', 'error'] as NotificationType[]).map((t) => {
                    const Icon = typeIcons[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormType(t)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-colors',
                          formType === t
                            ? 'border-[#2580eb] bg-[#2580eb]/10 text-[#2580eb]'
                            : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        )}
                      >
                        <Icon size={16} style={{ color: typeColors[t] }} />
                        {filterTypeLabels[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الهدف' : 'Target'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'all' as const, label: language === 'ar' ? 'الجميع' : 'Everyone' },
                      { value: 'customers' as const, label: language === 'ar' ? 'العملاء' : 'Customers' },
                      { value: 'employees' as const, label: language === 'ar' ? 'الموظفون' : 'Employees' },
                      { value: 'managers' as const, label: language === 'ar' ? 'المديرون' : 'Managers' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormTarget(opt.value)}
                      className={cn(
                        'px-3 py-2 text-sm rounded-xl border transition-colors',
                        formTarget === opt.value
                          ? 'border-[#2580eb] bg-[#2580eb]/10 text-[#2580eb]'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            iconLeft={<Send size={16} />}
            onClick={handleSend}
            disabled={!formTitle.trim() || !formMessage.trim()}
          >
            {language === 'ar' ? 'إرسال' : 'Send'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'حذف الإشعار' : 'Delete Notification'}
          </h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {language === 'ar'
              ? 'هل أنت متأكد من حذف هذا الإشعار؟ لا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure you want to delete this notification? This action cannot be undone.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="danger" iconLeft={<Trash2 size={16} />} onClick={handleDelete}>
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
