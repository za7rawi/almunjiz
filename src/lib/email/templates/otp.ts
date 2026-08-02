import {
  baseLayout,
  greeting,
  heading,
  otpBox,
  footerNote,
  textBlock,
  ctaButton,
  divider,
} from "../base";
import { SITE_URL } from "@/config";

export function otpTemplate(opts: {
  customerName: string;
  code: string;
  purpose?: "login" | "reset";
}): string {
  const isLogin = (opts.purpose ?? "login") === "login";
  const title = isLogin
    ? "رمز تسجيل الدخول إلى منصة المنجز"
    : "استعادة كلمة المرور الخاصة بحسابك";
  const headingText = isLogin ? "التحقق من هويتك" : "استعادة كلمة المرور";
  const bodyText = isLogin
    ? "لقد تلقينا طلب تسجيل الدخول إلى حسابك في منصة المنجز. استخدم الرمز التالي لإتمام عملية تسجيل الدخول:"
    : "لقد تلقينا طلب استعادة كلمة المرور الخاصة بحسابك في منصة المنجز. استخدم الرمز التالي لإتمام العملية:";
  const ctaText = isLogin ? "متابعة تسجيل الدخول" : "استعادة كلمة المرور";
  const ctaUrl = isLogin ? `${SITE_URL}/otp` : `${SITE_URL}/forgot-password`;

  return baseLayout({
    title,
    subtitle: isLogin ? "تسجيل الدخول" : "استعادة كلمة المرور",
    preheader: `رمز التحقق الخاص بك هو: ${opts.code}`,
    content: `
      ${greeting(opts.customerName)}
      ${heading(headingText)}
      ${textBlock(bodyText)}
      ${otpBox(opts.code)}
      ${ctaButton(ctaText, ctaUrl)}
      ${divider()}
      ${textBlock("إذا لم تطلب هذا الرمز، فلا داعي لاتخاذ أي إجراء. حسابك آمن ولن تحدث أي تغييرات.")}
      ${footerNote()}
    `,
  });
}
