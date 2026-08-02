import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

const DEFAULT_HOMEPAGE = {
  hero: {
    badgeAr: "منصة المنجز", badgeEn: "AL-MUNJIZ Platform",
    titleAr: "منصتك المتكاملة لخدمات التأشيرات والسفر والأعمال", titleEn: "Your all-in-one platform for visas, travel & business services",
    descriptionAr: "أنجز معاملاتك بسهولة، بسرعة، وبموثوقية من خلال منصة إلكترونية تجمع جميع خدمات التأشيرات والسفر والأعمال في مكان واحد.", descriptionEn: "Complete your transactions easily, quickly, and reliably through an electronic platform that brings all visa, travel and business services into one place.",
    button1Ar: "تصفح الخدمات", button1En: "Browse Services",
    button2Ar: "تتبع الطلب", button2En: "Track Order",
    image: ""
  },
  stats: [
    { number: "+17", labelAr: "خدمة", labelEn: "Services" },
    { number: "+500", labelAr: "عميل", labelEn: "Clients" },
    { number: "24/7", labelAr: "دعم", labelEn: "Support" },
    { number: "99%", labelAr: "رضا العملاء", labelEn: "Satisfaction" }
  ],
  whyUs: [
    { icon: "Zap", titleAr: "السرعة", titleEn: "Speed", descAr: "ننجز طلباتك في أسرع وقت ممكن", descEn: "We complete your requests in the fastest time" },
    { icon: "Shield", titleAr: "الأمان", titleEn: "Security", descAr: "نضمن حماية بياناتك", descEn: "We ensure the protection of your data" },
    { icon: "BadgePercent", titleAr: "الأسعار", titleEn: "Prices", descAr: "أسعار تنافسية وشفافة", descEn: "Competitive and transparent prices" },
    { icon: "Headphones", titleAr: "الدعم", titleEn: "Support", descAr: "فريق دعم متاح على مدار الساعة", descEn: "Support team available 24/7" },
    { icon: "Award", titleAr: "الجودة", titleEn: "Quality", descAr: "نلتزم بأعلى معايير الجودة", descEn: "Highest quality standards" },
    { icon: "Heart", titleAr: "الثقة", titleEn: "Trust", descAr: "أكثر من 10,000 عميل يثقون بنا", descEn: "Over 10,000 clients trust us" }
  ],
  steps: [
    { num: "01", titleAr: "اختر الخدمة", titleEn: "Choose Service", descAr: "تصفح خدماتنا واختر ما يناسبك", descEn: "Browse and choose what fits your needs" },
    { num: "02", titleAr: "أرسل طلبك", titleEn: "Submit Request", descAr: "املأ البيانات وأرسل طلبك بسهولة", descEn: "Fill in details and submit easily" },
    { num: "03", titleAr: "تتبع واحصل", titleEn: "Track & Receive", descAr: "تابع طلبك واستلم نتائجك", descEn: "Track status and receive results" }
  ],
  testimonials: [
    { nameAr: "أحمد الشمري", nameEn: "Ahmad Al-Shammari", roleAr: "رائد أعمال", roleEn: "Entrepreneur", textAr: "خدمة ممتازة وسريعة جداً", textEn: "Excellent and very fast service", rating: 5 },
    { nameAr: "سارة العتيبي", nameEn: "Sara Al-Otaibi", roleAr: "موظفة حكومية", roleEn: "Government Employee", textAr: "منصة سهلة الاستخدام وفريق متعاون", textEn: "Easy to use and helpful team", rating: 5 },
    { nameAr: "خالد المطيري", nameEn: "Khalid Al-Mutairi", roleAr: "مدير شركة", roleEn: "Company Manager", textAr: "أفضل منصة للخدمات الإلكترونية", textEn: "The best electronic services platform", rating: 5 }
  ],
  faq: [
    { questionAr: "كيف أطلب خدمة؟", questionEn: "How to order?", answerAr: "تصفح خدماتنا واختر ما تحتاجه", answerEn: "Browse and choose what you need" },
    { questionAr: "ما هي طرق الدفع؟", questionEn: "What payment methods?", answerAr: "نقبل جميع البطاقات والتحويل البنكي", answerEn: "We accept all cards and bank transfer" },
    { questionAr: "كم تستغرق المعاملات؟", questionEn: "How long do transactions take?", answerAr: "تختلف حسب نوع الخدمة", answerEn: "Varies by service type" }
  ],
  seo: {
    metaTitleAr: "المنجز - منصة الخدمات الإلكترونية", metaTitleEn: "Al-Munjiz - Electronic Services Platform",
    metaDescriptionAr: "منصة المنجز للخدمات الإلكترونية المتكاملة", metaDescriptionEn: "Al-Munjiz electronic services platform",
    keywordsAr: "خدمات إلكترونية,منجز,تأشيرات,عقود", keywordsEn: "electronic services,almunjiz,visas,contracts",
    ogImage: ""
  }
};

