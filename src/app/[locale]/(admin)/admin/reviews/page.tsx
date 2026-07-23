'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';
import { useAdminDataStore, type ReviewStatus } from '@/store/admin-data-store';

type StatusFilter = 'ALL' | ReviewStatus;

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: 'ALL', label: 'الكل' },
  { id: 'approved', label: 'موافق عليه' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'rejected', label: 'مرفوض' },
];

const inputClass = 'w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/30';

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            'transition-colors',
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 dark:text-slate-700',
          )}
        />
      ))}
    </div>
  );
}

const statusConfig: Record<ReviewStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  approved: { label: 'موافق عليه', variant: 'success' },
  pending: { label: 'قيد المراجعة', variant: 'warning' },
  rejected: { label: 'مرفوض', variant: 'danger' },
};

export default function ReviewsPage() {
  const { language } = useLanguageStore();
  const { reviews, approveReview, rejectReview, deleteReview } = useAdminDataStore();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchesStatus = activeStatus === 'ALL' || r.status === activeStatus;
      const matchesSearch =
        !searchQuery ||
        r.customerName.includes(searchQuery) ||
        r.service.includes(searchQuery) ||
        r.comment.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, searchQuery, reviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    return { total, avgRating, approved, pending };
  }, [reviews]);

  const statCards = [
    { label: 'إجمالي التقييمات', value: stats.total, icon: MessageSquare, color: '#2580eb' },
    { label: 'متوسط التقييم', value: stats.avgRating.toFixed(1), icon: Star, color: '#f59e0b' },
    { label: 'الموافق عليها', value: stats.approved, icon: CheckCircle, color: '#14b8a6' },
    { label: 'قيد المراجعة', value: stats.pending, icon: Filter, color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={language === 'ar' ? 'إدارة التقييمات' : 'Manage Reviews'}
        subtitle={language === 'ar' ? 'متابعة وإدارة تقييمات العملاء' : 'Track and manage customer reviews'}
        breadcrumbs={[
          { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/admin' },
          { label: language === 'ar' ? 'التقييمات' : 'Reviews' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
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
            placeholder={language === 'ar' ? 'بحث بالاسم، الخدمة، أو التعليق...' : 'Search by name, service, or comment...'}
            className={cn(inputClass, 'ps-10')}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
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
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{review.customerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{review.service}</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig[review.status].variant} size="sm" dot>
                      {statusConfig[review.status].label}
                    </Badge>
                  </div>

                  <StarRating rating={review.rating} />

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {review.comment}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="text-xs text-slate-400">{review.date}</span>
                    <div className="flex items-center gap-1">
                      {review.status !== 'approved' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => approveReview(review.id)}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors"
                          title={language === 'ar' ? 'موافقة' : 'Approve'}
                        >
                          <CheckCircle size={16} />
                        </motion.button>
                      )}
                      {review.status !== 'rejected' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => rejectReview(review.id)}
                          className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors"
                          title={language === 'ar' ? 'رفض' : 'Reject'}
                        >
                          <XCircle size={16} />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirm(review.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p>{language === 'ar' ? 'لا توجد تقييمات' : 'No reviews found'}</p>
        </div>
      )}

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} size="md">
        <ModalHeader>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {language === 'ar' ? 'تفاصيل التقييم' : 'Review Details'}
          </h3>
        </ModalHeader>
        <ModalBody>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#2580eb]/5 to-[#14b8a6]/5 border border-[#2580eb]/10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xl font-bold">
                  {selectedReview.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{selectedReview.customerName}</h4>
                  <Badge variant={statusConfig[selectedReview.status].variant} size="sm" dot>
                    {statusConfig[selectedReview.status].label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Star size={18} className="text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'التقييم' : 'Rating'}</p>
                    <StarRating rating={selectedReview.rating} size={20} />
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <MessageSquare size={18} className="text-[#2580eb] mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">{language === 'ar' ? 'الخدمة' : 'Service'}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedReview.service}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className="text-xs text-slate-400 mb-1">{language === 'ar' ? 'التعليق' : 'Comment'}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{selectedReview.comment}</p>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} size="sm" showClose={false}>
        <ModalBody>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {language === 'ar' ? 'حذف التقييم' : 'Delete Review'}
            </h3>
            <p className="text-sm text-slate-500">
              {language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this review? This action cannot be undone.'}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleteConfirm) deleteReview(deleteConfirm);
              setDeleteConfirm(null);
            }}
            iconLeft={<Trash2 size={14} />}
          >
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
