import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendOrderCreatedEmail, sendInvoiceEmail } from '@/lib/email/service';
import { generateOrderNumber, generateInvoiceNumber, generateTrackingToken } from '@/lib/utils';
import { writeAuditLog } from '@/lib/audit-log';
import { SITE_URL } from '@/config';
import { apiLimiter } from '@/lib/rate-limit';
import { fileAttachmentSelect, recoverFileAttachmentsForOrder, recoverFileAttachmentsForOrders } from '@/lib/file-attachments';
import { resolveCoupon, computeOrderPricing } from '@/lib/pricing';

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

    const rawOrders = await prisma.order.findMany({
      where,
      include: { service: true, gateway: true, payments: true, invoice: true, timeline: { orderBy: { createdAt: 'desc' } }, fileAttachments: { select: { id: true, fileName: true, fileUrl: true, fileType: true, mimeType: true, fileSize: true, uploadedAt: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.order.count({ where });

    const enrichedOrders = await recoverFileAttachmentsForOrders(rawOrders);

    return NextResponse.json({
      success: true,
      data: enrichedOrders.map((o) => ({
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
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const result = apiLimiter(ip);
    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) } }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: 'يجب تسجيل الدخول', error: null }, { status: 401 });
    }
    const userId = (session.user as Record<string, unknown>).id as string;
    const currency = 'SAR';

    const body = await request.json();
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      attachments = [],
      fileAttachmentIds = [],
      promoCode,
    } = body;

    // SECURITY: Client-submitted prices are completely ignored.
    // All pricing is computed server-side from the database.

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

    if (!service.isActive) {
      return NextResponse.json(
        { success: false, error: 'Service is not available' },
        { status: 400 }
      );
    }

    const coupon = await resolveCoupon(promoCode, Number(service.price));
    // SECURITY: All pricing computed server-side from database values only.
    // Client-submitted amounts are completely ignored.
    const pricing = await computeOrderPricing(Number(service.price), coupon);

    const orderNumber = generateOrderNumber();
    const invoiceNumber = generateInvoiceNumber();
    const trackingToken = generateTrackingToken();

    const { createdOrder, invoice } = await prisma.$transaction(async (tx) => {
      if (coupon) {
        const couponRow = await tx.coupon.findUnique({ where: { id: coupon.id } });
        if (!couponRow || (couponRow.maxUses !== null && couponRow.usedCount >= couponRow.maxUses)) {
          throw new Error('COUPON_EXHAUSTED');
        }
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          serviceId,
          amount: pricing.amount,
          discount: pricing.discount,
          tax: pricing.tax,
          total: pricing.total,
          currency,
          paymentStatus: 'PENDING',
          customerName,
          customerEmail,
          customerPhone: customerPhone || '',
          notes: notes || '',
          attachments: attachments || [],
          metadata: { trackingToken, ...(coupon ? { couponCode: coupon.code } : {}) },
          status: 'PENDING',
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: createdOrder.id,
          status: 'PENDING',
          description: 'تم استلام الطلب بنجاح',
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: createdOrder.id,
          userId,
          subtotal: pricing.amount,
          tax: pricing.tax,
          discount: pricing.discount,
          total: pricing.total,
          status: 'PENDING',
        },
      });

      if (fileAttachmentIds.length > 0) {
        await tx.fileAttachment.updateMany({
          where: { id: { in: fileAttachmentIds }, userId },
          data: { orderId: createdOrder.id },
        });
      }

      return { createdOrder, invoice };
    });

    const order = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        service: true,
        invoice: true,
        payments: true,
        timeline: true,
        fileAttachments: { select: fileAttachmentSelect },
      },
    });

    const orderWithAttachments = order
      ? await recoverFileAttachmentsForOrder(order)
      : null;

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
      amount: String(pricing.total),
      currency,
      trackingUrl: `${SITE_URL}/track-order?order=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(trackingToken)}`,
    }).catch((err) => console.error("[Orders] Failed to send order email:", err));

    sendInvoiceEmail({
      email: customerEmail,
      name: customerName,
      invoiceNumber,
      amount: String(pricing.total),
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
          message: `طلب جديد من ${customerName} - ${service.name} (${pricing.total} ر.س)`,
          messageEn: `New order from ${customerName} - ${service.name} (${pricing.total} SAR)`,
          type: 'ORDER',
          link: `/admin/orders`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...orderWithAttachments,
        amount: Number(orderWithAttachments?.amount),
        discount: Number(orderWithAttachments?.discount),
        tax: Number(orderWithAttachments?.tax),
        total: Number(orderWithAttachments?.total),
        createdAt: orderWithAttachments?.createdAt?.toISOString(),
        updatedAt: orderWithAttachments?.updatedAt?.toISOString(),
        invoiceNumber: invoice.invoiceNumber,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'COUPON_EXHAUSTED') {
      return NextResponse.json(
        { success: false, error: 'Coupon has reached its usage limit' },
        { status: 400 }
      );
    }
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
