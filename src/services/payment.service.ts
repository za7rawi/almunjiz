import { prisma } from "@/lib/prisma";

export class PaymentService {
  static async createInvoice(data: {
    orderId: string;
    userId: string;
    subtotal: number;
    tax?: number;
    discount?: number;
    dueDate?: Date;
  }) {
    const invoiceNumber = `INV-${Date.now()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: data.orderId,
        userId: data.userId,
        subtotal: data.subtotal,
        tax: data.tax ?? 0,
        discount: data.discount ?? 0,
        total: data.subtotal + (data.tax ?? 0) - (data.discount ?? 0),
        dueDate: data.dueDate,
      },
    });
  }

  static async createPayment(data: {
    orderId: string;
    invoiceId?: string;
    userId: string;
    amount: number;
    method: string;
    reference?: string;
    metadata?: Record<string, unknown>;
  }) {
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        invoiceId: data.invoiceId,
        userId: data.userId,
        amount: data.amount,
        method: data.method as never,
        reference: data.reference,
        metadata: data.metadata as never,
      },
    });

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce<number>(
        (sum, p) => sum + Number(p.amount),
        0
      );

      if (totalPaid >= Number(invoice.total)) {
        await prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: "PAID", paidAt: new Date() },
        });
      }
    }

    return payment;
  }

  static async getInvoices(params: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: { service: true },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
    });
  }

  static async getPayments(params: {
    page?: number;
    limit?: number;
    userId?: string;
    invoiceId?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.invoiceId) {
      where.invoiceId = params.invoiceId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            order: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
