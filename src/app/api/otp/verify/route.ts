import { NextRequest } from "next/server";
import { verifyStoredOTP } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
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
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          emailVerified: true,
        },
      });
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

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
