import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OrderService } from "@/services/order.service";
import { OrderSchema } from "@/validators";
import { prisma } from "@/lib/prisma";

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
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role as string;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);

    const result = await OrderService.findAll({
      page,
      limit,
      status: status ?? undefined,
      userId: isAdmin ? undefined : userId,
      search: search ?? undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "تم جلب الطلبات بنجاح / Orders fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الطلبات / Error fetching orders",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = OrderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "بيانات غير صحيحة / Invalid data",
          error: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: validated.data.serviceId },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الخدمة غير موجودة / Service not found",
          error: null,
        },
        { status: 404 }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الخدمة غير متاحة حالياً / Service is currently unavailable",
          error: null,
        },
        { status: 400 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const order = await OrderService.create({
      userId,
      serviceId: validated.data.serviceId,
      notes: validated.data.notes,
      attachments: validated.data.attachments,
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "تم إنشاء طلب جديد",
        titleEn: "New order created",
        message: `تم إنشاء طلب رقم ${order.orderNumber} بنجاح`,
        messageEn: `Order ${order.orderNumber} created successfully`,
        type: "ORDER",
        link: `/dashboard/orders/${order.id}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: order,
        message: "تم إنشاء الطلب بنجاح / Order created successfully",
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في إنشاء الطلب / Error creating order",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
