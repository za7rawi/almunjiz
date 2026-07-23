'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, Clock, ShoppingCart, ArrowLeft, Star,
  Globe, FileText, Car, Plane, Building2, Headphones,
  GraduationCap, Shield, Briefcase, Hotel, Laptop,
  MessageSquare, Home, FileSignature, SearchX, Zap, Heart,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { servicesData, type ServiceData } from '@/lib/services-data';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';

const iconMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Globe, FileText, Car, Plane, Building2, Headphones,
  GraduationCap, Shield, Star, Briefcase, Hotel, Laptop,
  MessageSquare, Home, FileSignature,
};

const categoryColors: Record<string, string> = {
  VISAS: '#2580eb',
  CONTRACTS: '#14b8a6',
  VEHICLES: '#7c3aed',
  TRAVEL: '#F59E0B',
  BUSINESS: '#10B981',
  GOVERNMENT: '#EF4444',
  ELECTRONIC: '#3B82F6',
  UNIVERSITIES: '#8B5CF6',
  CONSULTATIONS: '#F97316',
  OTHER: '#6366F1',
};

const categories = [
  { id: 'all', label: 'الكل', icon: null },
  { id: 'VISAS', label: 'التأشيرات', icon: Globe },
  { id: 'CONTRACTS', label: 'العقود', icon: FileText },
  { id: 'VEHICLES', label: 'المركبات', icon: Car },
  { id: 'TRAVEL', label: 'السفر', icon: Plane },
  { id: 'BUSINESS', label: 'قطاع الأعمال', icon: Briefcase },
  { id: 'GOVERNMENT', label: 'الخدمات الحكومية', icon: Shield },
  { id: 'ELECTRONIC', label: 'الخدمات الإلكترونية', icon: Laptop },
  { id: 'UNIVERSITIES', label: 'الجامعات', icon: GraduationCap },
  { id: 'CONSULTATIONS', label: 'الاستشارات', icon: MessageSquare },
  { id: 'OTHER', label: 'خدمات متنوعة', icon: Star },
];

function ServiceCard({ service, index }: { service: ServiceData; index: number }) {
  const { currency } = useCurrencyStore();
  const Icon = iconMap[service.icon] || Star;
  const color = categoryColors[service.category] || '#2580eb';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card glass padding="none" className="h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Gradient Header */}
        <div className={`relative bg-gradient-to-br ${service.gradient} p-5 text-white`}>
          {service.isPopular && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning" size="sm" className="bg-amber-400 text-amber-900 border-amber-300">
                <Zap size={10} />
                الأكثر طلباً
              </Badge>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon size={24} />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">{service.categoryAr}</span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{service.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="info" size="sm">
              <Clock size={12} className="ml-1" />
              {service.duration}
            </Badge>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-0.5">{service.priceNote}</p>
              <p className="text-lg font-bold gradient-text">{formatPrice(service.price, currency)}</p>
            </div>
            <Link href={`/services/${service.id}`}>
              <Button variant="secondary" size="sm" iconLeft={<ArrowLeft size={14} />}>
                التفاصيل
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return servicesData.filter((s) => {
      const matchCategory = activeCategory === 'all' || s.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        s.name.includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.description.includes(q) ||
        s.categoryAr.includes(q);
      return matchCategory && matchSearch && s.isActive;
    });
  }, [activeCategory, searchQuery]);

  const popularServices = useMemo(() => {
    return servicesData.filter((s) => s.isPopular && s.isActive).slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2580eb] via-[#14b8a6] to-[#7c3aed] text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">خدماتنا المتكاملة</h1>
            <p className="text-white/80 text-lg mb-8">تصفح خدماتنا المتنوعة واختر ما يناسبك. نقدم حلولاً احترافية متكاملة لاحتياجاتك.</p>
            <div className="relative max-w-lg mx-auto">
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن خدمة بالاسم أو الوصف..."
                className="w-full pr-12 pl-4 py-4 rounded-2xl border-0 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Popular Services */}
        {popularServices.length > 0 && activeCategory === 'all' && !searchQuery && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Heart size={20} className="text-red-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">الخدمات الأكثر طلباً</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30 hover:bg-[#2580eb]/5'
              }`}
            >
              {cat.icon && <cat.icon size={14} />}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            عرض <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> من {servicesData.filter((s) => s.isActive).length} خدمة
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
              <SearchX size={36} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">لا توجد نتائج</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">جرّب تغيير كلمة البحث أو الفئة</p>
            <Button variant="secondary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
              مسح الفلتر
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
