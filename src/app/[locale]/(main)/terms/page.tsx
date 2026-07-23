import { PageHeader } from "@/components/ui/page-header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="الشروط والأحكام"
          breadcrumbs={[{ label: "الرئيسية", href: "/" }, { label: "الشروط والأحكام" }]}
          gradient
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">القبول بالشروط</h2>
            <p className="text-slate-600 leading-relaxed">
              باستخدامك لمنصة المنجز، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">استخدام الخدمات</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>يجب أن يكون عمرك 18 سنة أو أكثر لإنشاء حساب واستخدام الخدمات</li>
              <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</li>
              <li>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
              <li>يُحظر استخدام المنصة لأي أغراض غير قانونية</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">الطلبات والمدفوعات</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>جميع الأسعار معروضة بالريال السعودي وتشمل الضريبة</li>
              <li>يتم خصم المبلغ عند تأكيد الطلب</li>
              <li>يحق للمنصة إلغاء الطلب في حالة عدم اكتمال البيانات المطلوبة</li>
              <li>تُعالج الطلبات خلال المدة المحددة لكل خدمة</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">الإلغاء والاسترداد</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              يمكن إلغاء الطلب واسترداد المبلغ وفقاً لل policies التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>إلغاء قبل بدء التنفيذ: استرداد كامل</li>
              <li>إلغاء أثناء التنفيذ: استرداد 50%</li>
              <li>بعد إتمام الخدمة: لا استرداد</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">الملكية الفكرية</h2>
            <p className="text-slate-600 leading-relaxed">
              جميع المحتويات والتصاميم والشعارات على المنصة هي ملكية فكرية حصرية لمنصة المنجز ولا يجوز نسخها أو استخدامها دون إذن.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">المسؤولية</h2>
            <p className="text-slate-600 leading-relaxed">
              تبذل المنجز جهوداً معقولة لضمان دقة وموثوقية الخدمات، غير أنها لا تضمن عدم وجود أخطاء. نحن غير مسؤولين عن أي أضرار ناتجة عن استخدام المنصة.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">تعديل الشروط</h2>
            <p className="text-slate-600 leading-relaxed">
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">القانون الحاكم</h2>
            <p className="text-slate-600 leading-relaxed">
              تخضع هذه الشروط لقوانين المملكة العربية السعودية، وأي نزاعات تحل وفقاً للأنظمة السعودية المعمول بها.
            </p>
          </div>

          <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
            آخر تحديث: يناير 2026
          </p>
        </div>
      </div>
    </div>
  );
}
