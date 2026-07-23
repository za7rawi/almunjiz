import { PageHeader } from "@/components/ui/page-header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="سياسة الخصوصية"
          breadcrumbs={[{ label: "الرئيسية", href: "/" }, { label: "سياسة الخصوصية" }]}
          gradient
        />

        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">مقدمة</h2>
            <p className="text-slate-600 leading-relaxed">
              تلتزم منصة المنجز بحماية خصوصيتك وأمن بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام منصتنا.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">جمع المعلومات</h2>
            <p className="text-slate-600 leading-relaxed mb-3">نجمع المعلومات التالية عند التسجيل واستخدام الخدمات:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>الاسم الكامل وعنوان البريد الإلكتروني</li>
              <li>رقم الجوال ورقم الهوية الوطنية</li>
              <li>معلومات الدفع وسجل المعاملات</li>
              <li>البيانات المقدمة في الطلبات والمستندات المرفقة</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">استخدام المعلومات</h2>
            <p className="text-slate-600 leading-relaxed mb-3">نستخدم معلوماتك للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>تقديم وتحسين الخدمات المطلوبة</li>
              <li>التواصل معك بشأن طلباتك وحسابك</li>
              <li>معالجة المدفوعات وإصدار الفواتير</li>
              <li>إرسال الإشعارات والعروض الترويجية</li>
              <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">حماية المعلومات</h2>
            <p className="text-slate-600 leading-relaxed">
              نستخدم تدابير أمنية متقدمة لحماية بياناتك من الوصول غير المصرح به أو الاستخدام أو الإفصاح أو التعديل أو التدمير. تتضمن هذه التدابير تشفير البيانات والحماية física والرقمية.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">مشاركة المعلومات</h2>
            <p className="text-slate-600 leading-relaxed">
              لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية: عند موافقتك الصريحة، أو للامتثال للقوانين، أو لحماية حقوقنا وسلامة مستخدمينا.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">حقوقك</h2>
            <p className="text-slate-600 leading-relaxed mb-3">لك الحق في:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>الاطلاع على بياناتك الشخصية المحفوظة</li>
              <li>طلب تعديل أو تحديث بياناتك</li>
              <li>طلب حذف حسابك وبياناتك</li>
              <li>إلغاء الاشتراك من الرسائل التسويقية</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">تواصل معنا</h2>
            <p className="text-slate-600 leading-relaxed">
              لأي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: info@almunjiz.com
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
