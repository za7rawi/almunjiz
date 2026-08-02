import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp";
import { sendResetPasswordOtpEmail } from "@/lib/email/service";
import { otpLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const limiterResult = otpLimiter(ip);
    if (!limiterResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limiterResult.resetMs / 1000)) } }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    }

    const code = generateOTP();
    await storeOTP(email, code);

    const nameFromEmail = email.split("@")[0];
    const result = await sendResetPasswordOtpEmail(email, nameFromEmail, code);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "فشل إرسال رمز التحقق" }, { status: 500 });
    }

    const response: Record<string, unknown> = { success: true, message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" };

    if (process.env.NODE_ENV !== "production") {
      response.devCode = code;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Reset Password Request] Error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
