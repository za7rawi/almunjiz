import { prisma } from '../src/lib/prisma';
import type { GatewayProvider, GatewayEnvironment } from '@prisma/client';

async function seedData() {
  console.log('Seeding payment gateways...');
  const gateways: {
    name: string; slug: string; provider: GatewayProvider; displayName: string; displayNameEn: string;
    description: string; isActive: boolean; isDefault: boolean; sortOrder: number;
    environment: GatewayEnvironment; supportsApplePay: boolean; supportsGooglePay: boolean;
    supportedCurrencies: string[]; supportedCountries: string[]; publicKey: string; secretKey: string;
  }[] = [
    {
      name: 'Tap Payments',
      slug: 'tap',
      provider: 'TAP',
      displayName: 'تاب',
      displayNameEn: 'Tap',
      description: 'بوابة دفع تاب - فيزا وماستركارد وMADA',
      publicKey: '',
      secretKey: '',
      isActive: false,
      isDefault: false,
      sortOrder: 1,
      environment: 'SANDBOX',
      supportsApplePay: true,
      supportsGooglePay: true,
      supportedCurrencies: ['SAR', 'USD', 'AED'],
      supportedCountries: ['SA', 'AE', 'KW', 'BH', 'OM', 'QA'],
    },
    {
      name: 'Moyasar',
      slug: 'moyasar',
      provider: 'MOYASAR',
      displayName: 'ميسر',
      displayNameEn: 'Moyasar',
      description: 'بوابة دفع ميسر - فيزا وماستركارد وMADA وApple Pay',
      publicKey: '',
      secretKey: '',
      isActive: false,
      isDefault: false,
      sortOrder: 2,
      environment: 'SANDBOX',
      supportsApplePay: true,
      supportsGooglePay: false,
      supportedCurrencies: ['SAR'],
      supportedCountries: ['SA'],
    },
    {
      name: 'STC Pay',
      slug: 'stc_pay',
      provider: 'CUSTOM',
      displayName: 'إس تي سي باي',
      displayNameEn: 'STC Pay',
      description: 'محفظة STC Pay للدفع عبر الجوال',
      publicKey: '',
      secretKey: '',
      isActive: false,
      isDefault: false,
      sortOrder: 3,
      environment: 'SANDBOX',
      supportsApplePay: false,
      supportsGooglePay: false,
      supportedCurrencies: ['SAR'],
      supportedCountries: ['SA'],
    },
    {
      name: 'Bank Transfer',
      slug: 'bank_transfer',
      provider: 'CUSTOM',
      displayName: 'تحويل بنكي',
      displayNameEn: 'Bank Transfer',
      description: 'الدفع عبر التحويل البنكي المباشر',
      publicKey: '',
      secretKey: '',
      isActive: false,
      isDefault: true,
      sortOrder: 99,
      environment: 'PRODUCTION',
      supportsApplePay: false,
      supportsGooglePay: false,
      supportedCurrencies: ['SAR', 'USD', 'AED'],
      supportedCountries: ['SA', 'AE', 'KW', 'BH', 'OM', 'QA', 'EG', 'JO'],
    },
  ];

  for (const gw of gateways) {
    const existing = await prisma.paymentGateway.findUnique({ where: { slug: gw.slug } });
    if (existing) {
      await prisma.paymentGateway.update({ where: { slug: gw.slug }, data: gw as never });
      console.log(`  Updated gateway: ${gw.slug}`);
    } else {
      await prisma.paymentGateway.create({ data: gw as never });
      console.log(`  Created gateway: ${gw.slug}`);
    }
  }

  console.log('Seeding FAQs...');
  const faqs = [
    {
      question: 'كيف يمكنني طلب خدمة؟',
      questionEn: 'How can I order a service?',
      answer: 'يمكنك تصفح الخدمات المتاحة، اختيار الخدمة المناسبة، ثم الضغط على "طلب الخدمة" واتباع الخطوات.',
      answerEn: 'Browse available services, select the appropriate service, then click "Order Service" and follow the steps.',
      category: 'عام',
      sortOrder: 1,
    },
    {
      question: 'ما هي مدة تنفيذ الطلب؟',
      questionEn: 'What is the order processing time?',
      answer: 'تختلف مدة التنفيذ حسب نوع الخدمة. يتم توضيح المدة المتوقعة في صفحة تفاصيل كل خدمة.',
      answerEn: 'Processing time varies by service type. The estimated duration is shown on each service detail page.',
      category: 'عام',
      sortOrder: 2,
    },
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      questionEn: 'How can I track my order?',
      answer: 'يمكنك تتبع طلبك من خلال لوحة التحكم الخاصة بك، حيث ستجد جميع طلباتك وحالتها محدثة.',
      answerEn: 'You can track your order through your dashboard, where all your orders and their status are updated.',
      category: 'عام',
      sortOrder: 3,
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      questionEn: 'What payment methods are available?',
      answer: 'نوفر عدة طرق دفع تشمل فيزا، ماستركارد، MADA، Apple Pay، STC Pay، والتحويل البنكي.',
      answerEn: 'We offer multiple payment methods including Visa, Mastercard, MADA, Apple Pay, STC Pay, and bank transfer.',
      category: 'مدفوعات',
      sortOrder: 4,
    },
    {
      question: 'هل يمكنني استرداد المبلغ؟',
      questionEn: 'Can I get a refund?',
      answer: 'نعم، يمكن استرداد المبلغ حسب سياسة الاسترداد لكل خدمة. يرجى التواصل مع فريق الدعم للمزيد من التفاصيل.',
      answerEn: 'Yes, refunds are available according to each service\'s refund policy. Please contact support for details.',
      category: 'مدفوعات',
      sortOrder: 5,
    },
    {
      question: 'كيف يمكنني التواصل مع الدعم الفني؟',
      questionEn: 'How can I contact support?',
      answer: 'يمكنك التواصل معنا عبر قسم "اتصل بنا" في الموقع، أو من خلال تذكرة دعم من لوحة التحكم.',
      answerEn: 'You can contact us through the "Contact Us" section on the website, or via a support ticket from the dashboard.',
      category: 'دعم',
      sortOrder: 6,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
      console.log(`  Created FAQ: ${faq.question.substring(0, 30)}...`);
    }
  }

  console.log('Seeding banners...');
  const banners = [
    {
      title: 'حلول متكاملة لتلبية احتياجاتك',
      titleEn: 'Integrated Solutions for Your Needs',
      subtitle: 'نقدم أفضل الخدمات في التأشيرات، السفر، الأعمال، والاستشارات',
      subtitleEn: 'We offer the best services in visas, travel, business, and consultations',
      image: '/images/banner-1.jpg',
      link: '/services',
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'خدمات سريعة وموثوقة',
      titleEn: 'Fast & Reliable Services',
      subtitle: 'فريق متخصص لضمان إنجاز معاملاتك بكفاءة عالية',
      subtitleEn: 'Specialized team to ensure your transactions are completed efficiently',
      image: '/images/banner-2.jpg',
      link: '/services',
      isActive: true,
      sortOrder: 2,
    },
    {
      title: 'تأشيرات سفر بكل احترافية',
      titleEn: 'Professional Travel Visas',
      subtitle: 'نوفر لك تأشيرات السفر بأسرع وقت وبأقل التكاليف',
      subtitleEn: 'We provide travel visas in the fastest time and at the lowest costs',
      image: '/images/banner-3.jpg',
      link: '/services?category=VISAS',
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({
      where: { title: banner.title },
    });
    if (!existing) {
      await prisma.banner.create({ data: banner });
      console.log(`  Created banner: ${banner.title.substring(0, 30)}...`);
    }
  }

  console.log('Seeding coupon...');
  const couponCode = 'WELCOME10';
  const existingCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
  if (!existingCoupon) {
    await prisma.coupon.create({
      data: {
        code: couponCode,
        discount: 10,
        discountType: 'PERCENTAGE',
        maxUses: 100,
        usedCount: 0,
        minAmount: 100,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2027-12-31'),
        isActive: true,
      },
    });
    console.log(`  Created coupon: ${couponCode}`);
  } else {
    console.log(`  Coupon ${couponCode} already exists`);
  }

  console.log('Seeding site settings...');
  const settings = [
    {
      key: 'site_name',
      value: { ar: 'المنجز', en: 'Almunjiz' },
    },
    {
      key: 'site_description',
      value: { ar: 'منصة متكاملة للخدمات الحكومية والأعمال', en: 'Integrated platform for government and business services' },
    },
    {
      key: 'contact_email',
      value: 'info@almunjiz.com',
    },
    {
      key: 'contact_phone',
      value: '+966500000000',
    },
    {
      key: 'social_media',
      value: {
        twitter: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        whatsapp: '+966500000000',
      },
    },
  ];

  for (const setting of settings) {
    const existing = await prisma.settings.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.settings.create({
        data: { key: setting.key, value: setting.value },
      });
      console.log(`  Created setting: ${setting.key}`);
    }
  }

  console.log('Seeding homepage content...');
  const existingContent = await prisma.siteContent.findUnique({ where: { section: 'homepage' } });
  if (!existingContent) {
    await prisma.siteContent.create({
      data: {
        section: 'homepage',
        data: {
          heroTitle: { ar: 'حلول متكاملة لتلبية احتياجاتك', en: 'Integrated Solutions for Your Needs' },
          heroSubtitle: { ar: 'نقدم أفضل الخدمات في التأشيرات، السفر، الأعمال، والاستشارات', en: 'We offer the best services in visas, travel, business, and consultations' },
          stats: [
            { label: { ar: 'خدمة متكاملة', en: 'Services' }, value: '17+' },
            { label: { ar: 'عميل سعيد', en: 'Happy Clients' }, value: '500+' },
            { label: { ar: 'طلب منجز', en: 'Orders Completed' }, value: '1000+' },
          ],
        },
      },
    });
    console.log('  Created homepage content');
  }

  console.log('Seed completed successfully!');
  await prisma.$disconnect();
}

seedData().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
