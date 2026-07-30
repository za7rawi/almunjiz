'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Clock, ShoppingCart, ArrowLeft, ArrowRight, Star,
  Globe, FileText, Car, Plane, Building2, Headphones,
  GraduationCap, Shield, Briefcase, Hotel, Laptop,
  MessageSquare, Home, FileSignature, SearchX, Zap, Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrencyStore } from '@/store/currency-store';
import { useLanguageStore } from '@/store/language-store';
import { formatPrice } from '@/lib/currency';
import type { ServiceData } from '@/types/service-data';

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
  { id: 'all', label: 'الكل', labelEn: 'All', icon: null },
  { id: 'VISAS', label: 'التأشيرات', labelEn: 'Visas', icon: Globe },
  { id: 'CONTRACTS', label: 'العقود', labelEn: 'Contracts', icon: FileText },
  { id: 'VEHICLES', label: 'المركبات', labelEn: 'Vehicles', icon: Car },
  { id: 'TRAVEL', label: 'السفر', labelEn: 'Travel', icon: Plane },
  { id: 'BUSINESS', label: 'قطاع الأعمال', labelEn: 'Business', icon: Briefcase },
  { id: 'GOVERNMENT', label: 'الخدمات الحكومية', labelEn: 'Government', icon: Shield },
  { id: 'ELECTRONIC', label: 'الخدمات الإلكترونية', labelEn: 'Electronic', icon: Laptop },
  { id: 'UNIVERSITIES', label: 'الجامعات', labelEn: 'Universities', icon: GraduationCap },
  { id: 'CONSULTATIONS', label: 'الاستشارات', labelEn: 'Consultations', icon: MessageSquare },
  { id: 'OTHER', label: 'خدمات متنوعة', labelEn: 'Other', icon: Star },
];

function ServiceCard({ service, index }: { service: ServiceData; index: number }) {
  const { currency } = useCurrencyStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const Icon = iconMap[service.icon] || Star;
  const color = categoryColors[service.category] || '#2580eb';

  return (
    <div
      className="flex"
    >
      <Card glass padding="none" className="h-full w-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className={`relative ${service.image ? '' : `bg-gradient-to-br ${service.gradient}`} text-white aspect-square p-3 sm:p-5`}>
          {service.image && (
            <img src={service.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          )}
          <div className={`absolute inset-0 ${service.image ? 'bg-gradient-to-t from-black/70 via-black/30 to-black/10' : ''}`} />
          {service.isPopular && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <Badge variant="warning" size="sm" className="bg-amber-400 text-amber-900 border-amber-300 text-[10px]">
                <Zap size={10} />
                {isAr ? 'الأكثر طلباً' : 'Most Popular'}
              </Badge>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-xs bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full font-medium">{service.categoryAr}</span>
          </div>
        </div>

        <div className="p-3 sm:p-5 flex flex-col flex-1">
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 line-clamp-1">{service.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed flex-1">{service.description}</p>

          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Badge variant="info" size="sm" className="text-[10px] sm:text-xs">
              <Clock size={12} className="ml-1" />
              {service.duration}
            </Badge>
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex-1">
              <p className="text-[10px] sm:text-xs text-slate-400 mb-0.5">{service.priceNote}</p>
              <p className="text-sm sm:text-lg font-bold gradient-text">{formatPrice(service.price, currency)}</p>
            </div>
            <Link href={`/services/${service.id}`}>
              <Button variant="secondary" size="sm" iconLeft={isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />} className="text-xs sm:text-sm">
                {isAr ? 'التفاصيل' : 'Details'}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ServicesPage() {
  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services?limit=100');
        const json = await res.json();
        if (json.success) {
          setServicesData(json.data.data);
        }
      } catch (e) {
        console.error('Failed to fetch services:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

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
  }, [activeCategory, searchQuery, servicesData]);

  const popularServices = useMemo(() => {
    return servicesData.filter((s) => s.isPopular && s.isActive).slice(0, 4);
  }, [servicesData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2580eb] via-[#14b8a6] to-[#7c3aed] text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">
              {isAr ? 'خدماتنا المتكاملة' : 'Our Comprehensive Services'}
            </h1>
            <p className="text-white/80 text-sm sm:text-lg mb-6 sm:mb-8">
              {isAr ? 'تصفح خدماتنا المتنوعة واختر ما يناسبك. نقدم حلولاً احترافية متكاملة لاحتياجاتك.' : 'Browse our diverse services and choose what suits you. We provide professional integrated solutions for your needs.'}
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن خدمة بالاسم أو الوصف...' : 'Search for a service by name or description...'}
                className="w-full pr-12 pl-4 py-3 sm:py-4 rounded-2xl border-0 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 sm:p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Popular Services */}
          {popularServices.length > 0 && activeCategory === 'all' && !searchQuery && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <Heart size={20} className="text-red-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isAr ? 'الخدمات الأكثر طلباً' : 'Most Popular Services'}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {popularServices.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30 hover:bg-[#2580eb]/5'
                }`}
              >
                {cat.icon && <cat.icon size={14} />}
                {isAr ? cat.label : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAr ? (
                <>
                  عرض <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> من {servicesData.filter((s) => s.isActive).length} خدمة
                </>
              ) : (
                <>
                  Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> of {servicesData.filter((s) => s.isActive).length} services
                </>
              )}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <SearchX size={36} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {isAr ? 'لا توجد نتائج' : 'No Results Found'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                {isAr ? 'جرّب تغيير كلمة البحث أو الفئة' : 'Try changing the search term or category'}
              </p>
              <Button variant="secondary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                {isAr ? 'مسح الفلتر' : 'Clear Filter'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
