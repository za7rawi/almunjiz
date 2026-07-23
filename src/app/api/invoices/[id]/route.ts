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
    const invoice = await PaymentService.getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "الفاتورة غير موجودة / Invoice not found",
          error: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: "تم جلب الفاتورة بنجاح / Invoice fetched successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "حدث خطأ في جلب الفاتورة / Error fetching invoice",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
