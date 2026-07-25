import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return error("كلمة المرور الحالية والجديدة مطلوبتان");
    }

    if (newPassword.length < 8) {
      return error("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    let userId: string | null = null;

    if (token) {
      const tokenParts = token.split("_");
      if (tokenParts.length >= 3) {
        const tokenUserId = tokenParts[1];
        const user = await prisma.user.findUnique({ where: { id: tokenUserId } });
        if (user) userId = user.id;
      }
    }

    if (!userId) {
      const cookieHeader = request.headers.get("cookie") || "";
      const sessionMatch = cookieHeader.match(/almunjiz-auth=([^;]+)/);
      if (sessionMatch) {
        try {
          const sessionData = JSON.parse(
            decodeURIComponent(sessionMatch[1])
          );
          userId = sessionData?.state?.user?.id;
        } catch {
          // ignore
        }
      }
    }

    if (!userId) {
      return error("غير مصرح به", 401);
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

    return success(null, "تم تحديث كلمة المرور بنجاح");
  } catch {
    return error("حدث خطأ أثناء تحديث كلمة المرور", 500);
  }
}
