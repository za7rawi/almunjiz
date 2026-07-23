'use client';

import { motion } from 'framer-motion';
import { Search, Upload, CreditCard, Eye, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: Step[] = [
  { number: 1, title: 'اختر الخدمة', description: 'تصفح خدماتنا واختر الخدمة التي تناسب احتياجاتك', icon: Search, color: 'from-[#2580eb] to-[#2580eb]' },
  { number: 2, title: 'أرسل المستندات', description: 'قم بتحميل المستندات المطلوبة إلكترونياً بسهولة', icon: Upload, color: 'from-[#14b8a6] to-[#14b8a6]' },
  { number: 3, title: 'ادفع الرسوم', description: 'اختر طريقة الدفع المناسبة وأكمل عملية الدفع بأمان', icon: CreditCard, color: 'from-[#7c3aed] to-[#7c3aed]' },
  { number: 4, title: 'متابعة الطلب', description: 'تابع حالة طلبك لحظة بلحظة من خلال منصتنا', icon: Eye, color: 'from-amber-500 to-amber-500' },
  { number: 5, title: 'استلام الخدمة', description: 'استلم خدمتك جاهزة بعد إنجازها بنجاح', icon: CheckCircle, color: 'from-emerald-500 to-emerald-500' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
};

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="primary" className="mb-4">كيف يعمل</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            طريقة العمل
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            خطوات بسيطة وسريعة لإنجاز معاملاتك بدون أي تعقيد
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              return (
                <motion.div key={step.number} variants={item} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={cn(
                          'w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg',
                          'bg-gradient-to-br',
                          step.color,
                        )}
                      >
                        <Icon size={32} />
                      </motion.div>
                      <div className="absolute -top-2 -end-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-[#2580eb] flex items-center justify-center">
                        <span className="text-sm font-bold text-[#2580eb]">{step.number}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
                      {step.description}
                    </p>
                  </div>

                  {!isLast && (
                    <div className="hidden md:block absolute top-10 start-full w-full h-[2px] -translate-x-1/2">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-[#2580eb]/30 via-[#14b8a6]/30 to-[#7c3aed]/30 origin-end"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.15 }}
                        className="absolute top-1/2 start-full -translate-y-1/2 -ms-1"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#14b8a6]" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
