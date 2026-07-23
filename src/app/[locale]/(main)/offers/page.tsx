"use client";

import { motion } from "framer-motion";
import { Tag, Clock, Percent } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";

const offersData = [
  {
    id: 1,
    title: "خصم 30% على التأشيرات",
    description: "استمتع بخصم 30% على جميع خدمات التأشيرات خلال فترة محدودة",
    discount: 30,
    discountType: "PERCENTAGE" as const,
    validUntil: "2026-08-15",
    services: ["تأشيرة سياحية", "تأشيرة عمل", "تأشيرة عبور"],
    code: "VISA30",
  },
  {
    id: 2,
    title: "عرض العودة للمدارس",
    description: "خصم 50 ر.س على خدمات تسجيل المركبات للطلاب والمعلمين",
    discount: 50,
    discountType: "FIXED" as const,
    validUntil: "2026-09-01",
    services: ["تسجيل مركبة", "تجديد تسجيل"],
    code: "SCHOOL50",
  },
  {
    id: 3,
    title: "باقة الشركات",
    description: "خصم 25% لحزم الشركات على خدمات العقود والاستشارات",
    discount: 25,
    discountType: "PERCENTAGE" as const,
    validUntil: "2026-12-31",
    services: ["عقد إيجار", "عقد بيع", "استشارة أعمال"],
    code: "BIZ25",
  },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="العروض والخصومات"
          subtitle="استفد من عروضنا الحصرية"
          breadcrumbs={[{ label: "الرئيسية", href: "/" }, { label: "العروض" }]}
          gradient
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offersData.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="relative h-40 bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center">
                  <div className="text-center text-white">
                    <Percent size={32} className="mx-auto mb-2" />
                    <div className="text-4xl font-bold">{offer.discount}{offer.discountType === "PERCENTAGE" ? "%" : " ر.س"}</div>
                    <p className="text-white/80 text-sm mt-1">خصم</p>
                  </div>
                  <Badge variant="success" size="md" className="absolute top-3 right-3">
                    نشط
                  </Badge>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{offer.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 flex-1">{offer.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={14} />
                      <span>صالح حتى: {offer.validUntil}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {offer.services.map((s) => (
                        <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-[#2580eb]/10 text-[#2580eb]">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">كود الخصم</span>
                      <code className="px-3 py-1 rounded-lg bg-slate-100 text-sm font-mono font-bold text-slate-700">
                        {offer.code}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
