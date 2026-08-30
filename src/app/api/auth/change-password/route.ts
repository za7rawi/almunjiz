import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api/response";
import { authLimiter } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revokeAllUserSessions } from "@/lib/session-revocation";

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

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return error("غير مصرح به", 401);
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    if (!userId) {
      return error("غير مصرح به", 401);
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return error("كلمة المرور الحالية والجديدة مطلوبتان");
    }

    if (newPassword.length < 8) {
      return error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return error("المستخدم غير موجود", 404);
    }

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return error("كلمة المرور الحالية غير صحيحة", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await revokeAllUserSessions(userId, 'password_change');

    const { revokeAllSessions } = await import("@/lib/session-security");
    await revokeAllSessions(userId);

    return success(null, "تم تحديث كلمة المرور بنجاح");
  } catch {
    return error("حدث خطأ أثناء تحديث كلمة المرور", 500);
  }
}