function normalizeStats(stats: unknown) {
  if (!Array.isArray(stats) || stats.length === 0) return DEFAULT_HOMEPAGE.stats;
  const first = stats[0] as { number?: unknown; value?: unknown; label?: { ar?: string; en?: string } };
  if (first.number !== undefined) return stats;
  return stats.map((s) => {
    const item = s as { value?: unknown; label?: { ar?: string; en?: string } };
    return {
      number: String(item.value ?? ''),
      labelAr: item.label?.ar ?? '',
      labelEn: item.label?.en ?? '',
    };
  });
}

function normalizeHero(raw: unknown) {
  const hero = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const merged = { ...DEFAULT_HOMEPAGE.hero, ...hero };
  const isLegacyBadge =
    hero.badgeAr === undefined &&
    (hero.titleAr === 'منصة المنجز' || hero.titleAr === 'Al-Munjiz Platform');
  if (isLegacyBadge) {
    merged.badgeAr = String(hero.titleAr ?? DEFAULT_HOMEPAGE.hero.badgeAr);
    merged.badgeEn = String(hero.titleEn ?? DEFAULT_HOMEPAGE.hero.badgeEn);
    merged.titleAr =
      typeof hero.subtitleAr === 'string' && hero.subtitleAr
        ? hero.subtitleAr
        : DEFAULT_HOMEPAGE.hero.titleAr;
    merged.titleEn =
      typeof hero.subtitleEn === 'string' && hero.subtitleEn
        ? hero.subtitleEn
        : DEFAULT_HOMEPAGE.hero.titleEn;
  }
  return merged;
}

function normalizeHomepageData(raw: unknown) {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const whyUs = Array.isArray(data.whyUs) && data.whyUs.length ? data.whyUs : DEFAULT_HOMEPAGE.whyUs;
  const steps = Array.isArray(data.steps) && data.steps.length ? data.steps : DEFAULT_HOMEPAGE.steps;
  const testimonials =
    Array.isArray(data.testimonials) && data.testimonials.length
      ? data.testimonials
      : DEFAULT_HOMEPAGE.testimonials;
  const faq = Array.isArray(data.faq) && data.faq.length ? data.faq : DEFAULT_HOMEPAGE.faq;
  const seo = (data.seo && typeof data.seo === 'object' ? data.seo : {}) as Record<string, unknown>;
  return {
    ...DEFAULT_HOMEPAGE,
    ...data,
    hero: normalizeHero(data.hero),
    stats: normalizeStats(data.stats),
    whyUs,
    steps,
    testimonials,
    faq,
    seo: { ...DEFAULT_HOMEPAGE.seo, ...seo },
  };
}

export async function GET() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { section: 'homepage' },
    });

    const data = content ? normalizeHomepageData(content.data) : DEFAULT_HOMEPAGE;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: DEFAULT_HOMEPAGE, error: error instanceof Error ? 'An error occurred' : 'Failed to fetch homepage content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const content = await prisma.siteContent.upsert({
      where: { section: 'homepage' },
      update: { data: body, updatedAt: new Date() },
      create: { section: 'homepage', data: body, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: normalizeHomepageData(content.data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: {}, error: error instanceof Error ? 'An error occurred' : 'Failed to update homepage content' },
      { status: 500 }
    );
  }
}
