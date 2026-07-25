import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export class OrderService {
  static async create(data: {
    userId: string;
    serviceId: string;
    amount?: number;
    total?: number;
    discount?: number;
    currency?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
    attachments?: string[];
  }) {
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        orderNumber,
        amount: data.amount || 0,
        discount: data.discount || 0,
        total: data.total || data.amount || 0,
        currency: data.currency || 'SAR',
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone || '',
        notes: data.notes,
        attachments: data.attachments ?? [],
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        description: "تم استلام الطلب بنجاح / Order received successfully",
      },
    });

    return order;
  }

  static async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    search?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search, mode: "insensitive" } },
        { notes: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        invoice: true,
      },
    });
  }

  static async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        service: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async updateStatus(
    id: string,
    status: string,
    description?: string
  ) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as never },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: id,
        status: status as never,
        description: description ?? `تم تحديث حالة الطلب إلى ${status} / Order status updated to ${status}`,
      },
    });

    if (status === "DELIVERED") {
      await prisma.order.update({
        where: { id },
        data: { deliveredAt: new Date() },
      });
    }

    return order;
  }

  static async addTimeline(data: {
    orderId: string;
    status: string;
    description: string;
  }) {
    return prisma.orderTimeline.create({
      data: {
        orderId: data.orderId,
        status: data.status as never,
        description: data.description,
      },
    });
  }

  static async getTimeline(orderId: string) {
    return prisma.orderTimeline.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, pending, inProgress, completed, delivered, cancelled] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, status: "PENDING" } }),
        prisma.order.count({ where: { ...where, status: "IN_PROGRESS" } }),
        prisma.order.count({ where: { ...where, status: "COMPLETED" } }),
        prisma.order.count({ where: { ...where, status: "DELIVERED" } }),
        prisma.order.count({ where: { ...where, status: "CANCELLED" } }),
      ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      delivered,
      cancelled,
    };
  }
}
