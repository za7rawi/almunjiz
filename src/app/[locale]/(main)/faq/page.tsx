"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const faqCategories = [
  { id: "general", label: "عام" },
  { id: "orders", label: "الطلبات" },
  { id: "payment", label: "المدفوعات" },
  { id: "account", label: "الحساب" },
];

const faqs = [
  { id: 1, category: "general", question: "ما هو منصة المنجز؟", answer: "منصة المنجز هي منصة إلكترونية متكاملة تقدم مجموعة شاملة من الخدمات الإلكترونية للأفراد والشركات في المملكة العربية السعودية." },
  { id: 2, category: "general", question: "كيف يمكنني التواصل مع الدعم؟", answer: "يمكنك التواصل معنا عبر الواتساب أو البريد الإلكتروني أو من خلال نموذج التواصل في صفحة اتصل بنا." },
  { id: 3, category: "orders", question: "كيف أتتبع طلبي؟", answer: "يمكنك تتبع طلبك من خلال صفحة تتبع الطلب بإدخال رقم الطلب الذي استلمته عند التسجيل." },
  { id: 4, category: "orders", question: "كم تستغرق معالجة الطلبات؟", answer: "تختلف مدة المعالجة حسب نوع الخدمة، عادة من 1 إلى 7 أيام عمل." },
  { id: 5, category: "payment", question: "ما هي طرق الدفع المتاحة؟", answer: "نقبل جميع بطاقات الائتمان (فيزا، ماستركارد)، مدى، آبل باي، تحويل بنكي، وSTC Pay." },
  { id: 6, category: "payment", question: "هل يمكنني استرداد المبلغ؟", answer: "نعم، يمكنك استرداد المبلغ في حالة إلغاء الطلب قبل بدء التنفيذ مع خصم نسبة معينة." },
  { id: 7, category: "account", question: "كيف أنشئ حساباً جديداً؟", answer: "يمكنك إنشاء حساب جديد من خلال صفحة التسجيل bằng إدخال بياناتك الأساسية." },
  { id: 8, category: "account", question: "نسيت كلمة المرور، ماذا أفعل؟", answer: "يمكنك إعادة تعيين كلمة المرور من خلال صفحة نسيت كلمة المرور واتباع الخطوات المطلوبة." },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = faqs.filter((faq) => {
    const matchCategory = faq.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      faq.question.includes(searchQuery) ||
      faq.answer.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="الأسئلة الشائعة"
          subtitle="إجابات على أكثر الأسئلة تكراراً"
          breadcrumbs={[
            { label: "الرئيسية", href: "/" },
            { label: "الأسئلة الشائعة" },
          ]}
          gradient
        />

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأسئلة..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-8">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[#2580eb]/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="flex items-center justify-between w-full p-5 text-right"
              >
                <span className="text-sm font-medium text-slate-900">{faq.question}</span>
                <motion.div animate={{ rotate: openId === faq.id ? 180 : 0 }}>
                  <ChevronDown size={18} className="text-slate-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
