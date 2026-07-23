import { PageHeader } from "@/components/ui/page-header";

const values = [
  { icon: "🎯", title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في جميع خدماتنا" },
  { icon: "⚡", title: "السرعة", desc: "نقدم خدمات سريعة وفعالة لتوفير وقتك" },
  { icon: "🤝", title: "الثقة", desc: "بناء علاقات قوية مبنية على الثقة والشفافية" },
  { icon: "💡", title: "الابتكار", desc: "نسعى دائماً لتقديم حلول مبتكرة ومتطورة" },
];

const stats = [
  { number: "+10,000", label: "عميل سعيد" },
  { number: "+50,000", label: "طلب منجز" },
  { number: "+500", label: "خدمة متاحة" },
  { number: "%99", label: "نسبة الرضا" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="من نحن"
          subtitle="تعرف على المنجز وقصتنا"
          breadcrumbs={[
            { label: "الرئيسية", href: "/" },
            { label: "من نحن" },
          ]}
          gradient
        />

        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                منصة <span className="gradient-text">المنجز</span> للخدمات الإلكترونية
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  تأسست منصة المنجز بهدف تقديم حلول إلكترونية متكاملة تلبي احتياجات الأفراد والشركات في المملكة العربية السعودية.
                </p>
                <p>
                  نسعى لتبسيط الإجراءات الحكومية والتجارية من خلال منصة سهلة الاستخدام توفر مجموعة شاملة من الخدمات الإلكترونية بجودة عالية وأسعار منافسة.
                </p>
                <p>
                  مع فريق عمل محترف ومتخصص، نضمن لعملائنا أفضل تجربة ممكنة من لحظة تقديم الطلب وحتى استلام النتيجة.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
                <span className="text-8xl">🚀</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-white border border-slate-200">
                <div className="text-3xl font-bold gradient-text mb-2">{stat.number}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">قيمنا</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="text-center p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-4 block">{value.icon}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-500 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
