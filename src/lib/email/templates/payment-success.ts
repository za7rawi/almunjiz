import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  infoRow,
  footerNote,
  divider,
} from "../base";

export function paymentSuccessTemplate(opts: {
  customerName: string;
  transactionId: string;
  amount: string;
  currency?: string;
  orderNumber: string;
  paymentMethod?: string;
}): string {
  const currency = opts.currency || "SAR";
  return baseLayout({
    title: "تم تأكيد عملية الدفع",
    subtitle: "تأكيد الدفع",
    preheader: `تم استلام دفعتك ${opts.amount} ${currency} - رقم العملية: ${opts.transactionId}`,
    accentColor: "#10b981",
    content: `
      ${greeting(opts.customerName)}
      ${heading("💳 تم تأكيد عملية الدفع", "#10b981")}
      ${textBlock("تم استلام دفعتك بنجاح. شكراً لاستخدامك المنجز.")}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:4px 16px;margin:20px 0;">
        ${infoRow("رقم العملية", opts.transactionId, "#10b981")}
        ${infoRow("رقم الطلب", opts.orderNumber, "#10b981")}
        ${infoRow("المبلغ المدفوع", `${opts.amount} ${currency}`, "#10b981")}
        ${opts.paymentMethod ? infoRow("طريقة الدفع", opts.paymentMethod, "#10b981") : ""}
      </div>

      ${textBlock("تم إرفاق الفاتورة الإلكترونية بصيغة PDF مع هذه الرسالة. يمكنك также تحميلها من لوحة التحكم.")}
      ${divider()}
      ${textBlock("شكراً لاستخدامك المنجز. نتطلع لخدمتك مرة أخرى.")}
      ${footerNote()}
    `,
  });
}
