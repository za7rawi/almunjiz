import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/lib/admin-auth";
import { OrderService } from "@/services/order.service";
import { sendOrderStatusEmail, sendOrderCompletedEmail } from "@/lib/email/service";
import { writeAuditLog } from "@/lib/audit-log";
import { fileAttachmentSelect, recoverFileAttachmentsForOrder } from "@/lib/file-attachments";

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
        fileAttachments: { select: fileAttachmentSelect },
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

    const sessionUserId = (session.user as Record<string, unknown>)?.id as string | undefined;
    const sessionRole = (session.user as Record<string, unknown>)?.role as string | undefined;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(sessionRole || "");

    if (!isAdmin && sessionUserId && order.userId !== sessionUserId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "غير مصرح / Unauthorized",
          error: null,
        },
        { status: 403 }
      );
    }

    const orderWithAttachments = await recoverFileAttachmentsForOrder(order);

    const serialized = {
      ...orderWithAttachments,
      amount: orderWithAttachments.amount?.toString() ?? null,
      discount: orderWithAttachments.discount?.toString() ?? null,
      tax: orderWithAttachments.tax?.toString() ?? null,
      total: orderWithAttachments.total?.toString() ?? null,
      createdAt: orderWithAttachments.createdAt?.toISOString() ?? null,
      updatedAt: orderWithAttachments.updatedAt?.toISOString() ?? null,
      estimatedDelivery: orderWithAttachments.estimatedDelivery?.toISOString() ?? null,
      timeline: orderWithAttachments.timeline.map((t) => ({
        ...t,
        createdAt: t.createdAt?.toISOString() ?? null,
      })),
      invoice: orderWithAttachments.invoice
        ? {
            ...orderWithAttachments.invoice,
            subtotal: orderWithAttachments.invoice.subtotal?.toString() ?? null,
            tax: orderWithAttachments.invoice.tax?.toString() ?? null,
            total: orderWithAttachments.invoice.total?.toString() ?? null,
            discount: orderWithAttachments.invoice.discount?.toString() ?? null,
            createdAt: orderWithAttachments.invoice.createdAt?.toISOString() ?? null,
          }
        : null,
      payments: orderWithAttachments.payments.map((p) => ({
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
        error: 'Internal server error',
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

      await writeAuditLog({
        action: 'order.status_changed',
        resource: 'order',
        resourceId: id,
        userId: auth.session.userId,
        metadata: { orderNumber: existing.orderNumber, oldStatus: existing.status, newStatus: status },
      });
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

    if (internalNotes !== undefined) {
      await writeAuditLog({
        action: 'order.note_added',
        resource: 'order',
        resourceId: id,
        userId: auth.session.userId,
        metadata: { orderNumber: existing.orderNumber, hasInternalNotes: !!internalNotes },
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
        fileAttachments: { select: fileAttachmentSelect },
      },
    });

    const updatedOrderWithAttachments = updatedOrder
      ? await recoverFileAttachmentsForOrder(updatedOrder)
      : null;

    const serializedUpdated = updatedOrderWithAttachments
      ? {
          ...updatedOrderWithAttachments,
          amount: updatedOrderWithAttachments.amount?.toString() ?? null,
          discount: updatedOrderWithAttachments.discount?.toString() ?? null,
          tax: updatedOrderWithAttachments.tax?.toString() ?? null,
          total: updatedOrderWithAttachments.total?.toString() ?? null,
          createdAt: updatedOrderWithAttachments.createdAt?.toISOString() ?? null,
          updatedAt: updatedOrderWithAttachments.updatedAt?.toISOString() ?? null,
          estimatedDelivery: updatedOrderWithAttachments.estimatedDelivery?.toISOString() ?? null,
          timeline: updatedOrderWithAttachments.timeline.map((t) => ({
            ...t,
            createdAt: t.createdAt?.toISOString() ?? null,
          })),
          invoice: updatedOrderWithAttachments.invoice
            ? {
                ...updatedOrderWithAttachments.invoice,
                subtotal: updatedOrderWithAttachments.invoice.subtotal?.toString() ?? null,
                tax: updatedOrderWithAttachments.invoice.tax?.toString() ?? null,
                total: updatedOrderWithAttachments.invoice.total?.toString() ?? null,
                discount: updatedOrderWithAttachments.invoice.discount?.toString() ?? null,
                createdAt: updatedOrderWithAttachments.invoice.createdAt?.toISOString() ?? null,
              }
            : null,
          payments: updatedOrderWithAttachments.payments.map((p) => ({
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
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
