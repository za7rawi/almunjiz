import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
