'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Globe,
  FileText,
  Car,
  Plane,
  Building2,
  Headphones,
  Shield,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Zap,
  Award,
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Heart,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { Button } from '@/components/ui/button';
import { useAdminCMSStore, type ServiceData } from '@/store/admin-cms-store';
import { blogsData } from '@/lib/blogs-data';

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

const popularServiceIds = ['visa-tourist', 'visa-business', 'vehicle-transfer', 'government-services'];

const popularServiceColors: Record<string, string> = {
  'visa-tourist': '#2580eb',
  'visa-business': '#7c3aed',
  'vehicle-transfer': '#14b8a6',
  'government-services': '#F59E0B',
};

const popularServiceIcons: Record<string, string> = {
  'visa-tourist': 'bg-[#2580eb]/10',
  'visa-business': 'bg-[#7c3aed]/10',
  'vehicle-transfer': 'bg-[#14b8a6]/10',
  'government-services': 'bg-[#F59E0B]/10',
};

const categoryData = [
  { icon: Globe, titleAr: 'التأشيرات', titleEn: 'Visas', count: 4, color: '#2580eb', bgColor: 'bg-[#2580eb]/10' },
  { icon: FileText, titleAr: 'العقود', titleEn: 'Contracts', count: 2, color: '#14b8a6', bgColor: 'bg-[#14b8a6]/10' },
  { icon: Car, titleAr: 'المركبات', titleEn: 'Vehicles', count: 3, color: '#7c3aed', bgColor: 'bg-[#7c3aed]/10' },
  { icon: Plane, titleAr: 'السفر', titleEn: 'Travel', count: 2, color: '#F59E0B', bgColor: 'bg-[#F59E0B]/10' },
  { icon: Building2, titleAr: 'الخدمات الحكومية', titleEn: 'Government', count: 2, color: '#10B981', bgColor: 'bg-[#10B981]/10' },
  { icon: Headphones, titleAr: 'الاستشارات', titleEn: 'Consulting', count: 1, color: '#EF4444', bgColor: 'bg-[#EF4444]/10' },
];

const whyUsReasons = [
  { icon: Zap, titleAr: 'السرعة', titleEn: 'Speed', descAr: 'ننجز طلباتك في أسرع وقت ممكن بفضل أنظمتنا المتطورة وفريقنا المتميز.', descEn: 'We complete your requests in the fastest time possible with our advanced systems and distinguished team.' },
  { icon: Shield, titleAr: 'الأمان', titleEn: 'Security', descAr: 'نضمن حماية بياناتك ومعلوماتك الشخصية بأعلى معايير الأمان الإلكترونية.', descEn: 'We ensure the protection of your data and personal information with the highest electronic security standards.' },
  { icon: BadgePercent, titleAr: 'الأسعار', titleEn: 'Prices', descAr: 'نقدم أسعاراً تنافسية و transparentة مع جودة خدمة عالية.', descEn: 'We offer competitive and transparent prices with high service quality.' },
  { icon: Headphones, titleAr: 'الدعم', titleEn: 'Support', descAr: 'فريق دعم متاح على مدار الساعة للإجابة على استفساراتك ومساعدتك.', descEn: 'Support team available around the clock to answer your inquiries and help you.' },
  { icon: Award, titleAr: 'الجودة', titleEn: 'Quality', descAr: 'نلتزم بأعلى معايير الجودة في تقديم جميع خدماتنا الإلكترونية.', descEn: 'We are committed to the highest quality standards in providing all our electronic services.' },
  { icon: Heart, titleAr: 'الثقة', titleEn: 'Trust', descAr: ' أكثر من 10,000 عميل يثقون بنا وينصحون بخدماتنا لعملائهم.', descEn: 'Over 10,000 clients trust us and recommend our services to others.' },
];

const steps = [
  { num: '01', titleAr: 'اختر الخدمة', titleEn: 'Choose Service', descAr: 'تصفح خدماتنا واختر ما يناسب احتياجاتك', descEn: 'Browse our services and pick what fits your needs' },
  { num: '02', titleAr: 'أرسل طلبك', titleEn: 'Submit Request', descAr: 'املأ البيانات المطلوبة وأرسل طلبك بسهولة', descEn: 'Fill in the required details and submit easily' },
  { num: '03', titleAr: 'تتبع واحصل', titleEn: 'Track & Receive', descAr: 'تابع حالة طلبك واستلم نتائجك', descEn: 'Track your order status and receive your results' },
];

