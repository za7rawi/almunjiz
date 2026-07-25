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

export function orderCreatedTemplate(opts: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  amount: string;
  currency?: string;
}): string {
  const currency = opts.currency || "SAR";
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

      ${textBlock("يمكنك متابعة حالة الطلب من حسابك في أي وقت. سيقوم فريقنا بالتواصل معك عند تحديث أي تفاصيل.")}
      ${ctaButton("متابعة الطلب 📋", `${SITE_URL}/dashboard/orders`)}
      ${divider()}
      ${textBlock("شكراً لثقتك بالمنجز. نحن ملتزمون بتقديم أفضل خدمة لك.")}
    `,
  });
}
