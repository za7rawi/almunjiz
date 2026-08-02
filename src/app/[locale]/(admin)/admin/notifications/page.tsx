'use client';

import { useState, useMemo, useEffect, useCallback, useSyncExternalStore } from 'react';
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
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { toast } from '@/components/ui/toast';

type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationTarget = 'all' | 'customers' | 'employees' | 'managers';

interface Notification {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: NotificationType;
  target: NotificationTarget;
  isRead: boolean;
  createdAt: string;
}

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
  const isAr = language === 'ar';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const now = useSyncExternalStore(
    () => () => {},
    () => Date.now(),
    () => 0,
  );
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterRead, setFilterRead] = useState<FilterRead>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formMessageEn, setFormMessageEn] = useState('');
  const [formType, setFormType] = useState<NotificationType>('info');
  const [formTarget, setFormTarget] = useState<NotificationTarget>('all');
  const [sending, setSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/notifications');
      const data = await res.json();
      if (data.success) setNotifications(data.data);
    } catch {
      toast.error(isAr ? 'فشل تحميل الإشعارات' : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    const load = () => fetchNotifications();
    load();
  }, [fetchNotifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType !== 'ALL' && n.type !== filterType) return false;
      if (filterRead === 'read' && !n.isRead) return false;
      if (filterRead === 'unread' && n.isRead) return false;
      return true;
    });
  }, [notifications, filterType, filterRead]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  async function handleSend() {
    if (!formTitle.trim() || !formMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/cms/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          titleEn: formTitleEn || formTitle,
          message: formMessage,
          messageEn: formMessageEn || formMessage,
          type: formType,
          target: formTarget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => [data.data, ...prev]);
        resetForm();
        setIsModalOpen(false);
      }
    } catch {
      toast.error(isAr ? 'فشل إرسال الإشعار' : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const prev = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== deleteId));
    setDeleteId(null);
    try {
      const res = await fetch(`/api/cms/notifications?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) setNotifications(prev);
    } catch {
      setNotifications(prev);
    }
  }

  async function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch('/api/cms/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
    } catch {
      fetchNotifications();
    }
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch('/api/cms/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch {
      fetchNotifications();
    }
  }

  function relativeTime(dateStr: string): string {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isAr ? 'الآن' : 'Just now';
    if (mins < 60) return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return isAr ? `منذ ${hrs} ساعة` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  }

  const filterTypeLabels: Record<FilterType, string> = {
    ALL: isAr ? 'الكل' : 'All',
    info: isAr ? 'معلومات' : 'Info',
    success: isAr ? 'نجاح' : 'Success',
    warning: isAr ? 'تحذير' : 'Warning',
    error: isAr ? 'خطأ' : 'Error',
  };

  const filterReadLabels: Record<FilterRead, string> = {
    ALL: isAr ? 'الكل' : 'All',
    read: isAr ? 'مقروء' : 'Read',
    unread: isAr ? 'غير مقروء' : 'Unread',
  };

  const inputClass =
    'w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#2580eb]" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isAr ? 'إدارة الإشعارات' : 'Notifications Management'}
        breadcrumbs={[
          { label: isAr ? 'الرئيسية' : 'Home', href: '/' },
          { label: isAr ? 'الإدارة' : 'Admin', href: '/admin' },
          { label: isAr ? 'الإشعارات' : 'Notifications' },
        ]}
        actions={
          <Button
            iconLeft={<Plus size={18} />}
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            {isAr ? 'إرسال إشعار جديد' : 'Send New Notification'}
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'إجمالي الإشعارات' : 'Total Notifications'}</p>
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'غير مقروء' : 'Unread'}</p>
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">{isAr ? 'مقروء' : 'Read'}</p>
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'النوع:' : 'Type:'}</span>
              {(['ALL', 'info', 'success', 'warning', 'error'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setFilterType(t); setCurrentPage(1); }}
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
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'الحالة:' : 'Status:'}</span>
              {(['ALL', 'unread', 'read'] as FilterRead[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setFilterRead(r); setCurrentPage(1); }}
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
                {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
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
                  <p className="text-slate-500 dark:text-slate-400">{isAr ? 'لا توجد إشعارات' : 'No notifications'}</p>
                </motion.div>
              ) : (
                paginatedData.map((notification, index) => {
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
                          <h4 className={cn('text-sm font-semibold truncate', 'text-slate-900 dark:text-white')}>
                            {isAr ? notification.title : notification.titleEn}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#2580eb] shrink-0" />
                          )}
                          <Badge variant={typeBadgeVariant[notification.type]} size="sm">
                            {filterTypeLabels[notification.type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                          {isAr ? notification.message : notification.messageEn}
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
                            {isAr ? 'مقروء' : 'Read'}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {isAr ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-50 text-slate-600 dark:text-slate-300"
                >
                  {isAr ? 'السابق' : 'Previous'}
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-50 text-slate-600 dark:text-slate-300"
                >
                  {isAr ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'إرسال إشعار جديد' : 'Send New Notification'}</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={isAr ? 'أدخل العنوان' : 'Enter title in Arabic'}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="Enter title in English"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الرسالة (عربي)' : 'Message (Arabic)'}</label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={isAr ? 'أدخل الرسالة' : 'Enter message in Arabic'}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الرسالة (إنجليزي)' : 'Message (English)'}</label>
                <textarea
                  value={formMessageEn}
                  onChange={(e) => setFormMessageEn(e.target.value)}
                  placeholder="Enter message in English"
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'نوع الإشعار' : 'Notification Type'}</label>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{isAr ? 'الهدف' : 'Target'}</label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'all' as const, labelAr: 'الجميع', labelEn: 'All Users' },
                      { value: 'customers' as const, labelAr: 'العملاء', labelEn: 'Customers' },
                      { value: 'employees' as const, labelAr: 'الموظفون', labelEn: 'Employees' },
                      { value: 'managers' as const, labelAr: 'المديرون', labelEn: 'Managers' },
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
                      {isAr ? opt.labelAr : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            iconLeft={sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            onClick={handleSend}
            disabled={!formTitle.trim() || !formMessage.trim() || sending}
          >
            {isAr ? 'إرسال' : 'Send'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <ModalHeader>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isAr ? 'حذف الإشعار' : 'Delete Notification'}</h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isAr ? 'هل أنت متأكد من حذف هذا الإشعار؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this notification? This action cannot be undone.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="danger" iconLeft={<Trash2 size={16} />} onClick={handleDelete}>
            {isAr ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
