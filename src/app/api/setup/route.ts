import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETUP_SECRET = "almunjiz-setup-2026";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin@Munjiz2026!";

  try {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existing) {
      return NextResponse.json({
        message: "Admin already exists",
        email: existing.email,
        role: existing.role,
      });
    }

    const bcrypt = await import("bcryptjs");
    const hashed = await bcrypt.hash(adminPassword, 12);

    const user = await prisma.user.create({
      data: {
        name: "مدير النظام",
        email: adminEmail,
        password: hashed,
        role: "SUPER_ADMIN",
        emailVerified: true,
      },
    });

    return NextResponse.json({
      message: "Admin created successfully",
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    return NextResponse.json({
      error: "Failed to create admin",
      details: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
