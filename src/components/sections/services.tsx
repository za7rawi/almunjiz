'use client';

import { motion } from 'framer-motion';
import {
  FileText, Car, Plane, Building, GraduationCap, Briefcase,
  Globe, Laptop, MessageSquare, Hotel, Shield, Home,
  Search, ArrowLeft, Star, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { servicesData } from '@/lib/services-data';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';

const iconMap: Record<string, React.ElementType> = {
  Globe, Briefcase, Plane, FileText, FileSignature: FileText,
  Car, Shield, Hotel, Building, Laptop, GraduationCap,
  MessageSquare, Star, Home, Package: FileText,
};

const colorMap: Record<string, { color: string; bgColor: string }> = {
  VISAS: { color: 'text-[#2580eb]', bgColor: 'bg-[#2580eb]/10' },
  CONTRACTS: { color: 'text-[#14b8a6]', bgColor: 'bg-[#14b8a6]/10' },
  VEHICLES: { color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  TRAVEL: { color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  BUSINESS: { color: 'text-[#7c3aed]', bgColor: 'bg-[#7c3aed]/10' },
  GOVERNMENT: { color: 'text-[#14b8a6]', bgColor: 'bg-[#14b8a6]/10' },
  ELECTRONIC: { color: 'text-[#7c3aed]', bgColor: 'bg-[#7c3aed]/10' },
  UNIVERSITIES: { color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
  CONSULTATIONS: { color: 'text-[#2580eb]', bgColor: 'bg-[#2580eb]/10' },
  OTHER: { color: 'text-[#14b8a6]', bgColor: 'bg-[#14b8a6]/10' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
};

export function ServicesSection() {
  const topServices = servicesData.filter((s) => s.isActive).slice(0, 8);
  const { currency } = useCurrencyStore();

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
          <Badge variant="primary" className="mb-4">خدماتنا</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            خدماتنا المتكاملة
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            نوفر لك مجموعة شاملة من الخدمات الإلكترونية والحكومية لتوفير وقتك وجهدك
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {topServices.map((service) => {
            const Icon = iconMap[service.icon] || Globe;
            const colors = colorMap[service.category] || colorMap.OTHER;
            return (
              <motion.div key={service.id} variants={item}>
                <Card glass className="h-full group hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                  <Link href={`/services/${service.id}`} className="block p-5">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110', colors.bgColor)}>
                      <Icon className={cn('w-6 h-6', colors.color)} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="info" size="sm">
                        <Clock size={10} className="ml-1" />
                        {service.duration}
                      </Badge>
                      <Badge variant="success" size="sm">{formatPrice(service.price, currency)}</Badge>
                    </div>
                  </Link>
                  <div className="px-5 pb-5">
                    <Link href={`/checkout?service=${service.id}`}>
                      <Button variant="secondary" size="sm" fullWidth iconLeft={<ArrowLeft size={14} />}>
                        اطلب الآن
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/services">
            <Button variant="secondary" size="lg" iconLeft={<Search size={18} />} iconRight={<ArrowLeft className="rtl:rotate-180" size={18} />}>
              عرض جميع الخدمات
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
