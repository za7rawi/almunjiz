import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PaymentService } from "@/services/payment.service";
import { requireAdmin } from "@/lib/admin-auth";

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

    const sessionUserId = (session.user as Record<string, unknown>)?.id as string | undefined;
    const sessionRole = (session.user as Record<string, unknown>)?.role as string | undefined;
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(sessionRole || "");

    if (!isAdmin && invoice.userId !== sessionUserId) {
      return NextResponse.json(
        { success: false, data: null, message: "غير مصرح / Unauthorized", error: null },
        { status: 403 }
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
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, dueDate, notes, amount, tax } = body;

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "الفاتورة غير موجودة" },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(amount !== undefined && { subtotal: Number(amount), total: Number(amount) }),
        ...(tax !== undefined && { tax: Number(tax) }),
      },
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في تحديث الفاتورة" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "الفاتورة غير موجودة" },
        { status: 404 }
      );
    }

    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "تم حذف الفاتورة بنجاح" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في حذف الفاتورة" },
      { status: 500 }
    );
  }
}
