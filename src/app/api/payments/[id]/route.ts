import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PaymentService } from "@/services/payment.service";

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
    const payment = await PaymentService.getPaymentById(id);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الدفعة غير موجودة / Payment not found",
          error: null,
        },
        { status: 404 }
      );
    }

    const sessionUserId = (session.user as Record<string, unknown>)?.id as string | undefined;
    const sessionRole = (session.user as Record<string, unknown>)?.role as string | undefined;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(sessionRole || "");

    if (!isAdmin && payment.userId !== sessionUserId) {
      return NextResponse.json(
        { success: false, data: null, message: "غير مصرح / Unauthorized", error: null },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
      message: "تم جلب الدفعة بنجاح / Payment fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الدفعة / Error fetching payment",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
