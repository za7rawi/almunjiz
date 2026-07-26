import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OrderService } from "@/services/order.service";

export async function GET(
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
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"].includes(sessionRole || "");

    if (!isAdmin) {
      const { prisma } = await import("@/lib/prisma");
      const order = await prisma.order.findUnique({ where: { id }, select: { userId: true } });
      if (!order || order.userId !== sessionUserId) {
        return NextResponse.json(
          { success: false, data: null, message: "غير مصرح / Unauthorized", error: null },
          { status: 403 }
        );
      }
    }

    const timeline = await OrderService.getTimeline(id);

    return NextResponse.json({
      success: true,
      data: timeline,
      message: "تم جلب السجل الزمني بنجاح / Timeline fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب السجل الزمني / Error fetching timeline",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const role = (session.user as Record<string, unknown>).role as string;

    if (!["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "غير مصرح بإضافة سجل زمني / Not authorized to add timeline",
          error: null,
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, description } = body;

    if (!status || !description) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الحالة والوصف مطلوبان / Status and description are required",
          error: null,
        },
        { status: 400 }
      );
    }

    const timeline = await OrderService.addTimeline({
      orderId: id,
      status,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        data: timeline,
        message: "تم إضافة السجل الزمني بنجاح / Timeline entry added successfully",
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding timeline:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في إضافة السجل الزمني / Error adding timeline",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
