import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>)?.id as string;
    const role = (session.user as Record<string, unknown>)?.role as string;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const status = searchParams.get("status");
    const paramUserId = searchParams.get("userId");
    const all = searchParams.get("all") === "true";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "MANAGER") {
      where.userId = userId;
    } else if (paramUserId && !all) {
      where.userId = paramUserId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: { service: true },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        subtotal: Number(inv.subtotal),
        tax: Number(inv.tax),
        discount: Number(inv.discount),
        total: Number(inv.total),
        status: inv.status,
        dueDate: inv.dueDate?.toISOString() || null,
        paidAt: inv.paidAt?.toISOString() || null,
        createdAt: inv.createdAt.toISOString(),
        order: inv.order ? {
          id: inv.order.id,
          orderNumber: inv.order.orderNumber,
          amount: Number(inv.order.amount),
          discount: Number(inv.order.discount),
          tax: Number(inv.order.tax),
          total: Number(inv.order.total),
          status: inv.order.status,
          paymentStatus: inv.order.paymentStatus,
          paymentMethod: inv.order.paymentMethod,
          transactionId: inv.order.transactionId,
          customerName: inv.order.customerName,
          customerEmail: inv.order.customerEmail,
          customerPhone: inv.order.customerPhone,
          serviceName: inv.order.service?.name || "",
          service: inv.order.service ? { id: inv.order.service.id, name: inv.order.service.name, nameEn: inv.order.service.nameEn } : null,
        } : null,
        user: inv.user ? { id: inv.user.id, name: inv.user.name, email: inv.user.email, phone: inv.user.phone } : null,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: true, data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { customer, email, service, amount, tax, notes, dueDate, status } = body;

    if (!customer || amount === undefined) {
      return NextResponse.json(
        { success: false, message: "العميل والمبلغ مطلوبان" },
        { status: 400 }
      );
    }

    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, "0")}`;

    let defaultService = await prisma.service.findFirst({
      where: { slug: "manual-invoice" },
    });
    if (!defaultService) {
      defaultService = await prisma.service.create({
        data: {
          name: "فاتورة يدوية",
          nameEn: "Manual Invoice",
          description: "فاتورة أنشئت يدوياً من لوحة التحكم",
          descriptionEn: "Invoice created manually from admin dashboard",
          slug: "manual-invoice",
          icon: "FileText",
          category: "OTHER",
          price: 0,
          isActive: true,
        },
      });
    }

    const orderCount = await prisma.order.count();
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-INV-${String(orderCount + 1).padStart(6, "0")}`,
        userId: auth.session.userId,
        serviceId: defaultService.id,
        amount: Number(amount) || 0,
        total: Number(amount) || 0,
        customerName: customer,
        customerEmail: email || "",
        status: "COMPLETED",
        paymentStatus: status === "paid" ? "PAID" : "PENDING",
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        userId: auth.session.userId,
        subtotal: Number(amount) || 0,
        tax: Number(tax) || 0,
        total: Number(amount) || 0,
        status: (status || "PENDING").toUpperCase(),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في إنشاء الفاتورة" },
      { status: 500 }
    );
  }
}
