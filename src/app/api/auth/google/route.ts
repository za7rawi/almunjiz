import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/service";
import { createVerificationToken } from "@/app/api/auth/[...nextauth]/route";

async function verifyGoogleToken(
  idToken: string
): Promise<{ name: string; email: string; avatar: string | null } | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    if (!response.ok) return null;
    const payload = await response.json();
    if (
      !payload.email ||
      payload.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    )
      return null;
    return {
      name: payload.name || payload.given_name || "مستخدم Google",
      email: payload.email,
      avatar: payload.picture || null,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "الرمز المطلوب غير مقدم" },
        { status: 400 }
      );
    }

    const userData = await verifyGoogleToken(idToken);
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "رمز Google غير صالح" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      const bcrypt = await import("bcryptjs");
      const defaultPassword = await bcrypt.hash(crypto.randomUUID(), 12);

      user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: defaultPassword,
          avatar: userData.avatar,
          role: "CUSTOMER",
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      sendWelcomeEmail(userData.email, userData.name).catch((err) =>
        console.error("[Google Auth] Failed to send welcome email:", err)
      );
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          avatar: userData.avatar || user.avatar,
          emailVerified: true,
        },
      });
    }

    const token = createVerificationToken(userData.email, 'google');

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
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
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تسجيل الدخول بـ Google" },
      { status: 500 }
    );
  }
}
