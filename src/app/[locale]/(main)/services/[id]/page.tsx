'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, DollarSign, CheckCircle, FileText,
  Package, Shield, Star, Globe, Car, Plane, Building2, Headphones,
  GraduationCap, Briefcase, Hotel, Laptop, MessageSquare, Home,
  FileSignature, Upload, Send, ChevronDown, ChevronUp, ClipboardList, Search, Settings, Bell, Stamp,
  Monitor, Zap, Mail, CreditCard, Video, Truck, List, Check, Lock, X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrencyStore } from '@/store/currency-store';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { formatPrice } from '@/lib/currency';
import type { ServiceData } from '@/types/service-data';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Globe, FileText, Car, Plane, Building2, Headphones, GraduationCap,
  Shield, Star, Briefcase, Hotel, Laptop, MessageSquare, Home,
  FileSignature, Upload, Send, CheckCircle, Package, Search, Stamp,
  Monitor, Bell, ClipboardList, Settings, Zap, Mail, CreditCard,
  Video, Truck, List,
};

const categoryColors: Record<string, string> = {
  VISAS: '#2580eb', CONTRACTS: '#14b8a6', VEHICLES: '#7c3aed',
  TRAVEL: '#F59E0B', BUSINESS: '#10B981', GOVERNMENT: '#EF4444',
  ELECTRONIC: '#3B82F6', UNIVERSITIES: '#8B5CF6', CONSULTATIONS: '#F97316',
  OTHER: '#6366F1',
};

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const { currency } = useCurrencyStore();
  const { isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const [service, setService] = useState<ServiceData | null | undefined>(undefined);
  const [allServices, setAllServices] = useState<ServiceData[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function fetchService() {
      try {
        const [serviceRes, allRes] = await Promise.all([
          fetch(`/api/services/${id}`),
          fetch('/api/services?limit=100'),
        ]);
        const serviceJson = await serviceRes.json();
        const allJson = await allRes.json();
        if (serviceJson.success) {
          setService(serviceJson.data);
        } else {
          setService(null);
        }
        if (allJson.success) {
          setAllServices(allJson.data.data);
        }
      } catch (e) {
        console.error('Failed to fetch service:', e);
        setService(null);
      }
    }
    fetchService();
  }, [id]);

  if (service === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2580eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Package size={36} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'الخدمة غير موجودة' : 'Service not found'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{isAr ? 'هذه الخدمة غير متاحة حالياً أو ربما تم حذفها' : 'This service is currently unavailable or may have been removed'}</p>
          <Link href="/services">
            <Button iconLeft={<ArrowLeft className="rtl:rotate-180" size={18} />}>{isAr ? 'العودة للخدمات' : 'Back to Services'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Star;
  const relatedServices = allServices
    .filter((s) => s.category === service.category && s.id !== service.id && s.isActive)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className={`relative overflow-hidden ${service.image ? '' : `bg-gradient-to-br ${service.gradient}`} text-white`}>
        {service.image && (
          <img src={service.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        {service.image && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />}
        {!service.image && <div className="absolute inset-0 bg-black/10" />}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-white/70 mb-4 sm:mb-6">
            <Link href="/" className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <Link href="/services" className="hover:text-white transition-colors">{isAr ? 'الخدمات' : 'Services'}</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span className="text-white font-medium">{isAr ? service.name : service.nameEn}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon size={24} className="sm:w-8 sm:h-8" />
                </div>
                <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-white/30">{service.categoryAr}</Badge>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">{isAr ? service.name : service.nameEn}</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-white/80 text-sm sm:text-lg max-w-2xl leading-relaxed">{isAr ? service.description : service.descriptionEn}</motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm text-xs sm:text-sm">
                  <Clock size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="font-medium">{isAr ? service.duration : service.durationEn}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <DollarSign size={18} />
                  <span className="font-medium">{isAr ? service.priceNote : service.priceNoteEn} {formatPrice(service.price, currency)}</span>
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              {isAuthenticated ? (
                <Link href={`/request/${service.id}`}>
                  <Button size="xl" className="bg-white text-slate-900 hover:bg-white/90 shadow-2xl shadow-black/20 text-lg px-8 py-4">
                    {isAr ? 'اطلب الآن' : 'Order Now'}
                    <ArrowLeft size={20} className="rtl:rotate-180" />
                  </Button>
                </Link>
              ) : (
                <Button size="xl" className="bg-white text-slate-900 hover:bg-white/90 shadow-2xl shadow-black/20 text-lg px-8 py-4" onClick={() => setShowLoginModal(true)}>
                  {isAr ? 'اطلب الآن' : 'Order Now'}
                  <ArrowLeft size={20} className="rtl:rotate-180" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{isAr ? 'عن الخدمة' : 'About Service'}</h2>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                  {(isAr ? service.fullDescription : service.fullDescriptionEn).split('\\n\\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'مميزات الخدمة' : 'Service Features'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(isAr ? service.features : service.featuresEn).map((feature, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Steps Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'مراحل التنفيذ' : 'Implementation Steps'}</h2>
                <div className="space-y-6">
                  {(isAr ? service.steps : service.stepsEn).map((step, i) => {
                    const StepIcon = iconMap[step.icon] || CheckCircle;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${service.gradient} text-white shadow-lg`}>
                            <StepIcon size={20} />
                          </div>
                          {i < (isAr ? service.steps : service.stepsEn).length - 1 && (
                            <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'الخطوة' : 'Step'} {i + 1}: {step.title}</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{step.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Required Documents Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'المستندات المطلوبة' : 'Required Documents'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(isAr ? service.requiredDocuments : service.requiredDocumentsEn).map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[#2580eb]" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Order Notice */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <div className="flex items-center gap-4 p-4 bg-[#2580eb]/5 rounded-xl border border-[#2580eb]/10">
                  <div className="w-12 h-12 rounded-xl bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                    <ClipboardList size={24} className="text-[#2580eb]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{isAr ? 'كيفية الطلب' : 'How to Order'}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr
                      ? 'اضغط على زر "اطلب الآن" لفتح صفحة الطلب حيث يمكنك إدخال بياناتك ورفع المستندات واختيار طريقة الدفع.'
                      : 'Click the "Order Now" button to open the order page where you can enter your details, upload documents, and choose a payment method.'
                    }</p>
                  </div>
                  {isAuthenticated ? (
                <Link href={`/request/${service.id}`}>
                      <Button variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>
                        {isAr ? 'اطلب الآن' : 'Order Now'}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />} onClick={() => setShowLoginModal(true)}>
                      {isAr ? 'اطلب الآن' : 'Order Now'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* FAQ Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
                <div className="space-y-3">
                  {(isAr ? service.faq : service.faqEn).map((item, i) => (
                    <div key={i} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">{item.question}</span>
                        {openFaq === i ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden">
                            <div className="px-4 pb-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'خدمات ذات صلة' : 'Related Services'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedServices.map((rel) => {
                    const RelIcon = iconMap[rel.icon] || Star;
                    const relColor = categoryColors[rel.category] || '#2580eb';
                    return (
                      <Link key={rel.id} href={`/services/${rel.id}`}>
                        <Card glass padding="md" className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${relColor}12` }}>
                              <RelIcon size={20} style={{ color: relColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{isAr ? rel.name : rel.nameEn}</h4>
                              <p className="text-xs text-slate-500">{isAr ? rel.duration : rel.durationEn}</p>
                            </div>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3">{isAr ? rel.description : rel.descriptionEn}</p>
                          <Badge variant="success" size="sm">{formatPrice(rel.price, currency)}</Badge>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <Card glass padding="lg">
                <div className="text-center mb-6">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{isAr ? service.priceNote : service.priceNoteEn}</p>
                  <div className="text-3xl font-bold gradient-text mb-1">{formatPrice(service.price, currency)}</div>
                  <p className="text-slate-400 text-xs">{isAr ? 'شامل ضريبة القيمة المضافة' : 'VAT included'}</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Clock size={18} className="text-[#2580eb] shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{isAr ? 'مدة التنفيذ:' : 'Duration:'} <strong>{isAr ? service.duration : service.durationEn}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Shield size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{isAr ? 'ضمان استرداد المبلغ' : 'Money-back guarantee'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <CreditCard size={18} className="text-[#7c3aed] shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{isAr ? 'دفع آمن ومشفر' : 'Secure and encrypted payment'}</span>
                  </div>
                </div>
                {isAuthenticated ? (
                  <Link href={`/request/${service.id}`} className="block">
                    <Button fullWidth size="lg" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>
                      {isAr ? 'اطلب الآن' : 'Order Now'}
                    </Button>
                  </Link>
                ) : (
                  <Button fullWidth size="lg" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />} onClick={() => setShowLoginModal(true)}>
                    {isAr ? 'اطلب الآن' : 'Order Now'}
                  </Button>
                )}
                <div className="mt-4 text-center">
                  <Link href="/track-order" className="text-sm text-[#2580eb] hover:underline">
                    {isAr ? 'هل لديك طلب سابق؟ تتبعه هنا' : 'Have a previous order? Track it here'}
                  </Link>
                </div>
              </Card>

              <Card glass padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                    <Headphones size={20} className="text-[#2580eb]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{isAr ? 'تحتاج مساعدة؟' : 'Need help?'}</p>
                    <p className="text-slate-500 text-xs">{isAr ? 'تواصل معنا على مدار الساعة' : 'Contact us 24/7'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#2580eb]/10 flex items-center justify-center mx-auto mb-6">
                  <Lock size={28} className="text-[#2580eb]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'يجب تسجيل الدخول أولًا' : 'Login Required'}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                  {isAr
                    ? 'لإكمال طلب الخدمة، يرجى تسجيل الدخول أو إنشاء حساب جديد'
                    : 'To complete the service request, please login or create a new account'
                  }
                </p>
                <div className="flex gap-3">
                  <Link href={`/login?redirect=/request/${service.id}`} className="flex-1">
                    <Button fullWidth variant="primary">
                      {isAr ? 'تسجيل الدخول' : 'Login'}
                    </Button>
                  </Link>
                  <Link href={`/register`} className="flex-1">
                    <Button fullWidth variant="secondary">
                      {isAr ? 'إنشاء حساب' : 'Create Account'}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
