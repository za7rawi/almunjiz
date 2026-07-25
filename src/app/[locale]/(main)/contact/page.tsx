"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "حدث خطأ أثناء إرسال الرسالة");
      }
    } catch {
      setError("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="تواصل معنا"
          subtitle="نحن هنا لمساعدتك"
          breadcrumbs={[{ label: "الرئيسية", href: "/" }, { label: "تواصل معنا" }]}
          gradient
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">معلومات التواصل</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2580eb]/10 flex items-center justify-center"><Phone size={18} className="text-[#2580eb]" /></div>
                  <div><p className="text-xs text-slate-500">الهاتف</p><p className="text-sm font-medium text-slate-900" dir="ltr">+962791038472</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/10 flex items-center justify-center"><Mail size={18} className="text-[#14b8a6]" /></div>
                  <div><p className="text-xs text-slate-500">البريد الإلكتروني</p><p className="text-sm font-medium text-slate-900">info@almunjiz.com</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center"><MapPin size={18} className="text-[#7c3aed]" /></div>
                  <div><p className="text-xs text-slate-500">العنوان</p><p className="text-sm font-medium text-slate-900">الرياض، المملكة العربية السعودية</p></div>
                </div>
              </div>
            </div>
            <a href="https://wa.me/962791038472?text=مرحباً، أريد الاستفسار عن خدمات المنجز" target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-green-500 rounded-2xl p-6 text-white text-center hover:bg-green-600 transition-colors cursor-pointer">
                <MessageCircle size={32} className="mx-auto mb-2" />
                <p className="font-bold">تواصل عبر الواتساب</p>
                <p className="text-sm text-green-100">رد سريع وفوري</p>
              </div>
            </a>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="font-bold text-slate-900 mb-6">أرسل رسالة</h3>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <span className="text-5xl mb-4 block">✅</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">تم إرسال رسالتك بنجاح</h3>
                  <p className="text-slate-500 text-sm">سنتواصل معك في أقرب وقت ممكن</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">الاسم</label>
                      <input type="text" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                      <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">الجوال</label>
                      <input type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">الموضوع</label>
                      <input type="text" value={formData.subject} onChange={(e) => updateField("subject", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">الرسالة</label>
                    <textarea rows={5} value={formData.message} onChange={(e) => updateField("message", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all resize-none" required />
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={loading} iconLeft={<Send size={16} />}>
                    إرسال الرسالة
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
