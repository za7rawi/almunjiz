import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentProvider } from '@/lib/payment-providers';
import type { CreatePaymentParams } from '@/lib/payment-providers';
import { generateIdempotencyKey } from '@/lib/encryption';
import { writeAuditLog } from '@/lib/audit-log';
import { requireAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const {
      orderId, gatewayId, amount, currency = 'SAR', description,
      customerName, customerEmail, customerPhone, items, metadata,
      idempotencyKey: clientKey,
    } = body;

    if (!orderId || !gatewayId || !amount || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, orderNumber: true } });
    if (!order || order.userId !== auth.session.userId) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح / Unauthorized' },
        { status: 403 }
      );
    }

    const idemKey = clientKey || generateIdempotencyKey();

    const existingPayment = await prisma.payment.findFirst({
      where: {
        idempotencyKey: idemKey,
        status: { in: ['PENDING', 'COMPLETED'] },
      },
    });

    if (existingPayment) {
      await writeAuditLog({
        action: 'idempotency.duplicate_blocked',
        resource: 'Payment',
        metadata: { idempotencyKey: idemKey, originalPaymentId: existingPayment.id },
      });
      return NextResponse.json({
        success: true,
        data: {
          transactionId: existingPayment.transactionId,
          duplicate: true,
        },
      });
    }

    const gateway = await prisma.paymentGateway.findUnique({ where: { id: gatewayId } });
    if (!gateway || !gateway.isActive) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not found or inactive' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://munjiz.store';
    const callbackUrl = `${siteUrl}/payment/callback?orderId=${orderId}&gatewayId=${gatewayId}`;
    const webhookUrl = `${siteUrl}/api/webhooks/${gateway.slug}`;

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

    const paymentParams: CreatePaymentParams = {
      orderId,
      orderNumber: order.orderNumber,
      amount: Number(amount),
      currency,
      description: description || `Payment for order`,
      customerName,
      customerEmail,
      customerPhone,
      callbackUrl,
      webhookUrl,
      items,
      metadata,
    };

    await writeAuditLog({
      action: 'payment.created',
      resource: 'Payment',
      resourceId: orderId,
      metadata: { gatewayId, amount, currency, customerEmail, idempotencyKey: idemKey },
    });

    const result = await provider.createPayment(paymentParams);

    if (result.success && result.transactionId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      const METHOD_MAP: Record<string, string> = {
        VISA: 'VISA', visa: 'VISA',
        MASTERCARD: 'MASTER_CARD', mastercard: 'MASTER_CARD',
        MADA: 'MADA', mada: 'MADA',
        APPLE_PAY: 'APPLE_PAY', apple_pay: 'APPLE_PAY',
        GOOGLE_PAY: 'GOOGLE_PAY', google_pay: 'GOOGLE_PAY',
        STC_PAY: 'STC_PAY', stc_pay: 'STC_PAY',
        BANK_TRANSFER: 'BANK_TRANSFER', bank_transfer: 'BANK_TRANSFER',
      };

      const paymentMethod = METHOD_MAP[gateway.slug] || 'VISA';

      await prisma.payment.create({
        data: {
          orderId,
          idempotencyKey: idemKey,
          userId: order?.userId || '',
          gatewayId: gateway.id,
          amount: Number(amount),
          currency,
          method: paymentMethod as never,
          status: 'PENDING',
          transactionId: result.transactionId,
          gatewayData: result.rawData ? JSON.parse(JSON.stringify(result.rawData)) : undefined,
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: gateway.slug,
          paymentStatus: 'PROCESSING',
          gatewayId: gateway.id,
          transactionId: result.transactionId,
        },
      });

      await writeAuditLog({
        action: 'payment.processing',
        resource: 'Payment',
        resourceId: orderId,
        metadata: { transactionId: result.transactionId, gateway: gateway.slug },
      });
    } else {
      await writeAuditLog({
        action: 'payment.failed',
        resource: 'Payment',
        resourceId: orderId,
        metadata: { error: result.error, gateway: gateway.slug },
      });
    }

    return NextResponse.json({
      success: result.success,
      data: {
        transactionId: result.transactionId,
        paymentUrl: result.paymentUrl,
        clientSecret: result.clientSecret,
        redirectUrl: result.redirectUrl,
        idempotencyKey: idemKey,
      },
      error: result.error,
    });
  } catch (error) {
    console.error('Payment processing failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
