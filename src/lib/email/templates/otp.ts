import {
  baseLayout,
  greeting,
  heading,
  otpBox,
  footerNote,
  textBlock,
} from "../base";

export function otpTemplate(opts: {
  customerName: string;
  code: string;
}): string {
  return baseLayout({
    title: "رمز التحقق - المنجز",
    subtitle: "خدمة التحقق من البريد الإلكتروني",
    preheader: `رمز التحقق الخاص بك هو: ${opts.code}`,
    content: `
      ${greeting(opts.customerName)}
      ${heading("التحقق من هويتك")}
      ${textBlock("لقد تلقينا طلب التحقق من حسابك. استخدم الرمز التالي لإتمام عملية التسجيل أو تسجيل الدخول:")}
      ${otpBox(opts.code)}
      ${textBlock("إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة. حسابك آمن ولا توجد أي تغييرات.")}
      ${footerNote()}
    `,
  });
}
