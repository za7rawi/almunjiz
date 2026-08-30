'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Globe, FileText, Car, Plane, Building2,
  GraduationCap, Briefcase, Hotel, Laptop,
  MessageSquare, SearchX, Heart, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguageStore } from '@/store/language-store';
import type { ServiceData } from '@/types/service-data';
import { ServiceCard, type ServiceCardData } from '@/components/storefront/service-card';

const catIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  VISAS: Globe,
  CONTRACTS: FileText,
  VEHICLES: Car,
  TRAVEL: Plane,
  HOTELS: Hotel,
  BUSINESS: Briefcase,
  GOVERNMENT: Building2,
  ELECTRONIC: Laptop,
  UNIVERSITIES: GraduationCap,
  CONSULTATIONS: MessageSquare,
  OTHER: Lock,
};

const catLabels: Record<string, { ar: string; en: string }> = {
  VISAS: { ar: 'التأشيرات', en: 'Visas' },
  CONTRACTS: { ar: 'العقود', en: 'Contracts' },
  VEHICLES: { ar: 'المركبات', en: 'Vehicles' },
  TRAVEL: { ar: 'السفر', en: 'Travel' },
  HOTELS: { ar: 'الفنادق', en: 'Hotels' },
  BUSINESS: { ar: 'قطاع الأعمال', en: 'Business' },
  GOVERNMENT: { ar: 'الخدمات الحكومية', en: 'Government' },
  ELECTRONIC: { ar: 'الخدمات الإلكترونية', en: 'Electronic' },
  UNIVERSITIES: { ar: 'الجامعات', en: 'Universities' },
  CONSULTATIONS: { ar: 'الاستشارات', en: 'Consultations' },
  OTHER: { ar: 'خدمات متنوعة', en: 'Other' },
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesSkeleton />}>
      <ServicesPageContent />
    </Suspense>
  );
}

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category') ?? 'all';
  return <ServicesClient key={urlCategory} initialCategory={urlCategory} />;
}

function ServicesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesClient({ initialCategory }: { initialCategory: string }) {
  const [servicesData, setServicesData] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
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
        s.name.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.categoryAr.toLowerCase().includes(q);
      return matchCategory && matchSearch && s.isActive;
    });
  }, [activeCategory, searchQuery, servicesData]);

  const popularServices = useMemo(() => {
    return servicesData.filter((s) => s.isPopular && s.isActive).slice(0, 4);
  }, [servicesData]);

  const dynamicCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of servicesData) {
      if (!s.isActive) continue;
      counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count, icon: catIcons[key] ?? Lock }));
  }, [servicesData]);

  const renderCards = (list: ServiceData[]) =>
    list.map((service, i) => (
      <ServiceCard key={service.id} service={service as ServiceCardData} isAr={isAr} index={i} />
    ));

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
              <Search size={20} className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن خدمة بالاسم أو الوصف...' : 'Search for a service by name or description...'}
                className="w-full pe-12 ps-4 py-3 sm:py-4 rounded-2xl border-0 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30 hover:bg-[#2580eb]/5'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30 hover:bg-[#2580eb]/5'
              }`}
            >
              <cat.icon size={14} />
              {isAr ? catLabels[cat.key]?.ar ?? cat.key : catLabels[cat.key]?.en ?? cat.key}
              <span className={`text-[10px] rounded-full px-1.5 ${activeCategory === cat.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Popular Services */}
        {!loading && popularServices.length > 0 && activeCategory === 'all' && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Heart size={20} className="text-red-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isAr ? 'الخدمات الأكثر طلباً' : 'Most Popular Services'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {renderCards(popularServices)}
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
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
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {renderCards(filtered)}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}