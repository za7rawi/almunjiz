import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/services/notification.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "غير مصرح / Unauthorized",
          error: null,
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const sessionUserId = (session.user as Record<string, unknown>)?.id as string | undefined;
    const sessionRole = (session.user as Record<string, unknown>)?.role as string | undefined;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(sessionRole || "");

    if (!isAdmin) {
      const { prisma } = await import("@/lib/prisma");
      const notification = await prisma.notification.findUnique({ where: { id }, select: { userId: true } });
      if (!notification || notification.userId !== sessionUserId) {
        return NextResponse.json(
          { success: false, data: null, message: "غير مصرح / Unauthorized", error: null },
          { status: 403 }
        );
      }
    }

    const updated = await NotificationService.markAsRead(id);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "تم تمييز الإشعار كمقروء / Notification marked as read",
      error: null,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في تحديث الإشعار / Error updating notification",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
