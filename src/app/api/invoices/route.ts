import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PaymentService } from "@/services/payment.service";

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
    const status = searchParams.get("status");

    const userId = (session.user as Record<string, unknown>).id as string;
    const role = (session.user as Record<string, unknown>).role as string;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"].includes(role);

    const result = await PaymentService.getInvoices({
      page,
      limit,
      status: status ?? undefined,
      userId: isAdmin ? undefined : userId,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
      message: "تم جلب الفواتير بنجاح / Invoices fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الفواتير / Error fetching invoices",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
