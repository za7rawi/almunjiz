import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp";
import { sendEmailOTP } from "@/lib/otp/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    }

    const code = generateOTP();
    await storeOTP(email, code);

    const result = await sendEmailOTP(email, code);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "فشل إرسال رمز التحقق" }, { status: 500 });
    }

    const response: Record<string, unknown> = { success: true, message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" };

    if (process.env.NODE_ENV !== "production") {
      response.devCode = code;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[OTP Send] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
