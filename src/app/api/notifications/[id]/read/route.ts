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

    const notification = await NotificationService.markAsRead(id);

    return NextResponse.json({
      success: true,
      data: notification,
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
        error: String(error),
      },
      { status: 500 }
    );
  }
}
