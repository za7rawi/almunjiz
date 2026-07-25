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

export function invoiceTemplate(opts: {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  currency?: string;
  orderNumber: string;
  dueDate?: string;
}): string {
  const currency = opts.currency || "SAR";
  return baseLayout({
    title: "فاتورتك الإلكترونية",
    subtitle: "الفواتير",
    preheader: `فاتورتك رقم ${opts.invoiceNumber} - المبلغ: ${opts.amount} ${currency}`,
    content: `
      ${greeting(opts.customerName)}
      ${heading("📄 فاتورتك الإلكترونية")}
      ${textBlock("شكراً لاستخدامك المنجز. تم إعداد فاتورتك الإلكترونية بنجاح.")}

      <div style="background:#f7f8fa;border-radius:12px;padding:4px 16px;margin:20px 0;">
        ${infoRow("رقم الفاتورة", opts.invoiceNumber)}
        ${infoRow("رقم الطلب", opts.orderNumber)}
        ${infoRow("المبلغ الإجمالي", `${opts.amount} ${currency}`)}
        ${opts.dueDate ? infoRow("تاريخ الاستحقاق", opts.dueDate) : ""}
      </div>

      ${textBlock("تم إرفاق الفاتورة بصيغة PDF مع هذه الرسالة. يمكنك أيضاً تحميلها من لوحة التحكم في أي وقت.")}
      ${ctaButton("تحميل الفاتورة 📥", `${SITE_URL}/dashboard/invoices`)}
      ${divider()}
      ${textBlock("نتمنى أن نكون عند حسن ظنك.فريق المنجز للخدمات الإلكترونية.")}
    `,
  });
}
