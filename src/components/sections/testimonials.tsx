'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';

interface Testimonial {
  name: string;
  rating: number;
  review: string;
  service: string;
}

const testimonials: Testimonial[] = [
  { name: 'محمد العتيبي', rating: 5, review: 'خدمة ممتازة وسرعة في الإنجاز. تم تأسيس شركتي في وقت قياسي. أنصح بالتعامل معهم بشدة.', service: 'خدمات قطاع الأعمال' },
  { name: 'فاطمة الحربي', rating: 5, review: 'تجربة رائعة من البداية للنهاية. الفريق محترف ومتعاون. حصلت على تأشيرتي بسرعة كبيرة.', service: 'تأشيرات السعودية' },
  { name: 'عبدالله الشمري', rating: 5, review: 'منصة سهلة الاستخدام وخدمة عملاء ممتازة. تم نقل ملكية مركبتي بدون أي مشاكل.', service: 'نقل ملكية المركبات' },
  { name: 'نورة السعيد', rating: 4, review: 'خدمة جيدة جداً وأسعار منافسة. ساعدوني في التسجيل بالجامعة الأردنية بكل سهولة.', service: 'التسجيل بالجامعات الأردنية' },
  { name: 'خالد المطيري', rating: 5, review: 'أفضل منصة للخدمات الإلكترونية في السعودية. سرعة الإنجاز والجودة لا مثيل لهما.', service: 'الخدمات الحكومية' },
  { name: 'سارة القحطاني', rating: 5, review: 'فريق عمل محترف ومتعاون. حجزوا لي رحلتي وفندقي بأفضل الأسعار. شكراً لكم.', service: 'إدارة حجوزات السفر' },
];

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
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={item}
              className="min-w-[340px] sm:min-w-[380px] snap-start"
            >
              <Card glass className="h-full">
                <div className="p-6">
                  <Quote className="w-8 h-8 text-[#2580eb]/20 mb-4" />
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 min-h-[80px]">
                    {testimonial.review}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={testimonial.name} size="md" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {testimonial.name}
                        </p>
                        <Badge variant="secondary" size="sm" className="mt-1">
                          {testimonial.service}
                        </Badge>
                      </div>
                    </div>
                    <Rating value={testimonial.rating} readonly size={16} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
