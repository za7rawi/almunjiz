'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, HelpCircle, MessageSquare, CreditCard, User } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/store/language-store'

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

const faqCategories = [
  { id: 'general', labelAr: 'عام', labelEn: 'General', icon: HelpCircle },
  { id: 'orders', labelAr: 'الطلبات', labelEn: 'Orders', icon: MessageSquare },
  { id: 'payment', labelAr: 'المدفوعات', labelEn: 'Payments', icon: CreditCard },
  { id: 'account', labelAr: 'الحساب', labelEn: 'Account', icon: User },
]

const faqs = [
  { id: 1, category: 'general', questionAr: 'ما هو منصة المنجز؟', questionEn: 'What is Al-Munjiz?', answerAr: 'منصة المنجز هي منصة إلكترونية متكاملة تقدم مجموعة شاملة من الخدمات الإلكترونية للأفراد والشركات في المملكة العربية السعودية.', answerEn: 'Al-Munjiz is an integrated electronic platform providing a comprehensive range of electronic services for individuals and businesses in Saudi Arabia.' },
  { id: 2, category: 'general', questionAr: 'كيف يمكنني التواصل مع الدعم؟', questionEn: 'How can I contact support?', answerAr: 'يمكنك التواصل معنا عبر الواتساب أو البريد الإلكتروني أو من خلال نموذج التواصل في صفحة اتصل بنا.', answerEn: 'You can contact us via WhatsApp, email, or through the contact form on our Contact Us page.' },
  { id: 3, category: 'general', questionAr: 'هل المنصة متاحة على الهاتف؟', questionEn: 'Is the platform available on mobile?', answerAr: 'نعم، المنصة متوافقة مع جميع الأجهزة المحمولة وتعمل بشكل ممتاز على الهواتف الذكية.', answerEn: 'Yes, the platform is compatible with all mobile devices and works great on smartphones.' },
  { id: 4, category: 'orders', questionAr: 'كيف أتتبع طلبي؟', questionEn: 'How do I track my order?', answerAr: 'يمكنك تتبع طلبك من خلال صفحة تتبع الطلب بإدخال رقم الطلب الذي استلمته عند التسجيل.', answerEn: 'You can track your order through the Track Order page by entering the order number you received upon registration.' },
  { id: 5, category: 'orders', questionAr: 'كم تستغرق معالجة الطلبات؟', questionEn: 'How long does order processing take?', answerAr: 'تختلف مدة المعالجة حسب نوع الخدمة، عادة من 1 إلى 7 أيام عمل.', answerEn: 'Processing time varies by service type, typically 1 to 7 business days.' },
  { id: 6, category: 'orders', questionAr: 'هل يمكنني إلغاء طلبي؟', questionEn: 'Can I cancel my order?', answerAr: 'نعم، يمكنك إلغاء الطلب قبل بدء التنفيذ. يتم خصم نسبة معينة من المبلغ كرسوم إلغاء.', answerEn: 'Yes, you can cancel the order before execution begins. A percentage of the amount is deducted as a cancellation fee.' },
  { id: 7, category: 'payment', questionAr: 'ما هي طرق الدفع المتاحة؟', questionEn: 'What payment methods are available?', answerAr: 'نقبل جميع بطاقات الائتمان (فيزا، ماستركارد)، مدى، آبل باي، تحويل بنكي، وSTC Pay.', answerEn: 'We accept all credit cards (Visa, Mastercard), Mada, Apple Pay, bank transfer, and STC Pay.' },
  { id: 8, category: 'payment', questionAr: 'هل يمكنني استرداد المبلغ؟', questionEn: 'Can I get a refund?', answerAr: 'نعم، يمكنك استرداد المبلغ في حالة إلغاء الطلب قبل بدء التنفيذ مع خصم نسبة معينة.', answerEn: 'Yes, you can get a refund if you cancel the order before execution begins, with a deduction of a certain percentage.' },
  { id: 9, category: 'account', questionAr: 'كيف أنشئ حساباً جديداً؟', questionEn: 'How do I create a new account?', answerAr: 'يمكنك إنشاء حساب جديد من خلال صفحة التسجيل بإدخال بياناتك الأساسية.', answerEn: 'You can create a new account through the registration page by entering your basic information.' },
  { id: 10, category: 'account', questionAr: 'نسيت كلمة المرور، ماذا أفعل؟', questionEn: 'I forgot my password, what should I do?', answerAr: 'يمكنك إعادة تعيين كلمة المرور من خلال صفحة نسيت كلمة المرور واتباع الخطوات المطلوبة.', answerEn: 'You can reset your password through the Forgot Password page and following the required steps.' },
]

export default function FAQPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'
  const [activeCategory, setActiveCategory] = useState('general')
  const [openId, setOpenId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = faqs.filter((faq) => {
    const matchCategory = faq.category === activeCategory
    const matchSearch =
      !searchQuery ||
      faq.questionAr.includes(searchQuery) ||
      faq.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerAr.includes(searchQuery) ||
      faq.answerEn.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          subtitle={isAr ? 'إجابات على أكثر الأسئلة تكراراً' : 'Answers to the most common questions'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'الأسئلة الشائعة' : 'FAQ' }]}
          gradient
        />

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في الأسئلة...' : 'Search questions...'}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30'
              }`}
            >
              <cat.icon size={16} />
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card glass className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
                    <HelpCircle size={32} className="text-[#2580eb]/40" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                    {isAr ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {isAr ? 'جرّب تغيير كلمات البحث أو الفئة' : 'Try changing your search terms or category'}
                  </p>
                </Card>
              </motion.div>
            ) : (
              filtered.map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card glass className="overflow-hidden" padding="none">
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="flex items-center justify-between w-full p-5 text-start hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {isAr ? faq.questionAr : faq.questionEn}
                      </span>
                      <motion.div animate={{ rotate: openId === faq.id ? 180 : 0 }} className="shrink-0 ms-3">
                        <ChevronDown size={18} className="text-slate-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openId === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
                            {isAr ? faq.answerAr : faq.answerEn}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
