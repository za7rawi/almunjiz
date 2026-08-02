import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  ctaButton,
  divider,
  footerNote,
} from "../base";
import { SITE_URL } from "@/config";

export function welcomeTemplate(opts: {
  customerName: string;
}): string {
  return baseLayout({
    title: "مرحبًا بك في منصة المنجز | تأكيد بريدك الإلكتروني",
    subtitle: "حسابك جاهز للاستخدام",
    preheader: `مرحبًا ${opts.customerName}! تم إنشاء حسابك بنجاح في منصة المنجز.`,
    content: `
      ${greeting(opts.customerName)}
      ${heading("مرحبًا بك في منصة المنجز")}
      ${textBlock("تم إنشاء حسابك وتأكيد بريدك الإلكتروني بنجاح. أنت الآن جاهز للاستفادة من جميع خدمات منصة المنجز.")}
      ${textBlock("يمكنك طلب خدمات التأشيرات والسفر والأعمال، ومتابعة جميع طلباتك وفواتيرك من حسابك في أي وقت.")}
      ${textBlock("نتمنى لك تجربة مميزة.")}

      ${ctaButton("استعرض خدماتنا", `${SITE_URL}/services`)}

      ${divider()}
      ${textBlock("<strong>فريق المنجز</strong>")}
      ${footerNote()}
    `,
  });
}
