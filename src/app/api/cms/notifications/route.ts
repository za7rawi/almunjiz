import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

const typeMap: Record<string, string> = {
  info: 'SYSTEM',
  success: 'PAYMENT',
  warning: 'PROMOTION',
  error: 'ORDER',
};

const reverseTypeMap: Record<string, string> = {
  SYSTEM: 'info',
  PAYMENT: 'success',
  PROMOTION: 'warning',
  ORDER: 'error',
  SUPPORT: 'info',
};

async function getSystemUserId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  if (admin) return admin.id;

  const anyUser = await prisma.user.findFirst({ select: { id: true } });
  if (anyUser) return anyUser.id;

  const created = await prisma.user.create({
    data: {
      name: 'System',
      email: 'system@almunjiz.com',
      phone: '+0000000000',
      password: 'system',
      role: 'ADMIN',
    },
  });
  return created.id;
}

export async function GET() {
  try {
    const userId = await getSystemUserId();
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const data = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      titleEn: n.titleEn,
      message: n.message,
      messageEn: n.messageEn,
      type: reverseTypeMap[n.type] || 'info',
      target: 'all',
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();
    const { title, titleEn, message, messageEn, type, target } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, data: null, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const userId = await getSystemUserId();
    const prismaType = (typeMap[type] || 'SYSTEM') as any;

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        titleEn: titleEn || title,
        message,
        messageEn: messageEn || message,
        type: prismaType,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        title: notification.title,
        titleEn: notification.titleEn,
        message: notification.message,
        messageEn: notification.messageEn,
        type: reverseTypeMap[notification.type] || 'info',
        target: target || 'all',
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();
    const { id, isRead, markAll } = body;

    if (markAll) {
      const userId = await getSystemUserId();
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, data: null });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: isRead ?? true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        title: notification.title,
        titleEn: notification.titleEn,
        message: notification.message,
        messageEn: notification.messageEn,
        type: reverseTypeMap[notification.type] || 'info',
        target: 'all',
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
