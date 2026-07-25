import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: { service: true, gateway: true },
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
        ...inv,
        subtotal: Number(inv.subtotal),
        tax: Number(inv.tax),
        discount: Number(inv.discount),
        total: Number(inv.total),
        order: inv.order ? {
          ...inv.order,
          amount: Number(inv.order.amount),
          discount: Number(inv.order.discount),
          tax: Number(inv.order.tax),
          total: Number(inv.order.total),
          service: inv.order.service,
          gateway: inv.order.gateway,
          customerName: inv.order.customerName,
          customerEmail: inv.order.customerEmail,
          customerPhone: inv.order.customerPhone,
          paymentMethod: inv.order.paymentMethod,
          transactionId: inv.order.transactionId,
          paymentStatus: inv.order.paymentStatus,
        } : null,
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
