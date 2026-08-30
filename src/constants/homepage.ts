export const DEFAULT_HOMEPAGE = {
  hero: {
    badgeAr: 'منصة المنجز',
    badgeEn: 'AL-MUNJIZ Platform',
    titleAr: 'منصتك المتكاملة لخدمات التأشيرات والسفر والأعمال',
    titleEn: 'Your all-in-one platform for visas, travel & business services',
    descriptionAr:
      'أنجز معاملاتك بسهولة، بسرعة، وبموثوقية من خلال منصة إلكترونية تجمع جميع خدمات التأشيرات والسفر والأعمال في مكان واحد.',
    descriptionEn:
      'Complete your transactions easily, quickly, and reliably through an electronic platform that brings all visa, travel and business services into one place.',
    button1Ar: 'تصفح الخدمات',
    button1En: 'Browse Services',
    button2Ar: 'تتبع الطلب',
    button2En: 'Track Order',
    image: '',
  },
  stats: [
    { number: '+17', labelAr: 'خدمة', labelEn: 'Services' },
    { number: '+500', labelAr: 'عميل', labelEn: 'Clients' },
    { number: '24/7', labelAr: 'دعم', labelEn: 'Support' },
    { number: '99%', labelAr: 'رضا العملاء', labelEn: 'Satisfaction' },
  ],
  whyUs: [
    { icon: 'Zap', titleAr: 'السرعة', titleEn: 'Speed', descAr: 'ننجز طلباتك في أسرع وقت ممكن', descEn: 'We complete your requests in the fastest time' },
    { icon: 'Shield', titleAr: 'الأمان', titleEn: 'Security', descAr: 'نضمن حماية بياناتك', descEn: 'We ensure the protection of your data' },
    { icon: 'BadgePercent', titleAr: 'الأسعار', titleEn: 'Prices', descAr: 'أسعار تنافسية وشفافة', descEn: 'Competitive and transparent prices' },
    { icon: 'Headphones', titleAr: 'الدعم', titleEn: 'Support', descAr: 'فريق دعم متاح على مدار الساعة', descEn: 'Support team available 24/7' },
    { icon: 'Award', titleAr: 'الجودة', titleEn: 'Quality', descAr: 'نلتزم بأعلى معايير الجودة', descEn: 'Highest quality standards' },
    { icon: 'Heart', titleAr: 'الثقة', titleEn: 'Trust', descAr: 'أكثر من 10,000 عميل يثقون بنا', descEn: 'Over 10,000 clients trust us' },
  ],
  steps: [
    { num: '01', titleAr: 'اختر الخدمة', titleEn: 'Choose Service', descAr: 'تصفح خدماتنا واختر ما يناسبك', descEn: 'Browse and choose what fits your needs' },
    { num: '02', titleAr: 'أرسل طلبك', titleEn: 'Submit Request', descAr: 'املأ البيانات وأرسل طلبك بسهولة', descEn: 'Fill in details and submit easily' },
    { num: '03', titleAr: 'تتبع واحصل', titleEn: 'Track & Receive', descAr: 'تابع طلبك واستلم نتائجك', descEn: 'Track status and receive results' },
  ],
  testimonials: [
    { nameAr: 'أحمد الشمري', nameEn: 'Ahmad Al-Shammari', roleAr: 'رائد أعمال', roleEn: 'Entrepreneur', textAr: 'خدمة ممتازة وسريعة جداً', textEn: 'Excellent and very fast service', rating: 5 },
    { nameAr: 'سارة العتيبي', nameEn: 'Sara Al-Otaibi', roleAr: 'موظفة حكومية', roleEn: 'Government Employee', textAr: 'منصة سهلة الاستخدام وفريق متعاون', textEn: 'Easy to use and helpful team', rating: 5 },
    { nameAr: 'خالد المطيري', nameEn: 'Khalid Al-Mutairi', roleAr: 'مدير شركة', roleEn: 'Company Manager', textAr: 'أفضل منصة للخدمات الإلكترونية', textEn: 'The best electronic services platform', rating: 5 },
  ],
  faq: [
    { questionAr: 'كيف أطلب خدمة؟', questionEn: 'How to order?', answerAr: 'تصفح خدماتنا واختر ما تحتاجه', answerEn: 'Browse and choose what you need' },
    { questionAr: 'ما هي طرق الدفع؟', questionEn: 'What payment methods?', answerAr: 'نقبل جميع البطاقات والتحويل البنكي', answerEn: 'We accept all cards and bank transfer' },
    { questionAr: 'كم تستغرق المعاملات؟', questionEn: 'How long do transactions take?', answerAr: 'تختلف حسب نوع الخدمة', answerEn: 'Varies by service type' },
  ],
};

export type DefaultHomepage = typeof DEFAULT_HOMEPAGE;