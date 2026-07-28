'use client'

import { motion } from 'framer-motion'
import { Tag, Clock, Percent, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguageStore } from '@/store/language-store'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const offersData = [
  {
    id: 1,
    titleAr: 'خصم 30% على التأشيرات',
    titleEn: '30% Off Visas',
    descriptionAr: 'استمتع بخصم 30% على جميع خدمات التأشيرات خلال فترة محدودة',
    descriptionEn: 'Enjoy 30% off all visa services for a limited time',
    discount: 30,
    discountType: 'PERCENTAGE' as const,
    validUntil: '2026-08-15',
    servicesAr: ['تأشيرة سياحية', 'تأشيرة عمل', 'تأشيرة عبور'],
    servicesEn: ['Tourist Visa', 'Work Visa', 'Transit Visa'],
    code: 'VISA30',
  },
  {
    id: 2,
    titleAr: 'عرض العودة للمدارس',
    titleEn: 'Back to School Offer',
    descriptionAr: 'خصم 50 ر.س على خدمات تسجيل المركبات للطلاب والمعلمين',
    descriptionEn: '50 SAR off vehicle registration services for students and teachers',
    discount: 50,
    discountType: 'FIXED' as const,
    validUntil: '2026-09-01',
    servicesAr: ['تسجيل مركبة', 'تجديد تسجيل'],
    servicesEn: ['Vehicle Registration', 'Registration Renewal'],
    code: 'SCHOOL50',
  },
  {
    id: 3,
    titleAr: 'باقة الشركات',
    titleEn: 'Business Package',
    descriptionAr: 'خصم 25% لحزم الشركات على خدمات العقود والاستشارات',
    descriptionEn: '25% off corporate packages for contracts and consulting services',
    discount: 25,
    discountType: 'PERCENTAGE' as const,
    validUntil: '2026-12-31',
    servicesAr: ['عقد إيجار', 'عقد بيع', 'استشارة أعمال'],
    servicesEn: ['Rental Contract', 'Sales Contract', 'Business Consulting'],
    code: 'BIZ25',
  },
]

export default function OffersPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'العروض والخصومات' : 'Offers & Discounts'}
          subtitle={isAr ? 'استفد من عروضنا الحصرية' : 'Take advantage of our exclusive offers'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'العروض' : 'Offers' }]}
          gradient
        />

        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {offersData.map((offer) => (
            <motion.div key={offer.id} variants={fadeInUp}>
              <Card glass className="overflow-hidden h-full flex flex-col" padding="none">
                {/* Header */}
                <div className="relative h-40 bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center">
                  <div className="text-center text-white">
                    <Percent size={32} className="mx-auto mb-2" />
                    <div className="text-4xl font-bold">
                      {offer.discount}{offer.discountType === 'PERCENTAGE' ? '%' : ' SAR'}
                    </div>
                    <p className="text-white/80 text-sm mt-1">{isAr ? 'خصم' : 'Off'}</p>
                  </div>
                  <Badge variant="success" size="md" className="absolute top-3 right-3">
                    <Sparkles size={12} className="me-1" />
                    {isAr ? 'نشط' : 'Active'}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {isAr ? offer.titleAr : offer.titleEn}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-1">
                    {isAr ? offer.descriptionAr : offer.descriptionEn}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock size={14} />
                      <span>{isAr ? 'صالح حتى:' : 'Valid until:'} {offer.validUntil}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(isAr ? offer.servicesAr : offer.servicesEn).map((s) => (
                        <Badge key={s} variant="primary" size="sm">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{isAr ? 'كود الخصم' : 'Discount Code'}</span>
                      <code className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                        {offer.code}
                      </code>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