const testimonials = [
  { nameAr: 'أحمد الشمري', nameEn: 'Ahmad Al-Shammari', roleAr: 'رائد أعمال', roleEn: 'Entrepreneur', textAr: 'خدمة ممتازة وسريعة جداً. تم إنجاز تأشيرتي خلال يومين فقط. أنصح الجميع بالمنجز.', textEn: 'Excellent and very fast service. My visa was completed in just two days. I recommend everyone to use Al-Munjiz.', rating: 5 },
  { nameAr: 'سارة العتيبي', nameEn: 'Sara Al-Otaibi', roleAr: 'موظفة حكومية', roleEn: 'Government Employee', textAr: 'منصة سهلة الاستخدام وفريق دعم متعاون. ساعدوني في نقل ملكية سيارتي بسرعة.', textEn: 'Easy to use platform and a helpful support team. They helped me transfer my car ownership quickly.', rating: 5 },
  { nameAr: 'خالد المطيري', nameEn: 'Khalid Al-Mutairi', roleAr: 'مدير شركة', roleEn: 'Company Manager', textAr: 'أفضل منصة للخدمات الإلكترونية في المنطقة. أسعار منافسة وجودة عالية.', textEn: 'The best electronic services platform in the region. Competitive prices and high quality.', rating: 5 },
];

const faqItems = [
  { qAr: 'كيف أستطيع طلب خدمة من المنجز؟', qEn: 'How can I request a service from Al-Munjiz?', aAr: 'ببساطة تصفح خدماتنا، اختر الخدمة التي تحتاجها، املأ البيانات المطلوبة، ثم أرسل طلبك. سيتواصل معك فريقنا لتأكيد التفاصيل.', aEn: 'Simply browse our services, choose the service you need, fill in the required data, then submit your request. Our team will contact you to confirm the details.' },
  { qAr: 'ما هي طرق الدفع المتاحة؟', qEn: 'What payment methods are available?', aAr: 'نقبل جميع بطاقات الائتمان والخصم،تحويل بنكي، و Apple Pay و STC Pay.', aEn: 'We accept all credit and debit cards, bank transfers, Apple Pay, and STC Pay.' },
  { qAr: 'كم تستغرق إنجاز المعاملات؟', qEn: 'How long do transactions take?', aAr: 'تختلف المدة حسب نوع الخدمة. بعض الخدمات تُنجز فوراً، والبعض الآخر يستغرق من 1 إلى 7 أيام عمل.', aEn: 'The duration varies by service type. Some are completed instantly, while others take 1 to 7 business days.' },
  { qAr: 'هل يمكنني تتبع حالة طلبي؟', qEn: 'Can I track my order status?', aAr: 'نعم، يمكنك تتبع حالة طلبك من خلال منصتنا أو عبر رابط التتبع الذي يُرسل إلى بريدك الإلكتروني.', aEn: 'Yes, you can track your order status through our platform or via the tracking link sent to your email.' },
  { qAr: 'ما هي سياسة استرداد المبالغ؟', qEn: 'What is the refund policy?', aAr: 'في حال عدم إمكانية إنجاز الخدمة، يتم استرداد المبلغ بالكامل خلال 3-5 أيام عمل.', aEn: 'If the service cannot be completed, the full amount is refunded within 3-5 business days.' },
];

const blogPostsPreview = blogsData.slice(0, 3);

