import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackLimiter } from "@/lib/rate-limit";

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

    let order = await prisma.order.findUnique({
      where: { orderNumber: trimmed },
      include: {
        service: { select: { id: true, name: true, nameEn: true, slug: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true, total: true, paidAt: true } },
        timeline: { orderBy: { createdAt: "asc" } },
        fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true, mimeType: true, fileSize: true, uploadedAt: true } },
      },
    });

    if (!order) {
      order = await prisma.order.findFirst({
        where: { orderNumber: { contains: trimmed, mode: "insensitive" } },
        include: {
          service: { select: { id: true, name: true, nameEn: true, slug: true } },
          invoice: { select: { id: true, invoiceNumber: true, status: true, total: true, paidAt: true } },
          timeline: { orderBy: { createdAt: "asc" } },
          fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true, mimeType: true, fileSize: true, uploadedAt: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

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
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        service: order.service,
        baseAmount: Number(order.amount),
        discount: Number(order.discount),
        tax: Number(order.tax),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        invoice: order.invoice,
        timeline: order.timeline.map((t) => ({
          id: t.id,
          status: t.status,
          description: t.description,
          createdAt: t.createdAt,
        })),
        fileAttachments: order.fileAttachments,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
      },
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
