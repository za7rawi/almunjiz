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

export function changeEmailTemplate(opts: {
  customerName: string;
  newEmail?: string;
}): string {
  return baseLayout({
    title: "تأكيد تغيير البريد الإلكتروني في منصة المنجز",
    subtitle: "تغيير البريد الإلكتروني",
    preheader: "تأكيد تغيير البريد الإلكتروني الخاص بحسابك في منصة المنجز",
    content: `
      ${greeting(opts.customerName)}
      ${heading("تأكيد تغيير البريد الإلكتروني")}
      ${textBlock("لقد تلقينا طلباً لتغيير البريد الإلكتروني الخاص بحسابك في منصة المنجز.")}
      ${
        opts.newEmail
          ? `<div style="background:#f7f8fa;border-radius:12px;padding:4px 16px;margin:20px 0;">${infoRow("البريد الإلكتروني الجديد", opts.newEmail)}</div>`
          : ""
      }
      ${textBlock("إذا قمت بهذا الطلب، اضغط على الزر أدناه لتأكيد تغيير البريد الإلكتروني. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة بأمان.")}
      ${ctaButton("تأكيد تغيير البريد", `${SITE_URL}/dashboard/settings`)}
      ${divider()}
      ${textBlock("فريق المنجز هنا دائماً لمساعدتك.")}
      ${footerNote()}
    `,
  });
}
