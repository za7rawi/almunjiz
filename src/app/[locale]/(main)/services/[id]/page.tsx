'use client';

import { useState, useMemo } from 'react';
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
import { servicesData } from '@/lib/services-data';
import { useCurrencyStore } from '@/store/currency-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/currency';

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
  const service = useMemo(() => servicesData.find((s) => s.id === id), [id]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Package size={36} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">الخدمة غير موجودة</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">هذه الخدمة غير متاحة حالياً أو ربما تم حذفها</p>
          <Link href="/services">
            <Button iconLeft={<ArrowLeft className="rtl:rotate-180" size={18} />}>العودة للخدمات</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Star;
  const relatedServices = servicesData
    .filter((s) => s.category === service.category && s.id !== service.id && s.isActive)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${service.gradient} text-white`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <nav className="flex items-center gap-1.5 text-sm text-white/70 mb-6">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <Link href="/services" className="hover:text-white transition-colors">الخدمات</Link>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span className="text-white font-medium">{service.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon size={32} />
                </div>
                <Badge variant="secondary" size="sm" className="bg-white/20 text-white border-white/30">{service.categoryAr}</Badge>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{service.name}</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-white/80 text-lg max-w-2xl leading-relaxed">{service.description}</motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <Clock size={18} />
                  <span className="font-medium">{service.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <DollarSign size={18} />
                  <span className="font-medium">{service.priceNote} {formatPrice(service.price, currency)}</span>
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              {isAuthenticated ? (
                <Link href={`/checkout?service=${service.id}`}>
                  <Button size="xl" className="bg-white text-slate-900 hover:bg-white/90 shadow-2xl shadow-black/20 text-lg px-8 py-4">
                    اطلب الآن
                    <ArrowLeft size={20} className="rtl:rotate-180" />
                  </Button>
                </Link>
              ) : (
                <Button size="xl" className="bg-white text-slate-900 hover:bg-white/90 shadow-2xl shadow-black/20 text-lg px-8 py-4" onClick={() => setShowLoginModal(true)}>
                  اطلب الآن
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">عن الخدمة</h2>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                  {service.fullDescription.split('\\n\\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Features Grid */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">مميزات الخدمة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feature, i) => (
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">مراحل التنفيذ</h2>
                <div className="space-y-6">
                  {service.steps.map((step, i) => {
                    const StepIcon = iconMap[step.icon] || CheckCircle;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${service.gradient} text-white shadow-lg`}>
                            <StepIcon size={20} />
                          </div>
                          {i < service.steps.length - 1 && (
                            <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">الخطوة {i + 1}: {step.title}</h4>
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">المستندات المطلوبة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.requiredDocuments.map((doc, i) => (
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
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">كيفية الطلب</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">اضغط على زر &quot;اطلب الآن&quot; لفتح صفحة الطلب حيث يمكنك إدخال بياناتك ورفع المستندات واختيار طريقة الدفع.</p>
                  </div>
                  {isAuthenticated ? (
                    <Link href={`/checkout?service=${service.id}`}>
                      <Button variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>
                        اطلب الآن
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="primary" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />} onClick={() => setShowLoginModal(true)}>
                      اطلب الآن
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* FAQ Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">الأسئلة الشائعة</h2>
                <div className="space-y-3">
                  {service.faq.map((item, i) => (
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">خدمات ذات صلة</h2>
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
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{rel.name}</h4>
                              <p className="text-xs text-slate-500">{rel.duration}</p>
                            </div>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3">{rel.description}</p>
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
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{service.priceNote}</p>
                  <div className="text-3xl font-bold gradient-text mb-1">{formatPrice(service.price, currency)}</div>
                  <p className="text-slate-400 text-xs">شامل ضريبة القيمة المضافة</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Clock size={18} className="text-[#2580eb] shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">مدة التنفيذ: <strong>{service.duration}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <Shield size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">ضمان استرداد المبلغ</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <CreditCard size={18} className="text-[#7c3aed] shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">دفع آمن ومشفر</span>
                  </div>
                </div>
                {isAuthenticated ? (
                  <Link href={`/checkout?service=${service.id}`} className="block">
                    <Button fullWidth size="lg" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}>
                      اطلب الآن
                    </Button>
                  </Link>
                ) : (
                  <Button fullWidth size="lg" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />} onClick={() => setShowLoginModal(true)}>
                    اطلب الآن
                  </Button>
                )}
                <div className="mt-4 text-center">
                  <Link href="/track-order" className="text-sm text-[#2580eb] hover:underline">
                    هل لديك طلب سابق؟ تتبعه هنا
                  </Link>
                </div>
              </Card>

              <Card glass padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center shrink-0">
                    <Headphones size={20} className="text-[#2580eb]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">تحتاج مساعدة؟</p>
                    <p className="text-slate-500 text-xs">تواصل معنا على مدار الساعة</p>
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">يجب تسجيل الدخول أولًا</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                  لإكمال طلب الخدمة، يرجى تسجيل الدخول أو إنشاء حساب جديد
                </p>
                <div className="flex gap-3">
                  <Link href="/login" className="flex-1">
                    <Button fullWidth variant="primary">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button fullWidth variant="secondary">
                      إنشاء حساب
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
