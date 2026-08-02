import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  infoRow,
  ctaButton,
  divider,
  footerNote,
} from "../base";
import { SITE_URL } from "@/config";

export function orderCreatedTemplate(opts: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  amount: string;
  currency?: string;
  trackingUrl?: string;
}): string {
  const currency = opts.currency || "SAR";
  const trackHref = opts.trackingUrl || `${SITE_URL}/track-order?order=${encodeURIComponent(opts.orderNumber)}`;
  return baseLayout({
    title: "تم استلام طلبك بنجاح",
    subtitle: "طلب جديد",
    preheader: `تم استلام طلبك ${opts.orderNumber} - ${opts.serviceName}`,
    content: `
      ${greeting(opts.customerName)}
      ${heading("✅ تم استلام طلبك بنجاح")}
      ${textBlock("شكراً لاستخدامك المنجز. تم استلام طلبك وجارٍ مراجعته من فريقنا.")}

      <div style="background:#f7f8fa;border-radius:12px;padding:4px 16px;margin:20px 0;">
        ${infoRow("رقم الطلب", opts.orderNumber)}
        ${infoRow("الخدمة", opts.serviceName)}
        ${infoRow("المبلغ", `${opts.amount} ${currency}`)}
      </div>

      ${textBlock("يمكنك متابعة حالة طلبك من الرابط التالي في أي وقت. سيقوم فريقنا بالتواصل معك عند تحديث أي تفاصيل.")}
      ${ctaButton("تتبع الطلب 📋", trackHref)}
      ${divider()}
      ${textBlock("شكراً لثقتك بالمنجز. نحن ملتزمون بتقديم أفضل خدمة لك.")}
      ${footerNote()}
    `,
  });
}
