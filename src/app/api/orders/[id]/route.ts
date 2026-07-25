import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/lib/admin-auth";
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
    const auth = await requireAdmin();
    if ('error' in auth) {
      return auth.error;
    }

    const body = await request.json();
    const { status, notes, estimatedDelivery, internalNotes } = body;

    const { id } = await params;

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

    if (notes !== undefined || estimatedDelivery !== undefined || internalNotes !== undefined) {
      const { prisma } = await import("@/lib/prisma");
      await prisma.order.update({
        where: { id },
        data: {
          ...(notes !== undefined && { notes }),
          ...(internalNotes !== undefined && { internalNotes }),
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

      const { prisma } = await import("@/lib/prisma");
      const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
        PENDING: { ar: 'قيد الانتظار', en: 'Pending' },
        UNDER_REVIEW: { ar: 'قيد المراجعة', en: 'Under Review' },
        WAITING_CLIENT: { ar: 'بانتظار العميل', en: 'Waiting for Client' },
        IN_PROGRESS: { ar: 'قيد التنفيذ', en: 'In Progress' },
        COMPLETED: { ar: 'مكتمل', en: 'Completed' },
        DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
        CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
      };
      const label = STATUS_LABELS[status] || { ar: status, en: status };
      if (existing.userId) {
        await prisma.notification.create({
          data: {
            userId: existing.userId,
            title: `تحديث حالة الطلب`,
            titleEn: `Order Status Update`,
            message: `تم تحديث حالة طلبك #${existing.orderNumber} إلى "${label.ar}"${notes ? ` - ${notes}` : ''}`,
            messageEn: `Your order #${existing.orderNumber} status updated to "${label.en}"${notes ? ` - ${notes}` : ''}`,
            type: 'ORDER',
            link: `/dashboard/orders/${id}`,
          },
        }).catch((err) => console.error("[Order] Failed to create customer notification:", err));
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
