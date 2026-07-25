import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  infoRow,
  ctaButton,
  divider,
} from "../base";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://munjiz.store";

export function orderCompletedTemplate(opts: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
}): string {
  return baseLayout({
    title: "تم إنجاز طلبك بنجاح",
    subtitle: "طلب مكتمل",
    preheader: `يسعدنا إبلاغك بأنه تم إنجاز طلبك ${opts.orderNumber} بنجاح! 🎉`,
    accentColor: "#10b981",
    content: `
      ${greeting(opts.customerName)}
      ${heading("🎉 تم إنجاز طلبك بنجاح!", "#10b981")}
      ${textBlock("يسعدنا إبلاغك بأنه تم إنجاز طلبك بنجاح. نشكرك على ثقتك بالمنجز.")}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:20px 0;">
        ${infoRow("رقم الطلب", opts.orderNumber, "#10b981")}
        ${infoRow("الخدمة", opts.serviceName, "#10b981")}
      </div>

      <div style="background:linear-gradient(135deg,#f0f7ff,#eef5ff);border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="color:#2580eb;font-size:14px;font-weight:700;margin:0 0 8px 0;">⭐ كيف كانت تجربتك؟</p>
        <p style="color:#555;font-size:13px;margin:0;line-height:1.7;">إذا أعجبتك الخدمة، يسعدنا تقييمك لتجربتك. تقييمك يساعدنا على التحسين ويساعد الآخرين في اختيارنا.</p>
        ${ctaButton("قيّم تجربتك ⭐", `${SITE_URL}/dashboard/orders`)}
      </div>

      ${divider()}
      ${textBlock("نتطلع لخدمتك مرة أخرى. المنجز هنا دائماً لمساعدتك.")}
    `,
  });
}
