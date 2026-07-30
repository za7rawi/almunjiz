import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/api/response";
import { sendWelcomeEmail } from "@/lib/email/service";
import { authLimiter } from "@/lib/rate-limit";
import { setRoleCookie } from "@/lib/auth/role-cookie";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const result = authLimiter(ip);
    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) } }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return error("البريد الإلكتروني وكلمة المرور مطلوبان");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error("البريد الإلكتروني غير صحيح");
    }

    if (password.length < 6) {
      return error("كلمة المرور غير صحيحة", 401);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return error("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return error("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    const isFirstLogin = !user.lastLoginAt;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (isFirstLogin) {
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error("[Login] Failed to send welcome email:", err)
      );
    }

    const token = crypto.randomUUID();

    return setRoleCookie(
      {
        success: true,
        data: {
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
      },
      user.role
    );
  } catch (e) {
    console.error("[Login] Auth login error:", e instanceof Error ? e.message : e);
    return error("حدث خطأ أثناء تسجيل الدخول", 500);
  }
}
