'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  user: { name: string };
  service: { name: string };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
};

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/reviews?all=true')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setReviews(json.data.filter((r: Review) => r.isApproved));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: 'start' | 'end') => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === 'end' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10"
        >
          <div>
            <Badge variant="primary" className="mb-4">آراء عملائنا</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              تقييمات العملاء
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
              نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل تجربة خدمة
            </p>
          </div>
          {!loading && reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <button
                onClick={() => scroll('end')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => scroll('start')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden pb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[340px] sm:min-w-[380px]">
                <Card glass className="h-full">
                  <div className="p-6 space-y-4">
                    <div className="w-8 h-8 rounded bg-slate-200 dark:bg-white/10 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-full animate-pulse" />
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-24 animate-pulse" />
                        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-5">
              <Quote className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              لا توجد تقييمات بعد
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              كن أول من يشارك تجربته معنا. نقدّر ملاحظاتك ونسعى لتحسين خدماتنا باستمرار.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={item}
                className="min-w-[340px] sm:min-w-[380px] snap-start"
              >
                <Card glass className="h-full">
                  <div className="p-6">
                    <Quote className="w-8 h-8 text-[#2580eb]/20 mb-4" />
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 min-h-[80px]">
                      {review.comment}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={review.user.name} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {review.user.name}
                          </p>
                          <Badge variant="secondary" size="sm" className="mt-1">
                            {review.service.name}
                          </Badge>
                        </div>
                      </div>
                      <Rating value={review.rating} readonly size={16} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
