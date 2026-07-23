import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await OrderService.findByOrderNumber(orderNumber);

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
        serviceName: order.service.name,
        serviceNameEn: order.service.nameEn,
        amount: order.amount,
        createdAt: order.createdAt,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        timeline: order.timeline,
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
