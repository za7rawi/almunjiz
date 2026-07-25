import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OrderService } from "@/services/order.service";
import { sendOrderStatusEmail, sendOrderCompletedEmail } from "@/lib/email/service";

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
    const order = await OrderService.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الطلب غير موجود / Order not found",
          error: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "تم جلب الطلب بنجاح / Order fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الطلب / Error fetching order",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

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

    const role = (session.user as Record<string, unknown>).role as string;

    if (!["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "غير مصرح بتحديث الطلب / Not authorized to update order",
          error: null,
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes, estimatedDelivery } = body;

    const existing = await OrderService.findById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الطلب غير موجود / Order not found",
          error: null,
        },
        { status: 404 }
      );
    }

    if (status) {
      await OrderService.updateStatus(id, status);
    }

    if (notes !== undefined || estimatedDelivery !== undefined) {
      const { prisma } = await import("@/lib/prisma");
      await prisma.order.update({
        where: { id },
        data: {
          ...(notes !== undefined && { notes }),
          ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        },
      });
    }

    const updatedOrder = await OrderService.findById(id);

    if (status && existing.customerEmail) {
      const emailData = {
        email: existing.customerEmail,
        name: existing.customerName,
        orderNumber: existing.orderNumber,
        status,
        serviceName: existing.service?.name,
        note: notes || undefined,
      };

      if (status === "COMPLETED" || status === "DELIVERED") {
        sendOrderCompletedEmail({
          email: emailData.email,
          name: emailData.name,
          orderNumber: emailData.orderNumber,
          serviceName: emailData.serviceName || "",
        }).catch((err) => console.error("[Order] Failed to send completion email:", err));
      } else {
        sendOrderStatusEmail(emailData).catch((err) =>
          console.error("[Order] Failed to send status email:", err)
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "تم تحديث الطلب بنجاح / Order updated successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في تحديث الطلب / Error updating order",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
