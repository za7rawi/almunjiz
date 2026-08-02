import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { trackLimiter } from "@/lib/rate-limit";
import { fileAttachmentSelect, recoverFileAttachmentsForOrder } from "@/lib/file-attachments";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const result = trackLimiter(ip);
    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) } }
      );
    }

    const { orderNumber } = await params;
    const trimmed = decodeURIComponent(orderNumber).trim();

    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;
    const sessionRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAdmin = !!sessionRole && ADMIN_ROLES.includes(sessionRole);

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const order = await prisma.order.findUnique({
      where: { orderNumber: trimmed },
      include: {
        service: { select: { id: true, name: true, nameEn: true, slug: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true, total: true, paidAt: true } },
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

    const metadata = (order.metadata as Record<string, unknown> | null) || {};
    const orderToken = typeof metadata.trackingToken === "string" ? metadata.trackingToken : null;

    const isOwner = !!sessionUserId && order.userId === sessionUserId;
    const hasValidToken = !!orderToken && !!token && orderToken === token;

    const orderWithAttachments = await recoverFileAttachmentsForOrder(order);

    const base = {
      orderNumber: orderWithAttachments.orderNumber,
      status: orderWithAttachments.status,
      paymentStatus: orderWithAttachments.paymentStatus,
      service: orderWithAttachments.service,
      baseAmount: Number(orderWithAttachments.amount),
      discount: Number(orderWithAttachments.discount),
      tax: Number(orderWithAttachments.tax),
      total: Number(orderWithAttachments.total),
      paymentMethod: orderWithAttachments.paymentMethod,
      timeline: orderWithAttachments.timeline.map((t) => ({
        id: t.id,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
      })),
      createdAt: orderWithAttachments.createdAt,
      estimatedDelivery: orderWithAttachments.estimatedDelivery,
      deliveredAt: orderWithAttachments.deliveredAt,
    };

    const authorized = isAdmin || isOwner || hasValidToken;

    const data = authorized
      ? {
          ...base,
          customerName: orderWithAttachments.customerName,
          invoice: orderWithAttachments.invoice,
          fileAttachments: orderWithAttachments.fileAttachments,
          unresolvedAttachments: orderWithAttachments.unresolvedAttachments,
        }
      : base;

    return NextResponse.json({
      success: true,
      data,
      message: "تم جلب معلومات الطلب بنجاح / Order info fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في تتبع الطلب / Error tracking order",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
