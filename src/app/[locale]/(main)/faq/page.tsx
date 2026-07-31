'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, HelpCircle, MessageSquare, CreditCard, User, LifeBuoy, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { useLanguageStore } from '@/store/language-store'

interface FAQ {
  id: string
  question: string
  questionEn: string
  answer: string
  answerEn: string
  category: string
  sortOrder: number
}

const categoryMeta: Record<string, { labelAr: string; labelEn: string; icon: typeof HelpCircle }> = {
  general: { labelAr: 'عام', labelEn: 'General', icon: HelpCircle },
  orders: { labelAr: 'الطلبات', labelEn: 'Orders', icon: MessageSquare },
  payment: { labelAr: 'المدفوعات', labelEn: 'Payments', icon: CreditCard },
  support: { labelAr: 'الدعم', labelEn: 'Support', icon: LifeBuoy },
  account: { labelAr: 'الحساب', labelEn: 'Account', icon: User },
}

const categoryOrder = ['general', 'orders', 'payment', 'support', 'account']

export default function FAQPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeCategory, setActiveCategory] = useState('general')
  const [openId, setOpenId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/faqs')
        const data = await res.json()
        if (mounted && data.success) {
          setFaqs(data.data || [])
          const cats = buildCategories(data.data || [])
          if (cats.length > 0) setActiveCategory(cats[0])
        } else if (mounted) {
          setLoadError(true)
        }
      } catch {
        if (mounted) setLoadError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const categories = buildCategories(faqs)

  const filtered = faqs.filter((faq) => {
    const matchCategory = faq.category === activeCategory
    const matchSearch =
      !searchQuery ||
      faq.question.includes(searchQuery) ||
      faq.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.includes(searchQuery) ||
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
          {categories.map((cat) => {
            const meta = categoryMeta[cat] || { labelAr: cat, labelEn: cat, icon: HelpCircle }
            const Icon = meta.icon
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#2580eb]/30'
                }`}
              >
                <Icon size={16} />
                {isAr ? meta.labelAr : meta.labelEn}
              </button>
            )
          })}
        </div>

        {/* FAQ Items */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#2580eb]" />
          </div>
        ) : loadError ? (
          <Card glass className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
              <HelpCircle size={32} className="text-[#2580eb]/40" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
              {isAr ? 'تعذر تحميل الأسئلة الشائعة' : 'Failed to load FAQs'}
            </p>
          </Card>
        ) : (
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
                          {isAr ? faq.question : faq.questionEn || faq.question}
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
                              {isAr ? faq.answer : faq.answerEn || faq.answer}
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
        )}
      </div>
    </div>
  )
}

function buildCategories(faqs: FAQ[]): string[] {
  const present = new Set(faqs.map((f) => f.category))
  const ordered = categoryOrder.filter((c) => present.has(c))
  const extras = [...present].filter((c) => !categoryOrder.includes(c))
  return [...ordered, ...extras]
}
