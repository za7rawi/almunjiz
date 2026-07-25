import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const all = searchParams.get("all") === "true";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (userId && !all) where.userId = userId;

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
