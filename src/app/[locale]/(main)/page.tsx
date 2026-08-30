'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  FileText,
  Star,
  Users,
  Zap,
  Award,
  Heart,
  ArrowUpRight,
  Shield,
  BadgePercent,
  Headphones,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { blogsData } from '@/lib/blogs-data';
import { CONTACT_INFO, SUPPORT_CHANNELS } from '@/constants';
import { DEFAULT_HOMEPAGE } from '@/constants/homepage';
import { HorizontalSlider } from '@/components/storefront/horizontal-slider';
import { SectionHeading } from '@/components/storefront/section-heading';
import { ServiceCard, type ServiceCardData } from '@/components/storefront/service-card';
import { ServiceIcon } from '@/components/ui/service-icon';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

const blogPostsPreview = blogsData.slice(0, 3);

interface StorefrontCategoryData {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  count: number;
}

interface StorefrontResponse {
  success: boolean;
  data: {
    homepage: Record<string, unknown>;
    services: ServiceCardData[];
    categories: StorefrontCategoryData[];
    banners: unknown[];
    offers: unknown[];
  };
}

const whyUsIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Zap, Shield, BadgePercent, Headphones, Award, Heart,
};

type HomepageContent = Record<string, unknown>;

export default function HomePage() {
  const { language } = useLanguageStore();
  const { isRtl } = useDirection();
  const isAr = language === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [services, setServices] = useState<ServiceCardData[]>([]);
  const [categories, setCategories] = useState<StorefrontCategoryData[]>([]);
  const [content, setContent] = useState<HomepageContent>({} as HomepageContent);
  const [animateHero, setAnimateHero] = useState(true);

  useEffect(() => {
    const sync = () => {
      try {
        if (sessionStorage.getItem('almunjiz-hero-seen')) {
          setAnimateHero(false);
        } else {
          sessionStorage.setItem('almunjiz-hero-seen', '1');
        }
      } catch {
        /* ignore */
      }
    };
    sync();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/storefront', { cache: 'no-store' });
        const json: StorefrontResponse = await res.json();
        if (json.success && json.data) {
          setServices(json.data.services ?? []);
          setCategories(json.data.categories ?? []);
          setContent(json.data.homepage ?? ({} as HomepageContent));
        }
      } catch (e) {
        console.error('Failed to fetch storefront data:', e);
      }
    }
    fetchData();
  }, []);

  const hero = (content.hero ?? DEFAULT_HOMEPAGE.hero) as typeof DEFAULT_HOMEPAGE.hero;
  const stats = (content.stats ?? DEFAULT_HOMEPAGE.stats) as typeof DEFAULT_HOMEPAGE.stats;
  const whyUs = (content.whyUs ?? DEFAULT_HOMEPAGE.whyUs) as typeof DEFAULT_HOMEPAGE.whyUs;
  const steps = (content.steps ?? DEFAULT_HOMEPAGE.steps) as typeof DEFAULT_HOMEPAGE.steps;
  const testimonials = (content.testimonials ?? DEFAULT_HOMEPAGE.testimonials) as typeof DEFAULT_HOMEPAGE.testimonials;
  const faq = (content.faq ?? DEFAULT_HOMEPAGE.faq) as typeof DEFAULT_HOMEPAGE.faq;

  const popularServices = services.filter((s) => s.isPopular);
  const filteredServices = services.filter((s) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      (s.description ?? '').toLowerCase().includes(q) ||
      (s.descriptionEn ?? '').toLowerCase().includes(q) ||
      (s.categoryAr ?? '').toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const toggleFaq = useCallback((i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  const contactCards = [
    { href: `tel:${CONTACT_INFO.phone}`, Icon: Phone, color: '#2580eb', bg: 'bg-[#2580eb]/10', title: isAr ? 'الهاتف' : 'Phone', value: CONTACT_INFO.phone, external: false },
    { href: `mailto:${CONTACT_INFO.email}`, Icon: Mail, color: '#14b8a6', bg: 'bg-[#14b8a6]/10', title: isAr ? 'البريد الإلكتروني' : 'Email', value: CONTACT_INFO.email, external: false },
    { href: SUPPORT_CHANNELS.whatsapp.url, Icon: MessageCircle, color: '#25A65E', bg: 'bg-[#25A65E]/10', title: 'WhatsApp', value: CONTACT_INFO.whatsapp, external: true },
  ];

  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[70vh] sm:min-h-[76vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -left-40 w-[480px] h-[480px] bg-[#2580eb]/[0.07] rounded-full blur-[140px]" />
          <div className="absolute -bottom-48 -right-40 w-[560px] h-[560px] bg-[#14b8a6]/[0.05] rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <motion.div
            initial={animateHero ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-8 sm:mb-10"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-sm text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
              {isAr ? hero.badgeAr : hero.badgeEn}
            </span>
          </motion.div>

          <motion.div
            initial={animateHero ? { opacity: 0, scale: 0.92 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: animateHero ? 0.12 : 0, ease: 'easeOut' }}
            className="mb-8 sm:mb-10"
          >
            <Image
              src="/logo.jpg"
              alt={isAr ? 'شعار المنجز' : 'AL-MUNJIZ logo'}
              width={112}
              height={112}
              unoptimized
              priority
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

          <motion.h1
            initial={animateHero ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: animateHero ? 0.2 : 0, ease: 'easeOut' }}
            className={cn(
              'text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white text-balance mb-6 sm:mb-8',
              isAr ? 'leading-[1.25]' : 'tracking-tight leading-[1.15]',
            )}
          >
            {isAr ? hero.titleAr : hero.titleEn}
          </motion.h1>

          <motion.p
            initial={animateHero ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: animateHero ? 0.3 : 0, ease: 'easeOut' }}
            className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 md:mb-12 leading-relaxed text-balance"
          >
            {isAr ? hero.descriptionAr : hero.descriptionEn}
          </motion.p>

          <motion.div
            initial={animateHero ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: animateHero ? 0.42 : 0, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          >
            <Link href="/services" className="w-full sm:w-auto">
              <Button size="xl" className="w-full sm:w-auto min-w-[240px] px-8">
                {isAr ? hero.button1Ar : hero.button1En}
              </Button>
            </Link>
            <Link href="/track-order" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto min-w-[240px] px-8 border-white/25 text-white hover:bg-white/10"
              >
                {isAr ? hero.button2Ar : hero.button2En}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <motion.div
            {...fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
          >
            {stats.map((stat) => (
              <div
                key={stat.labelAr}
                className="rounded-2xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.03] px-4 py-6 sm:py-7 text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold gradient-text">{stat.number}</div>
                <div className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2">
                  {isAr ? stat.labelAr : stat.labelEn}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SEARCH ─── */}
      <section className="py-8 md:py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <div className="relative">
              <Search size={20} className="absolute start-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن الخدمة التي تحتاجها...' : 'Search for the service you need...'}
                className="w-full ps-13 pe-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2580eb]/30 focus:border-[#2580eb] focus:bg-white dark:focus:bg-slate-700 shadow-sm transition-all duration-300"
              />
            </div>
          </motion.div>

          {filteredServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden"
            >
              {filteredServices.slice(0, 6).map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                    <ServiceIcon name={service.icon} size={18} className="text-[#2580eb]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{isAr ? service.name : service.nameEn}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{isAr ? service.description : service.descriptionEn}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 shrink-0" />
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── POPULAR SERVICES SLIDER ─── */}
      {popularServices.length > 0 && (
        <section className="py-14 md:py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={isAr ? 'الخدمات الأكثر طلباً' : 'Most Popular Services'}
              subtitle={isAr ? 'الخدمات المفضلة لدى عملائنا' : 'Our clients favourite services'}
              action={{
                label: isAr ? 'عرض الكل' : 'View all',
                href: '/services',
              }}
            />
            <HorizontalSlider
              isRtl={isRtl}
              nextLabel={isAr ? 'التالي' : 'Next'}
              prevLabel={isAr ? 'السابق' : 'Previous'}
            >
              {popularServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} isAr={isAr} index={i} />
              ))}
            </HorizontalSlider>
          </div>
        </section>
      )}

      {/* ─── CATEGORY SECTIONS (HORIZONTAL SLIDERS) ─── */}
      {categories.map((cat, catIndex) => {
        const catServices = services.filter((s) => s.category === cat.key);
        if (catServices.length === 0) return null;
        return (
          <section
            key={cat.key}
            className={cn(
              'py-14 md:py-20',
              catIndex % 2 === 0
                ? 'bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'
                : 'bg-white dark:bg-slate-900'
            )}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeading
                title={isAr ? cat.labelAr : cat.labelEn}
                subtitle={isAr ? `${cat.count} خدمات متاحة` : `${cat.count} services available`}
                align="start"
                action={{
                  label: isAr ? 'تصفح الكل' : 'Browse all',
                  href: `/services?category=${encodeURIComponent(cat.key)}`,
                }}
              />
              <HorizontalSlider
                isRtl={isRtl}
                nextLabel={isAr ? 'التالي' : 'Next'}
                prevLabel={isAr ? 'السابق' : 'Previous'}
              >
                {catServices.map((service, i) => (
                  <ServiceCard key={service.id} service={service} isAr={isAr} index={i} />
                ))}
              </HorizontalSlider>
            </div>
          </section>
        );
      })}

      {/* ─── ALL SERVICES CTA ─── */}
      <section className="py-10 md:py-14 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/services">
            <Button variant="secondary" size="lg" className="gap-2">
              {isAr ? 'إظهار جميع الخدمات' : 'Show All Services'}
              <Arrow size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2580eb]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#14b8a6]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              {isAr ? 'لماذا المنجز؟' : 'Why Al-Munjiz?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {whyUs.map((reason, i) => {
              const WhyIcon = whyUsIconMap[reason.icon] || Zap;
              return (
                <motion.div
                  key={reason.titleAr}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group p-4 sm:p-5 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-500"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#2580eb]/20 to-[#14b8a6]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <WhyIcon size={16} className="sm:w-[18px] sm:h-[18px] text-[#14b8a6]" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{isAr ? reason.titleAr : reason.titleEn}</h3>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{isAr ? reason.descAr : reason.descEn}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              {isAr ? 'كيف يعمل المنجز؟' : 'How Al-Munjiz Works?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-[#2580eb]/20 via-[#14b8a6]/20 to-[#2580eb]/20" />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center p-6 md:p-8"
              >
                <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-base md:text-xl font-extrabold mx-auto mb-4 md:mb-6 shadow-lg shadow-[#2580eb]/30">
                  {step.num}
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2 md:mb-3">
                  {isAr ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {isAr ? step.descAr : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANIMATED STATS ─── */}
      <section className="py-14 md:py-20 gradient-animated relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {[
              { target: 10000, suffix: '+', labelAr: 'عميل سعيد', labelEn: 'Happy Clients', icon: Users },
              { target: 50000, suffix: '+', labelAr: 'طلب منجز', labelEn: 'Completed Orders', icon: Zap },
              { target: 500, suffix: '+', labelAr: 'خدمة متاحة', labelEn: 'Services Available', icon: Award },
              { target: 99, suffix: '%', labelAr: 'نسبة الرضا', labelEn: 'Satisfaction Rate', icon: Heart },
            ].map((stat, i) => (
              <motion.div
                key={stat.labelAr}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <stat.icon size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-2xl md:text-4xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-white/70">{isAr ? stat.labelAr : stat.labelEn}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[300px] h-[300px] bg-[#2580eb]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] bg-[#14b8a6]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3">
              {isAr ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </div>

          <HorizontalSlider
            isRtl={isRtl}
            nextLabel={isAr ? 'التالي' : 'Next'}
            prevLabel={isAr ? 'السابق' : 'Previous'}
            className="py-2"
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                data-slide
                className="w-[88%] sm:w-[47%] lg:w-[32%] shrink-0 p-5 sm:p-6 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500"
              >
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={15} className="sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5 sm:mb-6 line-clamp-4">
                  {isAr ? t.textAr : t.textEn}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {isAr ? t.nameAr.charAt(0) : t.nameEn.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{isAr ? t.nameAr : t.nameEn}</p>
                    <p className="text-xs text-slate-400">{isAr ? t.roleAr : t.roleEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </HorizontalSlider>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-14 md:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </div>

          {faq.length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faq.map((item) => ({
                    '@type': 'Question',
                    name: isAr ? item.questionAr : item.questionEn,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: isAr ? item.answerAr : item.answerEn,
                    },
                  })),
                }),
              }}
            />
          )}

          <div className="space-y-3">
            {faq.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-start hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {isAr ? item.questionAr : item.questionEn}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0"
                  >
                    <ChevronDown size={20} className="text-slate-400" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === i ? 'auto' : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 sm:px-5 pb-5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {isAr ? item.answerAr : item.answerEn}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BLOG PREVIEW ─── */}
      <section className="py-14 md:py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              {isAr ? 'آخر المقالات' : 'Latest Articles'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </div>

          <HorizontalSlider
            isRtl={isRtl}
            nextLabel={isAr ? 'التالي' : 'Next'}
            prevLabel={isAr ? 'السابق' : 'Previous'}
            className="py-2"
          >
            {blogPostsPreview.map((post, i) => (
              <Link
                key={i}
                href={`/blog/${post.slug}`}
                data-slide
                className="w-[88%] sm:w-[47%] lg:w-[31.5%] shrink-0 block group rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-black/5 hover:border-transparent transition-all duration-500"
              >
                <div className={`h-32 sm:h-40 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={36} className="sm:w-12 sm:h-12 text-white/30" />
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
                    <Calendar size={12} />
                    {new Date(post.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#2580eb] transition-colors">
                    {isAr ? post.title : post.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {isAr ? post.excerpt : post.excerptEn}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2580eb]">
                    {isAr ? 'اقرأ المزيد' : 'Read More'}
                    <Arrow size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </HorizontalSlider>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {contactCards.map((card, i) => (
              <motion.a
                key={card.title}
                href={card.href}
                {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.3 } }}
                className="group flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:shadow-black/5 hover:border-transparent transition-all duration-500"
              >
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <card.Icon size={20} style={{ color: card.color }} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400" dir="ltr">{card.value}</p>
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8 md:mt-10"
          >
            <a href={SUPPORT_CHANNELS.whatsapp.url} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#25A65E] hover:bg-[#208c4d] shadow-lg shadow-[#25A65E]/25 min-w-[220px]">
                <MessageCircle size={18} className={isAr ? 'ms-1' : 'me-1'} />
                {isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── REGISTER CTA ─── */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2580eb]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] bg-[#14b8a6]/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="text-slate-400 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              {isAr
                ? 'انضم لآلاف العملاء الذين يثقون بمنصة المنجز لاحتياجاتهم الإلكترونية'
                : 'Join thousands of clients who trust Al-Munjiz for their electronic needs'}
            </p>
            <Link href="/register">
              <Button size="lg" className="min-w-[220px]">
                {isAr ? 'أنشئ حسابك الآن' : 'Create Your Account'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}