import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendOrderCreatedEmail, sendInvoiceEmail } from '@/lib/email/service';
import { generateOrderNumber, generateInvoiceNumber } from '@/lib/utils';
import { writeAuditLog } from '@/lib/audit-log';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, data: [], error: 'غير مصرح' }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>)?.id as string | undefined;
    const role = (session.user as Record<string, unknown>)?.role as string | undefined;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'MANAGER' && userId) {
      where.userId = userId;
    }
    if (status) where.status = status;
    if (search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
      where.OR = isUuid
        ? [{ id: search }]
        : [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
          ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { service: true, gateway: true, payments: true, invoice: true, timeline: { orderBy: { createdAt: 'desc' } }, fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true, mimeType: true, fileSize: true, uploadedAt: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders.map((o) => ({
        ...o,
        amount: Number(o.amount),
        discount: Number(o.discount),
        tax: Number(o.tax),
        total: Number(o.total),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: 'يجب تسجيل الدخول', error: null }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id as string;

    const body = await request.json();
    const {
      serviceId,
      serviceName,
      amount,
      discount = 0,
      total,
      currency = 'SAR',
      customerName,
      customerEmail,
      customerPhone,
      notes,
      attachments = [],
      promoCode,
    } = body;

    if (!serviceId || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: serviceId, customerName, customerEmail' },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    const orderNumber = generateOrderNumber();
    const invoiceNumber = generateInvoiceNumber();

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        serviceId,
        amount: Number(amount),
        discount: Number(discount),
        tax: 0,
        total: Number(total || amount),
        currency,
        paymentStatus: 'PENDING',
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        notes: notes || '',
        attachments: attachments || [],
        status: 'PENDING',
      },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: createdOrder.id,
        status: 'PENDING',
        description: 'تم استلام الطلب بنجاح',
      },
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: createdOrder.id,
        userId,
        subtotal: Number(amount),
        tax: 0,
        discount: Number(discount),
        total: Number(total || amount),
        status: 'PENDING',
      },
    });

    const order = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        service: true,
        invoice: true,
        payments: true,
        timeline: true,
        fileAttachments: true,
      },
    });

    await writeAuditLog({
      action: 'order.created',
      resource: 'order',
      resourceId: createdOrder.id,
      userId,
      metadata: { orderNumber: createdOrder.orderNumber, serviceName: service.name, total: Number(createdOrder.total) },
    });

    sendOrderCreatedEmail({
      email: customerEmail,
      name: customerName,
      orderNumber,
      serviceName: service.name,
      amount: String(Number(total || amount)),
      currency,
    }).catch((err) => console.error("[Orders] Failed to send order email:", err));

    sendInvoiceEmail({
      email: customerEmail,
      name: customerName,
      invoiceNumber,
      amount: String(Number(total || amount)),
      currency,
      orderNumber,
    }).catch((err) => console.error("[Orders] Failed to send invoice email:", err));

    const adminUsers = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] } },
      select: { id: true },
    });
    for (const admin of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'طلب جديد',
          titleEn: 'New Order',
          message: `طلب جديد من ${customerName} - ${service.name} (${Number(total || amount)} ر.س)`,
          messageEn: `New order from ${customerName} - ${service.name} (${Number(total || amount)} SAR)`,
          type: 'ORDER',
          link: `/admin/orders`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        amount: Number(order?.amount),
        discount: Number(order?.discount),
        tax: Number(order?.tax),
        total: Number(order?.total),
        createdAt: order?.createdAt?.toISOString(),
        updatedAt: order?.updatedAt?.toISOString(),
        invoiceNumber: invoice.invoiceNumber,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
