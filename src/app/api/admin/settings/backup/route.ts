import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit-log';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const [
      settings,
      services,
      orders,
      invoices,
      payments,
      users,
      gateways,
      banners,
      news,
      faqs,
      pages,
      offers,
      coupons,
      reviews,
      notifications,
    ] = await Promise.all([
      prisma.settings.findMany(),
      prisma.service.findMany(),
      prisma.order.findMany({
        include: { timeline: true, payments: true, invoice: true },
      }),
      prisma.invoice.findMany(),
      prisma.payment.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.paymentGateway.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          provider: true,
          displayName: true,
          isActive: true,
          environment: true,
          apiEndpoint: true,
          config: true,
          createdAt: true,
          updatedAt: true,
          // SECURITY: Never export secretKey, publicKey, webhookSecret, merchantId
        },
      }),
      prisma.banner.findMany(),
      prisma.news.findMany(),
      prisma.fAQ.findMany(),
      prisma.page.findMany(),
      prisma.offer.findMany(),
      prisma.coupon.findMany(),
      prisma.review.findMany(),
      prisma.notification.findMany(),
    ]);

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      platform: 'AL-MUNJIZ',
      data: {
        settings,
        services,
        orders,
        invoices,
        payments,
        users,
        gateways,
        banners,
        news,
        faqs,
        pages,
        offers,
        coupons,
        reviews,
        notifications,
      },
      counts: {
        settings: settings.length,
        services: services.length,
        orders: orders.length,
        invoices: invoices.length,
        payments: payments.length,
        users: users.length,
        gateways: gateways.length,
        banners: banners.length,
        news: news.length,
        faqs: faqs.length,
        pages: pages.length,
        offers: offers.length,
        coupons: coupons.length,
        reviews: reviews.length,
        notifications: notifications.length,
      },
    };

    await writeAuditLog({
      action: 'settings.backup_created',
      resource: 'Settings',
      metadata: { counts: backup.counts },
    });

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="almunjiz-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('[Backup] Error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء النسخة الاحتياطية' },
      { status: 500 }
    );
  }
}