export default function HomePage() {
  const { language } = useLanguageStore();
  const { services: servicesData } = useAdminCMSStore();
  const { isRtl } = useDirection();
  const isAr = language === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const popularServices = servicesData.filter((s) => popularServiceIds.includes(s.id));

  const filteredServices = servicesData.filter((s) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.descriptionEn.toLowerCase().includes(q) ||
      s.categoryAr.includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const toggleFaq = useCallback((i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#2580eb]/20 rounded-full blur-[120px] animate-orb-1" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#14b8a6]/15 rounded-full blur-[120px] animate-orb-2" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#7c3aed]/10 rounded-full blur-[100px] animate-orb-3" />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-[15%] right-[10%] w-20 h-20 opacity-10 animate-float" viewBox="0 0 100 100" fill="none">
            <path d="M50 3 L92 26 L92 74 L50 97 L8 74 L8 26 Z" stroke="#2580eb" strokeWidth="1.5" />
          </svg>
          <svg className="absolute bottom-[20%] left-[8%] w-14 h-14 opacity-10 animate-float-slow" viewBox="0 0 100 100" fill="none">
            <path d="M50 3 L92 26 L92 74 L50 97 L8 74 L8 26 Z" stroke="#14b8a6" strokeWidth="1.5" />
          </svg>
          <div className="absolute top-[30%] left-[15%] w-3 h-3 bg-[#2580eb]/30 rounded-full animate-float-delayed" />
          <div className="absolute top-[60%] right-[20%] w-2 h-2 bg-[#14b8a6]/40 rounded-full animate-float" />
          <div className="absolute bottom-[30%] right-[35%] w-4 h-4 bg-[#7c3aed]/20 rounded-full animate-float-slow" />
          <div className="absolute top-[45%] left-[25%] w-8 h-8 border border-[#2580eb]/15 rotate-45 animate-spin-slow" />
          <svg className="absolute top-[70%] left-[40%] w-10 h-10 opacity-[0.07] animate-float-delayed" viewBox="0 0 100 100" fill="none">
            <path d="M50 3 L92 26 L92 74 L50 97 L8 74 L8 26 Z" stroke="#7c3aed" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight">
              <span className="text-white">{isAr ? 'منصة ' : 'Platform '}</span>
              <span className="bg-gradient-to-r from-[#2580eb] via-[#14b8a6] to-[#2580eb] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-premium">
                {isAr ? 'المنجز' : 'Al-Munjiz'}
              </span>
              <br />
              <span className="text-white/90">{isAr ? 'للخدمات الإلكترونية' : 'for Electronic Services'}</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {isAr ? 'حلول سريعة وموثوقة لاحتياجاتك الإلكترونية' : 'Fast and reliable solutions for your electronic needs'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/services">
              <Button size="lg" className="min-w-[200px]">
                {isAr ? 'تصفح خدماتنا' : 'Browse Services'}
              </Button>
            </Link>
            <Link href="/track-order">
              <Button variant="secondary" size="lg" className="min-w-[200px] border-white/25 text-white hover:bg-white/10">
                {isAr ? 'تتبع طلبك' : 'Track Order'}
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, number: '+10,000', labelAr: 'عميل', labelEn: 'Clients' },
                { icon: Zap, number: '+50,000', labelAr: 'طلب', labelEn: 'Orders' },
                { icon: Clock, number: '24/7', labelAr: 'دعم', labelEn: 'Support' },
                { icon: Award, number: '%99', labelAr: 'رضا', labelEn: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.labelAr} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2580eb]/20 to-[#14b8a6]/20 flex items-center justify-center shrink-0">
                    <stat.icon size={18} className="text-[#14b8a6]" />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-extrabold text-white">{stat.number}</div>
                    <div className="text-xs text-slate-400">{isAr ? stat.labelAr : stat.labelEn}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── SECTION 2: SERVICES SEARCH BAR ─── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp}>
            <div className="relative">
              <Search size={20} className="absolute start-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن الخدمة التي تحتاجها...' : 'Search for the service you need...'}
                className="w-full ps-13 pe-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2580eb]/30 focus:border-[#2580eb] focus:bg-white shadow-sm transition-all duration-300"
              />
            </div>
          </motion.div>

          {filteredServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            >
              {filteredServices.slice(0, 6).map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                    <Globe size={18} className="text-[#2580eb]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{isAr ? service.name : service.nameEn}</p>
                    <p className="text-sm text-slate-500 truncate">{isAr ? service.description : service.descriptionEn}</p>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-400 shrink-0" />
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ─── SECTION 3: MOST POPULAR SERVICES ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {isAr ? 'الخدمات الأكثر طلباً' : 'Most Popular Services'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto mb-4" />
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              {isAr ? 'الخدمات الأكثر طلباً من عملائنا الكرام' : 'Our most requested services by our valued clients'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {popularServices.map((service, i) => {
              const color = popularServiceColors[service.id] ?? '#2580eb';
              const iconBg = popularServiceIcons[service.id] ?? 'bg-[#2580eb]/10';
              const ServiceIcon = service.icon === 'Car' ? Car : service.icon === 'Shield' ? Shield : Globe;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className="group p-4 sm:p-6 rounded-2xl border border-slate-100 hover:border-transparent bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ border: `1px solid ${color}20` }} />
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl ${iconBg} flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <ServiceIcon size={20} className="sm:w-6 sm:h-6" style={{ color }} />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 line-clamp-1">
                    {isAr ? service.name : service.nameEn}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 flex-1">
                    {isAr ? service.description : service.descriptionEn}
                  </p>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 bg-slate-100 px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock size={10} className="sm:w-3 sm:h-3" />
                      {isAr ? service.duration : service.durationEn}
                    </span>
                    <span className="text-xs sm:text-sm font-bold" style={{ color }}>
                      {service.price} {isAr ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                  <Link href={`/services/${service.id}`}>
                    <Button fullWidth size="sm" className="mt-auto text-xs sm:text-sm">
                      {isAr ? 'اطلب الآن' : 'Order Now'}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="secondary" size="lg" className="gap-2">
                {isAr ? 'إظهار المزيد من الخدمات' : 'Show More Services'}
                <Arrow size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: ALL SERVICES GRID ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {isAr ? 'جميع خدماتنا' : 'All Our Services'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto mb-4" />
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              {isAr ? 'تصفح جميع فئات خدماتنا المتنوعة' : 'Browse all our diverse service categories'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {categoryData.map((cat, i) => (
              <motion.div
                key={cat.titleAr}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                <Link href="/services" className="flex items-center gap-3 sm:gap-4 p-3 sm:p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:shadow-black/5 hover:border-transparent transition-all duration-500 group">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${cat.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon size={18} className="sm:w-6 sm:h-6" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 truncate">{isAr ? cat.titleAr : cat.titleEn}</h3>
                    <p className="text-xs sm:text-sm text-slate-500">{cat.count} {isAr ? 'خدمات' : 'services'}</p>
                  </div>
                  <Arrow size={16} className="text-slate-300 group-hover:text-[#2580eb] transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: WHY AL-MUNJIZ ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2580eb]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#14b8a6]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              {isAr ? 'لماذا المنجز؟' : 'Why Al-Munjiz?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto mb-4" />
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              {isAr ? 'نقدم لك تجربة فريدة تجمع بين السرعة والأمان والجودة' : 'We offer you a unique experience combining speed, security, and quality'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUsReasons.map((reason, i) => (
              <motion.div
                key={reason.titleAr}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2580eb]/20 to-[#14b8a6]/20 flex items-center justify-center mb-4">
                  <reason.icon size={22} className="text-[#14b8a6]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{isAr ? reason.titleAr : reason.titleEn}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{isAr ? reason.descAr : reason.descEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: HOW IT WORKS ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {isAr ? 'كيف يعمل المنجز؟' : 'How Al-Munjiz Works?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto mb-4" />
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              {isAr ? 'ثلاث خطوات بسيطة للحصول على خدماتك' : 'Three simple steps to get your services'}
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-[#2580eb]/20 via-[#14b8a6]/20 to-[#2580eb]/20" />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center p-8"
              >
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-6 shadow-lg shadow-[#2580eb]/30">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {isAr ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {isAr ? step.descAr : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: STATISTICS ─── */}
      <section className="py-20 md:py-24 gradient-animated relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={24} className="text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/70">{isAr ? stat.labelAr : stat.labelEn}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: TESTIMONIALS ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-[300px] h-[300px] bg-[#2580eb]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] bg-[#14b8a6]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              {isAr ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  {isAr ? t.textAr : t.textEn}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {isAr ? t.nameAr.charAt(0) : t.nameEn.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{isAr ? t.nameAr : t.nameEn}</p>
                    <p className="text-xs text-slate-400">{isAr ? t.roleAr : t.roleEn}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: FAQ ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </motion.div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">
                    {isAr ? item.qAr : item.qEn}
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
                  <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed">
                    {isAr ? item.aAr : item.aEn}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: BLOG PREVIEW ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {isAr ? 'آخر المقالات' : 'Latest Articles'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPostsPreview.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
              >
                <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={48} className="text-white/30" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Calendar size={12} />
                    {new Date(post.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#2580eb] transition-colors">
                    {isAr ? post.title : post.titleEn}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {isAr ? post.excerpt : post.excerptEn}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2580eb]"
                  >
                    {isAr ? 'اقرأ المزيد' : 'Read More'}
                    <Arrow size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: CONTACT CTA ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {isAr ? 'تواصل معنا' : 'Contact Us'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full mx-auto mb-4" />
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              {isAr ? 'نحن هنا لمساعدتك. تواصل معنا بأي طريقة تناسبك.' : 'We are here to help you. Contact us in any way that suits you.'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-[#2580eb]/10 flex items-center justify-center mb-4">
                <Phone size={24} className="text-[#2580eb]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{isAr ? 'الهاتف' : 'Phone'}</h3>
              <p className="text-slate-500 text-sm" dir="ltr">+962791038472</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center mb-4">
                <Mail size={24} className="text-[#14b8a6]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{isAr ? 'البريد الإلكتروني' : 'Email'}</h3>
              <p className="text-slate-500 text-sm" dir="ltr">info@almunjiz.com</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-[#25A65E]/10 flex items-center justify-center mb-4">
                <MessageCircle size={24} className="text-[#25A65E]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">WhatsApp</h3>
              <p className="text-slate-500 text-sm" dir="ltr">+962791038472</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            <a href="https://wa.me/962791038472" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#25A65E] hover:bg-[#208c4d] shadow-lg shadow-[#25A65E]/25 min-w-[220px]">
                <MessageCircle size={18} className={isAr ? 'ms-1' : 'me-1'} />
                {isAr ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 12: REGISTER CTA ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2580eb]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] bg-[#14b8a6]/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              {isAr ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
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
