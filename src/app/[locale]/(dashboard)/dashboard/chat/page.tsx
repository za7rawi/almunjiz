'use client'

import { motion } from 'framer-motion'
import { MessageCircle, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/store/language-store'

export default function ChatPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAr ? 'المحادثات' : 'Chat'}
        subtitle={isAr ? 'تواصل مع فريق الدعم' : 'Contact our support team'}
        breadcrumbs={[
          { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/dashboard' },
          { label: isAr ? 'المحادثات' : 'Chat' },
        ]}
        gradient
      />

      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center mb-6 shadow-lg shadow-[#2580eb]/20"
            >
              <MessageCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-bold text-slate-900 dark:text-white mb-2"
            >
              {isAr ? 'الدعم الفني قيد التطوير' : 'Support Chat Under Development'}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-8 leading-relaxed"
            >
              {isAr
                ? 'نعمل حالياً على تطوير نظام المحادثات المباشر لتقديم تجربة دعم أفضل. يمكنك التواصل معنا عبر واتساب في الوقت الحالي.'
                : 'We are currently developing our live chat system to provide a better support experience. You can reach us via WhatsApp in the meantime.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <a
                href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="primary"
                  size="lg"
                  iconLeft={<ExternalLink size={18} />}
                  className="rounded-2xl px-8"
                >
                  {isAr ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                </Button>
              </a>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
