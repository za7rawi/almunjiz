import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        service: { select: { id: true, name: true, nameEn: true, slug: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true, total: true, paidAt: true } },
        payments: { select: { id: true, method: true, status: true, amount: true, transactionId: true, gatewayData: true, createdAt: true } },
        timeline: { orderBy: { createdAt: "asc" } },
        fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true, mimeType: true, fileSize: true, uploadedAt: true } },
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

    const lastPayment = order.payments[order.payments.length - 1];

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        service: order.service,
        baseAmount: Number(order.amount),
        discount: Number(order.discount),
        tax: Number(order.tax),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        transactionId: lastPayment?.transactionId ?? order.transactionId,
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
        error: String(error),
      },
      { status: 500 }
    );
  }
}
