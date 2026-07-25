import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  ctaButton,
  divider,
} from "../base";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://munjiz.store";

export function welcomeTemplate(opts: {
  customerName: string;
}): string {
  return baseLayout({
    title: "مرحبًا بك في المنجز",
    subtitle: "حسابك جاهز للاستخدام",
    preheader: `مرحبًا ${opts.customerName}! تم إنشاء حسابك بنجاح في المنجز.`,
    content: `
      ${greeting(opts.customerName)}
      ${heading("🎉 أهلاً وسهلاً بك في المنجز")}
      ${textBlock("يسعدنا انضمامك إلينا! تم إنشاء حسابك بنجاح ويمكنك الآن الاستمتاع بجميع خدماتنا.")}

      <div style="background:linear-gradient(135deg,#f0f7ff,#eef5ff);border-radius:12px;padding:20px;margin:20px 0;">
        <p style="color:#2580eb;font-size:14px;font-weight:700;margin:0 0 8px 0;">✦ ما الذي يمكنك فعله الآن؟</p>
        <ul style="color:#555;font-size:13px;line-height:2;margin:0;padding-right:16px;">
          <li>استعرض خدماتنا المتنوعة</li>
          <li>أرسل طلبك بسهولة وأمان</li>
          <li>تابع حالة طلباتك من لوحة التحكم</li>
          <li>استمتع بدعم فني على مدار الساعة</li>
        </ul>
      </div>

      ${ctaButton("استعرض خدماتنا 🚀", `${SITE_URL}/services`)}
      ${divider()}
      ${textBlock("نشكرك على اختيارك المنجز. نحن هنا لخدمتك في كل وقت.")}
    `,
  });
}
