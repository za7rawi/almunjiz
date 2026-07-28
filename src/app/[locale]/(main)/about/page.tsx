'use client'

import { motion } from 'framer-motion'
import { Target, Zap, Heart, Lightbulb, Users, Package, Star, TrendingUp, Rocket, Shield, Award, Globe } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/store/language-store'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function AboutPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  const stats = [
    { number: '+10,000', labelAr: 'عميل سعيد', labelEn: 'Happy Clients', icon: Users, color: 'from-[#2580eb] to-[#14b8a6]' },
    { number: '+50,000', labelAr: 'طلب منجز', labelEn: 'Completed Orders', icon: Package, color: 'from-[#7c3aed] to-[#2580eb]' },
    { number: '+500', labelAr: 'خدمة متاحة', labelEn: 'Services Available', icon: Star, color: 'from-[#14b8a6] to-emerald-500' },
    { number: '%99', labelAr: 'نسبة الرضا', labelEn: 'Satisfaction Rate', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
  ]

  const values = [
    { icon: Target, titleAr: 'الجودة', titleEn: 'Quality', descAr: 'نلتزم بأعلى معايير الجودة في جميع خدماتنا', descEn: 'We commit to the highest quality standards in all our services', color: 'text-[#2580eb]' },
    { icon: Zap, titleAr: 'السرعة', titleEn: 'Speed', descAr: 'نقدم خدمات سريعة وفعالة لتوفير وقتك', descEn: 'We deliver fast and efficient services to save your time', color: 'text-[#14b8a6]' },
    { icon: Heart, titleAr: 'الثقة', titleEn: 'Trust', descAr: 'بناء علاقات قوية مبنية على الثقة والشفافية', descEn: 'Building strong relationships based on trust and transparency', color: 'text-[#7c3aed]' },
    { icon: Lightbulb, titleAr: 'الابتكار', titleEn: 'Innovation', descAr: 'نسعى دائماً لتقديم حلول مبتكرة ومتطورة', descEn: 'We always strive to deliver innovative and evolving solutions', color: 'text-amber-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'من نحن' : 'About Us'}
          subtitle={isAr ? 'تعرف على المنجز وقصتنا' : 'Learn about Al-Munjiz and our story'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'من نحن' : 'About Us' }]}
          gradient
        />

        {/* Hero Section */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                {isAr ? 'منصة' : 'Platform'} <span className="bg-gradient-to-r from-[#2580eb] to-[#14b8a6] bg-clip-text text-transparent">{isAr ? 'المنجز' : 'Al-Munjiz'}</span> {isAr ? 'للخدمات الإلكترونية' : 'for Electronic Services'}
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  {isAr
                    ? 'أسست منصة المنجز بهدف تقديم حلول إلكترونية متكاملة تلبي احتياجات الأفراد والشركات في المملكة العربية السعودية.'
                    : 'Al-Munjiz was established to provide comprehensive electronic solutions that meet the needs of individuals and businesses in Saudi Arabia.'}
                </p>
                <p>
                  {isAr
                    ? 'نسعى لتبسيط الإجراءات الحكومية والتجارية من خلال منصة سهلة الاستخدام توفر مجموعة شاملة من الخدمات الإلكترونية بجودة عالية وأسعار منافسة.'
                    : 'We strive to simplify government and commercial procedures through an easy-to-use platform that provides a comprehensive range of electronic services with high quality and competitive prices.'}
                </p>
                <p>
                  {isAr
                    ? 'مع فريق عمل محترف ومتخصص، نضمن لعملائنا أفضل تجربة ممكنة من لحظة تقديم الطلب وحتى استلام النتيجة.'
                    : 'With a professional and specialized team, we ensure our customers get the best possible experience from the moment they place an order until they receive their results.'}
                </p>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 dark:from-[#2580eb]/20 dark:to-[#14b8a6]/20 flex items-center justify-center border border-slate-200 dark:border-white/10">
                <Rocket size={80} className="text-[#2580eb]/30" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#2580eb] flex items-center justify-center text-white shadow-xl shadow-[#7c3aed]/20">
                <Shield size={32} />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <motion.div key={stat.labelEn} variants={fadeInUp}>
                <Card glass className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#2580eb] to-[#14b8a6] bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm">
                    {isAr ? stat.labelAr : stat.labelEn}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
            {isAr ? 'قيمنا' : 'Our Values'}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <motion.div key={value.titleEn} variants={fadeInUp}>
                <Card glass className="p-6 text-center h-full hover:border-[#2580eb]/30 transition-all">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${value.color}`}>
                    <value.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {isAr ? value.titleAr : value.titleEn}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {isAr ? value.descAr : value.descEn}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <Card glass className="p-8 sm:p-12">
            <div className="text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white">
                <Award size={32} />
              </div>
              <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {isAr ? 'مهمتنا' : 'Our Mission'}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'تمكين الأفراد والشركات من الوصول إلى الخدمات الإلكترونية بسهولة وفعالية، مع توفير تجربة متميزة تلبي توقعاتهم وتتجاوزها.'
                  : 'Empowering individuals and businesses to access electronic services easily and efficiently, while delivering an exceptional experience that meets and exceeds their expectations.'}
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-6 flex items-center justify-center gap-2 text-[#2580eb]">
                <Globe size={20} />
                <span className="font-medium">{isAr ? 'نعمل بمعايير عالمية' : 'We operate with global standards'}</span>
              </motion.div>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
