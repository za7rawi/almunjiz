'use client';

import { motion } from 'framer-motion';
import { ChevronDown, MessageCircle, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '+5000', label: 'طلب منجز' },
  { value: '+50', label: 'خدمة متاحة' },
  { value: '99%', label: 'رضا العملاء' },
  { value: '24/7', label: 'دعم فني' },
];

const floatingElements = [
  { className: 'top-20 end-[10%] w-20 h-20 rounded-full bg-[#2580eb]/10', delay: 0 },
  { className: 'top-40 start-[5%] w-14 h-14 rounded-xl bg-[#14b8a6]/10 rotate-45', delay: 0.5 },
  { className: 'bottom-32 end-[15%] w-16 h-16 rounded-2xl bg-[#7c3aed]/10', delay: 1 },
  { className: 'bottom-48 start-[12%] w-12 h-12 rounded-full bg-[#2580eb]/8', delay: 1.5 },
  { className: 'top-[60%] end-[8%] w-10 h-10 rounded-lg bg-[#14b8a6]/10 rotate-12', delay: 0.8 },
  { className: 'top-[30%] start-[18%] w-8 h-8 rounded-full bg-[#7c3aed]/8', delay: 1.2 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2580eb]/5 via-white to-[#14b8a6]/5" />

      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #2580eb 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          className={cn('absolute animate-float', el.className)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: el.delay, duration: 0.8, type: 'spring' }}
        />
      ))}

      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-[#2580eb]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 end-1/4 w-80 h-80 bg-[#14b8a6]/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2580eb]/10 border border-[#2580eb]/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
            <span className="text-sm font-medium text-[#2580eb]">المنصة السعودية الرائدة للخدمات الإلكترونية</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6"
          >
            <span className="inline-flex items-center gap-4 justify-center flex-wrap">
              <img src="/logo.jpg" alt="المنجز" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain rounded-xl" />
              <span className="gradient-text">المنجز</span>
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl mt-2 block">
              أنجز جميع معاملاتك الإلكترونية بكل سهولة وأمان
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            منصة المنجز توفر لك جميع الخدمات الحكومية والخاصة في مكان واحد.
            احصل على خبراء متخصصين ينجزون معاملاتك بأسرع وقت وبأفضل الأسعار.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/services">
              <Button size="xl" iconRight={<ArrowRight className="rtl:rotate-180" />}>
                ابدأ الآن
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" size="xl" iconRight={<Search />}>
                استعرض الخدمات
              </Button>
            </Link>
            <a href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="xl" iconRight={<MessageCircle />}>
                تواصل معنا
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-4 sm:p-5 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 start-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-slate-400"
          >
            <span className="text-xs">اكتشف المزيد</span>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
