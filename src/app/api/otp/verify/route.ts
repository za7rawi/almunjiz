import { NextRequest, NextResponse } from "next/server";
import { verifyStoredOTP } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api/response";
import { sendWelcomeEmail } from "@/lib/email/service";
import { otpLimiter } from "@/lib/rate-limit";
import { createVerificationToken } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limiterResult = otpLimiter(ip);
    if (!limiterResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limiterResult.resetMs / 1000)) } }
      );
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return error("البريد الإلكتروني والكود مطلوبان");
    }

    if (!/^\d{6}$/.test(code)) {
      return error("الكود يجب أن يكون 6 أرقام");
    }

    const result = verifyStoredOTP(email, code);
    if (!result.success) {
      return error(result.error || "الكود غير صحيح");
    }

    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      const bcrypt = await import("bcryptjs");
      const defaultPassword = await bcrypt.hash("otp_" + Date.now(), 10);
      const nameFromEmail = email.split("@")[0];

      user = await prisma.user.create({
        data: {
          name: nameFromEmail,
          email,
          password: defaultPassword,
          role: "CUSTOMER",
          emailVerified: true,
        },
      });
      isNewUser = true;
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          emailVerified: true,
        },
      });
    }

    const token = createVerificationToken(email, 'otp');

    if (isNewUser) {
      sendWelcomeEmail(email, user.name).catch((err) =>
        console.error("[OTP Verify] Failed to send welcome email:", err)
      );
    }

    return success(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role.toLowerCase(),
          avatar: user.avatar || "",
          createdAt: user.createdAt.toISOString(),
        },
        token,
      },
      "تم التحقق بنجاح"
    );
  } catch (err) {
    console.error("[OTP Verify] Error:", err);
    return error("حدث خطأ أثناء التحقق", 500);
  }
}
