import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as Record<string, unknown>).role as string;
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(role)) {
      return NextResponse.json({ success: false, data: [], error: 'غير مصرح' }, { status: 403 });
    }
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: allUsers.map((u) => ({
        ...u,
        role: u.role.toLowerCase(),
        avatar: u.avatar || "",
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json(
      { success: false, data: [], error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "الاسم والبريد مطلوبان" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash("temp-password-123", 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (role || "EMPLOYEE").toUpperCase(),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      data: { ...user, role: user.role.toLowerCase(), createdAt: user.createdAt.toISOString() },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في إنشاء الموظف" },
      { status: 500 }
    );
  }
}
