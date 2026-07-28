'use client'

import { motion } from 'framer-motion'
import { FileCheck, AlertTriangle, DollarSign, XCircle, Copyright, Gavel, RefreshCw, Scale } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/store/language-store'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const sections = [
  {
    icon: FileCheck,
    titleAr: 'القبول بالشروط',
    titleEn: 'Acceptance of Terms',
    contentAr: 'باستخدامك لمنصة المنجز، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.',
    contentEn: 'By using the Al-Munjiz platform, you agree to these terms and conditions. If you do not agree to any of these terms, please do not use the platform.',
  },
  {
    icon: AlertTriangle,
    titleAr: 'استخدام الخدمات',
    titleEn: 'Service Usage',
    listAr: ['يجب أن يكون عمرك 18 سنة أو أكثر لإنشاء حساب واستخدام الخدمات', 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك', 'يجب تقديم معلومات صحيحة ودقيقة عند التسجيل', 'يُحظر استخدام المنصة لأي أغراض غير قانونية'],
    listEn: ['You must be 18 years or older to create an account and use services', 'You are responsible for maintaining the confidentiality of your account data', 'You must provide accurate and complete information when registering', 'Using the platform for any illegal purposes is prohibited'],
  },
  {
    icon: DollarSign,
    titleAr: 'الطلبات والمدفوعات',
    titleEn: 'Orders and Payments',
    listAr: ['جميع الأسعار معروضة بالريال السعودي وتشمل الضريبة', 'يتم خصم المبلغ عند تأكيد الطلب', 'يحق للمنصة إلغاء الطلب في حالة عدم اكتمال البيانات المطلوبة', 'تُعالج الطلبات خلال المدة المحددة لكل خدمة'],
    listEn: ['All prices are displayed in Saudi Riyal and include tax', 'The amount is deducted upon order confirmation', 'The platform reserves the right to cancel orders if required data is incomplete', 'Orders are processed within the specified timeframe for each service'],
  },
  {
    icon: XCircle,
    titleAr: 'الإلغاء والاسترداد',
    titleEn: 'Cancellation and Refund',
    contentAr: 'يمكن إلغاء الطلب واسترداد المبلغ وفقاً للسياسات التالية:',
    contentEn: 'Orders can be cancelled and amounts refunded according to the following policies:',
    listAr: ['إلغاء قبل بدء التنفيذ: استرداد كامل', 'إلغاء أثناء التنفيذ: استرداد 50%', 'بعد إتمام الخدمة: لا استرداد'],
    listEn: ['Cancellation before execution: full refund', 'Cancellation during execution: 50% refund', 'After service completion: no refund'],
  },
  {
    icon: Copyright,
    titleAr: 'الملكية الفكرية',
    titleEn: 'Intellectual Property',
    contentAr: 'جميع المحتويات والتصاميم والشعارات على المنصة هي ملكية فكرية حصرية لمنصة المنجز ولا يجوز نسخها أو استخدامها دون إذن.',
    contentEn: 'All content, designs, and logos on the platform are exclusive intellectual property of Al-Munjiz and may not be copied or used without permission.',
  },
  {
    icon: Gavel,
    titleAr: 'المسؤولية',
    titleEn: 'Liability',
    contentAr: 'تبذل المنجز جهوداً معقولة لضمان دقة وموثوقية الخدمات، غير أنها لا تضمن عدم وجود أخطاء. نحن غير مسؤولين عن أي أضرار ناتجة عن استخدام المنصة.',
    contentEn: 'Al-Munjiz makes reasonable efforts to ensure the accuracy and reliability of services, but does not guarantee the absence of errors. We are not liable for any damages arising from platform usage.',
  },
  {
    icon: RefreshCw,
    titleAr: 'تعديل الشروط',
    titleEn: 'Modifications',
    contentAr: 'نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة.',
    contentEn: 'We reserve the right to modify these terms at any time. You will be notified of any material changes via email or platform notification.',
  },
  {
    icon: Scale,
    titleAr: 'القانون الحاكم',
    titleEn: 'Governing Law',
    contentAr: 'تخضع هذه الشروط لقوانين المملكة العربية السعودية، وأي نزاعات تحل وفقاً للأنظمة السعودية المعمول بها.',
    contentEn: 'These terms are governed by the laws of the Kingdom of Saudi Arabia, and any disputes are resolved in accordance with applicable Saudi regulations.',
  },
]

export default function TermsPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'الشروط والأحكام' : 'Terms & Conditions' }]}
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
                {section.contentAr && (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAr ? section.contentAr : section.contentEn}
                  </p>
                )}
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
