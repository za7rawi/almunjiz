'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MapPin, Clock, MessageCircle,
  Send, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SOCIAL_LINKS } from '@/constants';

interface SiteSettings {
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  addressEn?: string;
  workingHours?: string;
}

const fallbackContactInfo = [
  { icon: Phone, label: 'الهاتف', value: '+962791038472', href: 'tel:+962791038472', color: 'text-[#2580eb]' },
  { icon: Mail, label: 'البريد الإلكتروني', value: 'support@almunjiz.com', href: 'mailto:support@almunjiz.com', color: 'text-[#14b8a6]' },
  { icon: MessageCircle, label: 'واتساب', value: '+962791038472', href: 'https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز', color: 'text-emerald-500' },
  { icon: MapPin, label: 'العنوان', value: 'الرياض، المملكة العربية السعودية', color: 'text-[#7c3aed]' },
  { icon: Clock, label: 'ساعات العمل', value: 'الأحد - الخميس: 9 ص - 6 م', color: 'text-amber-500' },
];

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  useEffect(() => {
    fetch('/api/cms/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteSettings({
            phone: json.data.phone || json.data.contact_phone,
            email: json.data.email || json.data.contact_email,
            whatsapp: json.data.whatsapp || json.data.contact_whatsapp,
            address: json.data.address || json.data.contact_address,
            addressEn: json.data.addressEn || json.data.contact_address_en,
            workingHours: json.data.workingHours,
          });
        }
      })
      .catch(() => {});
  }, []);

  const phone = siteSettings.phone || fallbackContactInfo[0].value;
  const email = siteSettings.email || fallbackContactInfo[1].value;
  const whatsapp = siteSettings.whatsapp || fallbackContactInfo[2].value;
  const whatsappNum = whatsapp.replace(/[^0-9]/g, '');
  const address = siteSettings.address || fallbackContactInfo[3].value;
  const workingHours = siteSettings.workingHours || fallbackContactInfo[4].value;

  const contactInfo = [
    { icon: Phone, label: 'الهاتف', value: phone, href: `tel:${phone}`, color: 'text-[#2580eb]' },
    { icon: Mail, label: 'البريد الإلكتروني', value: email, href: `mailto:${email}`, color: 'text-[#14b8a6]' },
    { icon: MessageCircle, label: 'واتساب', value: whatsapp, href: `https://wa.me/${whatsappNum}?text=${encodeURIComponent('مرحباً، أريد الاستفسار عن خدمات المنجز')}`, color: 'text-emerald-500' },
    { icon: MapPin, label: 'العنوان', value: address, color: 'text-[#7c3aed]' },
    { icon: Clock, label: 'ساعات العمل', value: workingHours, color: 'text-amber-500' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    if (!formData.subject.trim()) newErrors.subject = 'الموضوع مطلوب';
    if (!formData.message.trim()) newErrors.message = 'الرسالة مطلوبة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitError(json.message || 'حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.');
      }
    } catch {
      setSubmitError('حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge variant="primary" className="mb-4">تواصل معنا</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            تواصل معنا
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            نحن هنا لمساعدتك. لا تتردد في التواصل معنا لأي استفسار أو مساعدة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <Card glass>
              <div className="p-6 sm:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      تم إرسال رسالتك بنجاح!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      سنقوم بالرد عليك في أقرب وقت ممكن
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {submitError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="الاسم الكامل"
                        placeholder="أدخل اسمك الكامل"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                      />
                      <Input
                        label="البريد الإلكتروني"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="رقم الهاتف"
                        type="tel"
                        placeholder="05XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        error={errors.phone}
                      />
                      <Input
                        label="الموضوع"
                        placeholder="موضوع الرسالة"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        error={errors.subject}
                      />
                    </div>
                    <div className="w-full space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        الرسالة
                      </label>
                      <textarea
                        placeholder="اكتب رسالتك هنا..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={cn(
                          'w-full rounded-xl border bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-slate-900 dark:text-white',
                          'placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-none transition-all duration-200',
                          errors.message
                            ? 'border-red-500 focus:ring-red-500/30'
                            : 'border-slate-200 dark:border-white/10 focus:border-[#2580eb] focus:ring-[#2580eb]/30',
                        )}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500">{errors.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      iconLeft={submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      disabled={submitting}
                    >
                      {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <Card key={info.label} glass>
                  {info.href ? (
                    <a
                      href={info.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Icon className={cn('w-6 h-6', info.color)} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{info.label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{info.value}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Icon className={cn('w-6 h-6', info.color)} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{info.label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{info.value}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}

            <Card glass>
              <div className="p-5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">تابعنا</p>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'تويتر', url: SOCIAL_LINKS.twitter },
                    { label: 'انستقرام', url: SOCIAL_LINKS.instagram },
                    { label: 'تيك توك', url: SOCIAL_LINKS.tiktok },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-[#2580eb]/10 hover:text-[#2580eb] transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </Card>

            <Card glass>
              <div className="p-5 h-[180px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/2 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-10 h-10 text-[#2580eb]/40 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">خريطة الموقع</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">{address}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
