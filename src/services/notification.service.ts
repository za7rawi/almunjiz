import { prisma } from "@/lib/prisma";

export class NotificationService {
  static async create(data: {
    userId: string;
    title: string;
    titleEn: string;
    message: string;
    messageEn: string;
    type?: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        titleEn: data.titleEn,
        message: data.message,
        messageEn: data.messageEn,
        type: (data.type as never) ?? "SYSTEM",
        link: data.link,
      },
    });
  }

  static async findAll(params: {
    userId: string;
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId: params.userId,
    };

    if (params.isRead !== undefined) {
      where.isRead = params.isRead;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return count;
  }

  static async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  }

  static async deleteAll(userId: string) {
    return prisma.notification.deleteMany({ where: { userId } });
  }
}
