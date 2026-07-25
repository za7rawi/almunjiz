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
    const { prisma } = await import("@/lib/prisma");
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoice: true,
        payments: true,
        timeline: { orderBy: { createdAt: "asc" } },
        fileAttachments: true,
      },
    });

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

    const serialized = {
      ...order,
      amount: order.amount?.toString() ?? null,
      discount: order.discount?.toString() ?? null,
      tax: order.tax?.toString() ?? null,
      total: order.total?.toString() ?? null,
      createdAt: order.createdAt?.toISOString() ?? null,
      updatedAt: order.updatedAt?.toISOString() ?? null,
      estimatedDelivery: order.estimatedDelivery?.toISOString() ?? null,
      timeline: order.timeline.map((t) => ({
        ...t,
        createdAt: t.createdAt?.toISOString() ?? null,
      })),
      invoice: order.invoice
        ? {
            ...order.invoice,
            subtotal: order.invoice.subtotal?.toString() ?? null,
            tax: order.invoice.tax?.toString() ?? null,
            total: order.invoice.total?.toString() ?? null,
            discount: order.invoice.discount?.toString() ?? null,
            createdAt: order.invoice.createdAt?.toISOString() ?? null,
          }
        : null,
      payments: order.payments.map((p) => ({
        ...p,
        amount: p.amount?.toString() ?? null,
        createdAt: p.createdAt?.toISOString() ?? null,
        updatedAt: p.updatedAt?.toISOString() ?? null,
      })),
    };

    return NextResponse.json({
      success: true,
      data: serialized,
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

    const { prisma } = await import("@/lib/prisma");

    if (notes !== undefined || estimatedDelivery !== undefined || internalNotes !== undefined) {
      await prisma.order.update({
        where: { id },
        data: {
          ...(notes !== undefined && { notes }),
          ...(internalNotes !== undefined && { internalNotes }),
          ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        invoice: true,
        payments: true,
        timeline: { orderBy: { createdAt: "asc" } },
        fileAttachments: true,
      },
    });

    const serializedUpdated = updatedOrder
      ? {
          ...updatedOrder,
          amount: updatedOrder.amount?.toString() ?? null,
          discount: updatedOrder.discount?.toString() ?? null,
          tax: updatedOrder.tax?.toString() ?? null,
          total: updatedOrder.total?.toString() ?? null,
          createdAt: updatedOrder.createdAt?.toISOString() ?? null,
          updatedAt: updatedOrder.updatedAt?.toISOString() ?? null,
          estimatedDelivery: updatedOrder.estimatedDelivery?.toISOString() ?? null,
          timeline: updatedOrder.timeline.map((t) => ({
            ...t,
            createdAt: t.createdAt?.toISOString() ?? null,
          })),
          invoice: updatedOrder.invoice
            ? {
                ...updatedOrder.invoice,
                subtotal: updatedOrder.invoice.subtotal?.toString() ?? null,
                tax: updatedOrder.invoice.tax?.toString() ?? null,
                total: updatedOrder.invoice.total?.toString() ?? null,
                discount: updatedOrder.invoice.discount?.toString() ?? null,
                createdAt: updatedOrder.invoice.createdAt?.toISOString() ?? null,
              }
            : null,
          payments: updatedOrder.payments.map((p) => ({
            ...p,
            amount: p.amount?.toString() ?? null,
            createdAt: p.createdAt?.toISOString() ?? null,
            updatedAt: p.updatedAt?.toISOString() ?? null,
          })),
        }
      : null;

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
      data: serializedUpdated,
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
