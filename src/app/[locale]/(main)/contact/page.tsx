'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone, Mail, MapPin, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/store/language-store'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function ContactPage() {
  const { language } = useLanguageStore()
  const isAr = language === 'ar'
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.message || (isAr ? 'حدث خطأ أثناء إرسال الرسالة' : 'An error occurred while sending the message'))
      }
    } catch {
      setError(isAr ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }))

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all placeholder:text-slate-400'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isAr ? 'تواصل معنا' : 'Contact Us'}
          subtitle={isAr ? 'نحن هنا لمساعدتك' : 'We are here to help you'}
          breadcrumbs={[{ label: isAr ? 'الرئيسية' : 'Home', href: '/' }, { label: isAr ? 'تواصل معنا' : 'Contact Us' }]}
          gradient
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate}>
              <Card glass className="p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">{isAr ? 'معلومات التواصل' : 'Contact Information'}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center"><Phone size={18} className="text-[#2580eb]" /></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400">{isAr ? 'الهاتف' : 'Phone'}</p><p className="text-sm font-medium text-slate-900 dark:text-white" dir="ltr">+962791038472</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center"><Mail size={18} className="text-[#14b8a6]" /></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400">{isAr ? 'البريد الإلكتروني' : 'Email'}</p><p className="text-sm font-medium text-slate-900 dark:text-white">info@almunjiz.com</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center"><MapPin size={18} className="text-[#7c3aed]" /></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400">{isAr ? 'العنوان' : 'Address'}</p><p className="text-sm font-medium text-slate-900 dark:text-white">{isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</p></div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ delay: 0.1 }}>
              <a href="https://wa.me/962791038472?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D9%86%D8%AC%D8%B2" target="_blank" rel="noopener noreferrer" className="block">
                <Card className="p-6 text-center bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white hover:shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
                  <MessageCircle size={32} className="mx-auto mb-2" />
                  <p className="font-bold">{isAr ? 'تواصل عبر الواتساب' : 'Chat on WhatsApp'}</p>
                  <p className="text-sm text-green-100">{isAr ? 'رد سريع وفوري' : 'Quick and instant reply'}</p>
                </Card>
              </a>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card glass className="p-8">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'أرسل رسالة' : 'Send a Message'}</h3>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {isAr ? 'تم إرسال رسالتك بنجاح' : 'Your message has been sent successfully'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {isAr ? 'سنتواصل معك في أقرب وقت ممكن' : 'We will contact you as soon as possible'}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
                      <AlertCircle size={16} />
                      {error}
                    </motion.div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'الاسم' : 'Name'}</label>
                      <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'الجوال' : 'Phone'}</label>
                      <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} dir="ltr" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'الموضوع' : 'Subject'}</label>
                      <input type="text" value={formData.subject} onChange={(e) => updateField('subject', e.target.value)} className={inputClass} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{isAr ? 'الرسالة' : 'Message'}</label>
                    <textarea rows={5} value={formData.message} onChange={(e) => updateField('message', e.target.value)} className={`${inputClass} resize-none`} required />
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={loading} iconLeft={!loading ? <Send size={16} /> : undefined}>
                    {isAr ? 'إرسال الرسالة' : 'Send Message'}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
