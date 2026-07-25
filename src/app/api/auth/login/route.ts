import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
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
      return error("البريد الإلكتروني غير مسجل", 404);
    }

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return error("كلمة المرور غير صحيحة", 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return success({
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
    });
  } catch {
    return error("حدث خطأ أثناء تسجيل الدخول", 500);
  }
}
