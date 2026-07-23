'use client';

import { motion } from 'framer-motion';
import {
  Zap, DollarSign, Award, Shield, Headphones,
  Eye, Star, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  { title: 'سرعة الإنجاز', description: 'نحرص على إنجاز طلباتك في أسرع وقت ممكن مع الحفاظ على أعلى معايير الجودة', icon: Zap, color: 'text-[#2580eb]', bgColor: 'bg-[#2580eb]/10' },
  { title: 'أسعار منافسة', description: 'نقدم أفضل الأسعار في السوق مع خدمات لا تُضاهى وجودة عالية', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { title: 'خبرة عالية', description: 'فريق من الخبراء المتخصصين بخبرة تزيد عن 10 سنوات في التعامل مع المعاملات الحكومية', icon: Award, color: 'text-[#7c3aed]', bgColor: 'bg-[#7c3aed]/10' },
  { title: 'حماية البيانات', description: 'نستخدم أحدث تقنيات الأمان لحماية بياناتك وخصوصيتك بشكل كامل', icon: Shield, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  { title: 'دعم فني', description: 'فريق دعم فني متاح على مدار الساعة للإجابة على استفساراتكم ومساعدتكم', icon: Headphones, color: 'text-[#14b8a6]', bgColor: 'bg-[#14b8a6]/10' },
  { title: 'متابعة مباشرة', description: 'تابع طلبك لحظة بلحظة من خلال منصتنا الإلكترونية حتى إنجازه', icon: Eye, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { title: 'جودة الخدمة', description: 'نلتزم بأعلى معايير جودة الخدمة لضمان رضاكم التام عن تجربتكم', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { title: 'فريق متخصص', description: 'فريق عمل مؤهل ومحترف جاهز لتقديم أفضل الحلول والخدمات لكم', icon: Users, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
};

export function WhyUsSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="primary" className="mb-4">مميزاتنا</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            لماذا المنجز؟
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            نقدم لك تجربة فريدة تجمع بين السرعة والجودة والأمان لإنجاز جميع معاملاتك
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={item}>
                <Card glass gradientBorder className="h-full group cursor-default">
                  <div className="p-6 text-center">
                    <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', feature.bgColor)}>
                      <Icon className={cn('w-8 h-8', feature.color)} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
