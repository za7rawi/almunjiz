import { NextResponse } from "next/server";
import { users } from "@/lib/store";

export async function GET() {
  try {
    const allUsers = Array.from(users.values()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, data: allUsers });
  } catch {
    return NextResponse.json(
      { success: false, data: [], error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
