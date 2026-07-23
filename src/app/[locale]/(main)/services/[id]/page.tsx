'use client';

import { useState, useCallback, useMemo } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Clock, DollarSign, CheckCircle, FileText,
  Package, Shield, Star, Globe, Car, Plane, Building2, Headphones,
  GraduationCap, Briefcase, Hotel, Laptop, MessageSquare, Home,
  FileSignature, Upload, X, ChevronDown, ChevronUp, Send, User,
  Mail, Phone, MapPin, CreditCard, Check, File, FileSpreadsheet,
  Archive, ImageIcon, ClipboardList, Search, Settings, Bell, Stamp,
  Monitor, Zap, Video, Truck, List, Plus, Minus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { CountrySelect } from '@/components/ui/country-select';
import { cn } from '@/lib/utils';
import { servicesData } from '@/lib/services-data';
import { useCurrencyStore } from '@/store/currency-store';
import { formatPrice } from '@/lib/currency';
import { toast } from '@/components/ui/toast';

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

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type: string) {
  if (type.includes('image')) return <ImageIcon size={20} className="text-blue-400" />;
  if (type.includes('pdf')) return <FileText size={20} className="text-red-400" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={20} className="text-blue-500" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet size={20} className="text-green-400" />;
  if (type.includes('zip') || type.includes('archive')) return <Archive size={20} className="text-purple-400" />;
  return <File size={20} className="text-slate-400" />;
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AM-${ts}-${rand}`;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const { currency } = useCurrencyStore();
  const service = useMemo(() => servicesData.find((s) => s.id === id), [id]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', country: '+966', city: '',
    idNumber: '', notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'الاسم مطلوب';
    if (!formData.phone) errors.phone = 'رقم الجوال مطلوب';
    if (!formData.email) errors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'البريد غير صحيح';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      if (uploadedFiles.length >= 5) return;
      const uploaded: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36),
        file, name: file.name, size: file.size, type: file.type,
      };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploaded.preview = ev.target?.result as string;
          setUploadedFiles((prev) => [...prev, uploaded]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles((prev) => [...prev, uploaded]);
      }
    });
    e.target.value = '';
  }, [uploadedFiles.length]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return;
      if (uploadedFiles.length >= 5) return;
      const uploaded: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36),
        file, name: file.name, size: file.size, type: file.type,
      };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploaded.preview = ev.target?.result as string;
          setUploadedFiles((prev) => [...prev, uploaded]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles((prev) => [...prev, uploaded]);
      }
    });
  }, [uploadedFiles.length]);

  const handleSubmitOrder = useCallback(() => {
    if (!validateForm()) return;
    setUploading(true);
    setTimeout(() => {
      sessionStorage.setItem('orderFormData', JSON.stringify(formData));
      sessionStorage.setItem('orderFiles', JSON.stringify(uploadedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))));
      sessionStorage.setItem('orderServiceId', service!.id);
      setUploading(false);
      window.location.href = `/checkout?service=${service!.id}`;
    }, 2000);
  }, [validateForm, formData, uploadedFiles, service]);

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

  const color = categoryColors[service.category] || '#2580eb';
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
              <Button size="xl" className="bg-white text-slate-900 hover:bg-white/90 shadow-2xl shadow-black/20 text-lg px-8 py-4"
                onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}>
                اطلب الآن
                <ArrowLeft size={20} className="rtl:rotate-180" />
              </Button>
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

            {/* File Upload Section */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card glass padding="lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">رفع المستندات</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">ارفع المستندات المطلوبة (اختياري)</p>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#2580eb] rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group"
                  onClick={() => document.getElementById('detail-file-upload')?.click()}
                >
                  <input id="detail-file-upload" type="file" multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileUpload} className="hidden" />
                  <div className="w-16 h-16 rounded-2xl bg-[#2580eb]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={28} className="text-[#2580eb]" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">اسحب الملفات هنا أو اضغط للاختيار</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">PDF, Word, Excel, JPG, PNG, ZIP — حتى 10 ميجا — 5 ملفات كحد أقصى</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">الملفات المرفقة ({uploadedFiles.length}/5)</p>
                    {uploadedFiles.map((f) => (
                      <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        {f.preview ? (
                          <img src={f.preview} alt={f.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                            {getFileIcon(f.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{f.name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
                        </div>
                        <button onClick={() => removeFile(f.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Order Form Section */}
            {!orderSubmitted ? (
              <motion.div id="order-form" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card glass padding="lg">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">بيانات الطلب</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">أكمل البيانات لإتمام طلبك</p>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الاسم الكامل *</label>
                      <div className="relative">
                        <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          placeholder="محمد أحمد"
                          className={cn("w-full pr-10 pl-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all dark:bg-white/5 dark:text-white",
                            formErrors.name ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                      </div>
                      {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">رقم الجوال *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="tel" dir="ltr" value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                          placeholder="5XXXX XXXX"
                          className={cn("w-full pr-10 pl-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all text-left font-mono dark:bg-white/5 dark:text-white",
                            formErrors.phone ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                      </div>
                      {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" dir="ltr" value={formData.email}
                          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                          placeholder="example@email.com"
                          className={cn("w-full pr-10 pl-4 py-3.5 rounded-xl border text-sm focus:outline-none transition-all text-left dark:bg-white/5 dark:text-white",
                            formErrors.email ? 'border-red-400' : 'border-slate-200 dark:border-white/10 focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20')} />
                      </div>
                      {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الدولة</label>
                      <CountrySelect value={formData.country}
                        onChange={(c) => setFormData((p) => ({ ...p, country: c.dialCode }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">المدينة</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={formData.city}
                          onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                          placeholder="الرياض"
                          className="w-full pr-10 pl-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">رقم الهوية / الجواز</label>
                      <div className="relative">
                        <CreditCard size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" dir="ltr" value={formData.idNumber}
                          onChange={(e) => setFormData((p) => ({ ...p, idNumber: e.target.value }))}
                          placeholder="XXXXXXXXXX"
                          className="w-full pr-10 pl-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all text-left font-mono dark:text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ملاحظات <span className="text-slate-400">(اختياري)</span></label>
                      <textarea value={formData.notes}
                        onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="أي ملاحظات أو تفاصيل إضافية..." rows={4} maxLength={500}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all resize-none dark:text-white" />
                      <p className="text-xs text-slate-400 mt-1 text-left">{formData.notes.length}/500</p>
                    </div>
                  </div>
                  <div className="mt-6">
                      <Button fullWidth size="lg" loading={uploading} onClick={handleSubmitOrder} iconLeft={<Send size={18} />}>
                        إرسال الطلب
                      </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
                <Card glass padding="lg" className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                    <CheckCircle size={40} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">تم إرسال طلبك بنجاح!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">تم إرسال تفاصيل طلبك إلى بريدك الإلكتروني</p>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-6 text-sm space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between"><span className="text-slate-500">رقم الطلب</span><span className="font-bold text-[#2580eb] font-mono" dir="ltr">{orderNumber}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">الخدمة</span><span className="font-medium">{service.name}</span></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/track-order"><Button variant="primary" iconLeft={<FileText size={18} />}>تتبع الطلب</Button></Link>
                    <Link href="/"><Button variant="secondary" iconLeft={<ArrowRight size={18} className="rtl:rotate-180" />}>العودة للرئيسية</Button></Link>
                  </div>
                </Card>
              </motion.div>
            )}

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
                <Button fullWidth size="lg" iconLeft={<ArrowLeft size={18} className="rtl:rotate-180" />}
                  onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  اطلب الآن
                </Button>
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
    </div>
  );
}
