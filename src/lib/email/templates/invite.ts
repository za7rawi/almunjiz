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

export function inviteTemplate(opts: {
  customerName: string;
  invitedByName?: string;
  inviteUrl?: string;
}): string {
  return baseLayout({
    title: "تمت دعوتك للانضمام إلى منصة المنجز",
    subtitle: "دعوة انضمام",
    preheader: "تمت دعوتك للانضمام إلى منصة المنجز",
    content: `
      ${greeting(opts.customerName)}
      ${heading("تمت دعوتك للانضمام إلى منصة المنجز")}
      ${textBlock(
        opts.invitedByName
          ? `يسعدنا إخبارك بأن <strong>${opts.invitedByName}</strong> قام بدعوتك للانضمام إلى منصة المنجز للخدمات الإلكترونية.`
          : "يسعدنا إخبارك بأنك مدعو للانضمام إلى منصة المنجز للخدمات الإلكترونية."
      )}
      ${textBlock("بمجرد إنشاء حسابك، يمكنك الاستفادة من جميع خدمات التأشيرات والسفر والأعمال، ومتابعة طلباتك في مكان واحد.")}
      ${ctaButton("أنشئ حسابك الآن", opts.inviteUrl || `${SITE_URL}/register`)}
      ${divider()}
      ${textBlock("نتطلع لانضمامك إلينا!")}
      ${footerNote()}
    `,
  });
}
