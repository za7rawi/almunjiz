import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NotificationService } from "@/services/notification.service";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const isRead = searchParams.get("isRead");

    const userId = (session.user as Record<string, unknown>).id as string;

    const result = await NotificationService.findAll({
      userId,
      page,
      limit,
      isRead: isRead !== null ? isRead === "true" : undefined,
    });

    const unreadCount = await NotificationService.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        ...result.meta,
        unreadCount,
      },
      message: "تم جلب الإشعارات بنجاح / Notifications fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الإشعارات / Error fetching notifications",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
