import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentProvider } from '@/lib/payment-providers';
import { writeAuditLog } from '@/lib/audit-log';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: providerSlug } = await params;
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => { headers[key] = value; });

    const gateway = await prisma.paymentGateway.findFirst({
      where: { slug: providerSlug, isActive: true },
    });

    if (!gateway) {
      console.error(`Webhook received for unknown gateway: ${providerSlug}`);
      return NextResponse.json({ received: false, error: 'Gateway not found' }, { status: 404 });
    }

    const provider = createPaymentProvider({
      id: gateway.id,
      slug: gateway.slug,
      provider: gateway.provider,
      publicKey: gateway.publicKey,
      secretKey: gateway.secretKey,
      merchantId: gateway.merchantId,
      webhookSecret: gateway.webhookSecret,
      apiEndpoint: gateway.apiEndpoint,
      environment: gateway.environment,
      config: gateway.config as Record<string, unknown> | null,
    });

    await writeAuditLog({
      action: 'webhook.received',
      resource: 'Webhook',
      metadata: { provider: providerSlug, hasSignature: !!headers['stripe-signature'] || !!headers['x-tap-signature'] },
    });

    const isValid = await provider.verifyWebhookSignature({ headers, body, rawBody });
    if (!isValid) {
      await writeAuditLog({
        action: 'webhook.failed',
        resource: 'Webhook',
        metadata: { provider: providerSlug, reason: 'Invalid signature' },
      });
      return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 401 });
    }

    const webhookResult = provider.parseWebhook({ headers, body, rawBody });

    if (webhookResult.transactionId) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: webhookResult.transactionId },
        include: { order: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: webhookResult.status === 'COMPLETED' ? 'COMPLETED'
              : webhookResult.status === 'FAILED' ? 'FAILED'
              : webhookResult.status === 'CANCELLED' ? 'FAILED'
              : 'PENDING',
            gatewayData: body,
          },
        });

        const orderUpdate: Record<string, unknown> = {};

        if (webhookResult.status === 'COMPLETED') {
          orderUpdate.paymentStatus = 'PAID';
          orderUpdate.status = 'PENDING';
          orderUpdate.paidAt = new Date();

          const existingInvoice = await prisma.invoice.findUnique({
            where: { orderId: payment.orderId },
          });
          if (!existingInvoice) {
            const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            await prisma.invoice.create({
              data: {
                invoiceNumber,
                orderId: payment.orderId,
                userId: payment.userId,
                subtotal: payment.order.amount,
                tax: payment.order.tax || 0,
                discount: payment.order.discount || 0,
                total: payment.order.total,
                status: 'PAID',
                paidAt: new Date(),
              },
            });
          } else {
            await prisma.invoice.update({
              where: { id: existingInvoice.id },
              data: { status: 'PAID', paidAt: new Date() },
            });
          }

          await writeAuditLog({
            action: 'payment.completed',
            resource: 'Payment',
            resourceId: payment.orderId,
            metadata: { transactionId: webhookResult.transactionId, provider: providerSlug, source: 'webhook' },
          });
        } else if (webhookResult.status === 'FAILED' || webhookResult.status === 'CANCELLED') {
          orderUpdate.paymentStatus = 'FAILED';
          await writeAuditLog({
            action: 'payment.failed',
            resource: 'Payment',
            resourceId: payment.orderId,
            metadata: { transactionId: webhookResult.transactionId, status: webhookResult.status, provider: providerSlug },
          });
        }

        await prisma.order.update({
          where: { id: payment.orderId },
          data: orderUpdate,
        });

        await prisma.orderTimeline.create({
          data: {
            orderId: payment.orderId,
            status: 'PENDING',
            description: `Payment ${webhookResult.status.toLowerCase()} via ${gateway.displayName} (${webhookResult.transactionId})`,
          },
        });
      }
    }

    await writeAuditLog({
      action: 'webhook.processed',
      resource: 'Webhook',
      metadata: {
        provider: providerSlug,
        transactionId: webhookResult.transactionId,
        status: webhookResult.status,
        received: webhookResult.received,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { received: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
