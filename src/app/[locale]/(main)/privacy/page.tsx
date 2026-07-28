'use client'

import { motion } from 'framer-motion'
import { Shield, Eye, Database, Share2, UserCheck, Mail } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/store/language-store'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const sections = [
  {
    icon: Eye,
    titleAr: 'مقدمة',
    titleEn: 'Introduction',
    contentAr: 'تلتزم منصة المنجز بحماية خصوصيتك وأمن بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام منصتنا.',
    contentEn: 'Al-Munjiz is committed to protecting your privacy and personal data security. This policy explains how we collect, use, and protect your personal information when using our platform.',
  },
  {
    icon: Database,
    titleAr: 'جمع المعلومات',
    titleEn: 'Information Collection',
    contentAr: 'نجمع المعلومات التالية عند التسجيل واستخدام الخدمات:',
    contentEn: 'We collect the following information when you register and use our services:',
    listAr: ['الاسم الكامل وعنوان البريد الإلكتروني', 'رقم الجوال ورقم الهوية الوطنية', 'معلومات الدفع وسجل المعاملات', 'البيانات المقدمة في الطلبات والمستندات المرفقة'],
    listEn: ['Full name and email address', 'Mobile number and national ID', 'Payment information and transaction records', 'Data provided in orders and attached documents'],
  },
  {
    icon: Share2,
    titleAr: 'استخدام المعلومات',
    titleEn: 'Information Usage',
    contentAr: 'نستخدم معلوماتك للأغراض التالية:',
    contentEn: 'We use your information for the following purposes:',
    listAr: ['تقديم وتحسين الخدمات المطلوبة', 'التواصل معك بشأن طلباتك وحسابك', 'معالجة المدفوعات وإصدار الفواتير', 'إرسال الإشعارات والعروض الترويجية', 'الامتثال للمتطلبات القانونية والتنظيمية'],
    listEn: ['Providing and improving requested services', 'Communicating about your orders and account', 'Processing payments and issuing invoices', 'Sending notifications and promotional offers', 'Complying with legal and regulatory requirements'],
  },
  {
    icon: Shield,
    titleAr: 'حماية المعلومات',
    titleEn: 'Data Protection',
    contentAr: 'نستخدم تدابير أمنية متقدمة لحماية بياناتك من الوصول غير المصرح به أو الاستخدام أو الإفصاح أو التعديل أو التدمير. تتضمن هذه التدابير تشفير البيانات والحماية الفيزيائية والرقمية.',
    contentEn: 'We use advanced security measures to protect your data from unauthorized access, use, disclosure, modification, or destruction. These measures include data encryption and physical and digital protection.',
  },
  {
    icon: UserCheck,
    titleAr: 'مشاركة المعلومات',
    titleEn: 'Information Sharing',
    contentAr: 'لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية: عند موافقتك الصريحة، أو للامتثال للقوانين، أو لحماية حقوقنا وسلامة مستخدمينا.',
    contentEn: 'We do not sell or share your personal information with third parties except in the following cases: with your explicit consent, to comply with laws, or to protect our rights and the safety of our users.',
  },
  {
    icon: Mail,
    titleAr: 'تواصل معنا',
    titleEn: 'Contact Us',
    contentAr: ' لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: info@almunjiz.com',
    contentEn: 'For any inquiries about the Privacy Policy, please contact us via email: info@almunjiz.com',
  },
]

export default function PrivacyPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'سياسة الخصوصية' : 'Privacy Policy' }]}
          gradient
        />

        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
          <Card glass className="p-8 space-y-8">
            {sections.map((section, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 rounded-lg bg-[#2580eb]/10 text-[#2580eb]">
                    <section.icon size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isAr ? section.titleAr : section.titleEn}
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr ? section.contentAr : section.contentEn}
                </p>
                {section.listAr && (
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mt-3">
                    {(isAr ? section.listAr : section.listEn).map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}

            <motion.p variants={fadeInUp} className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5 pt-4">
              {isAr ? 'آخر تحديث: يناير 2026' : 'Last updated: January 2026'}
            </motion.p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
