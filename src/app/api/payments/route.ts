import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PaymentService } from "@/services/payment.service";
import { PaymentSchema } from "@/validators";

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
    const invoiceId = searchParams.get("invoiceId");

    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role as string;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"].includes(role);

    const result = await PaymentService.getPayments({
      page,
      limit,
      invoiceId: invoiceId ?? undefined,
      userId: isAdmin ? undefined : userId,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "تم جلب المدفوعات بنجاح / Payments fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب المدفوعات / Error fetching payments",
        error: 'Internal server error',
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
    const validated = PaymentSchema.safeParse(body);

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

    const userId = (session.user as Record<string, unknown>).id as string;

    const payment = await PaymentService.createPayment({
      orderId: validated.data.orderId || '',
      invoiceId: validated.data.invoiceId,
      userId,
      amount: validated.data.amount,
      method: validated.data.method,
      reference: validated.data.reference,
    });

    return NextResponse.json(
      {
        success: true,
        data: payment,
        message: "تم إنشاء الدفعة بنجاح / Payment created successfully",
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في إنشاء الدفعة / Error creating payment",
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
