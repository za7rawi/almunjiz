import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, conflict } from "@/lib/api/response";
import { sendWelcomeEmail } from "@/lib/email/service";
import { authLimiter } from "@/lib/rate-limit";

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

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return error("جميع الحقول مطلوبة");
    }

    if (name.trim().length < 3) {
      return error("الاسم يجب أن يكون 3 أحرف على الأقل");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error("البريد الإلكتروني غير صحيح");
    }

    if (password.length < 8) {
      return error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return conflict("البريد الإلكتروني مستخدم بالفعل");
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    const token = crypto.randomUUID();

    sendWelcomeEmail(email, name.trim()).catch((err) =>
      console.error("[Register] Failed to send welcome email:", err)
    );

    return success(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          avatar: user.avatar || "",
          createdAt: user.createdAt.toISOString(),
        },
        token,
      },
      "تم إنشاء الحساب بنجاح"
    );
  } catch {
    return error("حدث خطأ أثناء إنشاء الحساب", 500);
  }
}
