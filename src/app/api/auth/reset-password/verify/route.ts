import { NextRequest, NextResponse } from "next/server";
import { verifyStoredOTP } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { revokeAllUserSessions } from "@/lib/session-revocation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني والرمز وكلمة المرور الجديدة مطلوبة" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
    }

    const otpResult = await verifyStoredOTP(email, code);
    if (!otpResult.success) {
      return NextResponse.json({ success: false, error: otpResult.error || "رمز التحقق غير صحيح" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 });
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await revokeAllUserSessions(user.id, 'password_reset');

    const { revokeAllSessions } = await import("@/lib/session-security");
    await revokeAllSessions(user.id);

    return NextResponse.json({ success: true, message: "تم تحديث كلمة المرور بنجاح" });
  } catch (error) {
    console.error("[Reset Password Verify] Error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
