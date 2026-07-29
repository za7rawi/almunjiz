import {
  baseLayout,
  greeting,
  heading,
  textBlock,
  ctaButton,
  divider,
} from "../base";
import { SITE_URL } from "@/config";

export function welcomeTemplate(opts: {
  customerName: string;
}): string {
  return baseLayout({
    title: "مرحبًا بك في المنجز",
    subtitle: "حسابك جاهز للاستخدام",
    preheader: `مرحبًا ${opts.customerName}! تم تسجيل دخولك بنجاح في المنجز.`,
    content: `
      ${greeting(opts.customerName)}
      ${textBlock("شكراً لاستخدام منصة المنجز للخدمات الإلكترونية.")}
      ${textBlock("تم تسجيل دخولك بنجاح.")}
      ${textBlock("يمكنك الآن طلب خدماتك ومتابعة جميع الطلبات والفواتير من حسابك.")}
      ${textBlock("نتمنى لك تجربة مميزة.")}

      ${ctaButton("استعرض خدماتنا", `${SITE_URL}/services`)}

      ${divider()}
      ${textBlock("<strong>فريق المنجز</strong>")}
    `,
  });
}
