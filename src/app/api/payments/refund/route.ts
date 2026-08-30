import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentProvider } from '@/lib/payment-providers';
import type { RefundParams } from '@/lib/payment-providers';
import { writeAuditLog } from '@/lib/audit-log';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { paymentId, orderId, amount, reason } = body;

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { success: false, error: 'paymentId or orderId is required' },
        { status: 400 }
      );
    }

    let payment;
    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });
    } else {
      payment = await prisma.payment.findFirst({
        where: { orderId },
        include: { order: true },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    if (!payment.transactionId || !payment.gatewayId) {
      return NextResponse.json(
        { success: false, error: 'Payment has no transaction or gateway info' },
        { status: 400 }
      );
    }

    const gateway = await prisma.paymentGateway.findUnique({ where: { id: payment.gatewayId } });
    if (!gateway) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not found' },
        { status: 404 }
      );
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

    const refundAmount = amount || payment.amount;
    if (refundAmount <= 0 || refundAmount > Number(payment.amount)) {
      return NextResponse.json(
        { success: false, error: 'Refund amount must be between 0 and the original payment amount' },
        { status: 400 }
      );
    }

    const refundParams: RefundParams = {
      transactionId: payment.transactionId,
      amount: refundAmount,
      reason: reason || 'Customer requested refund',
    };

    await writeAuditLog({
      action: 'payment.refunded',
      resource: 'Payment',
      resourceId: payment.id,
      metadata: { orderId: payment.orderId, amount: refundParams.amount, reason: refundParams.reason },
    });

    const result = await provider.refundPayment(refundParams);

    if (result.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundId: result.refundId,
        },
      });

      if (payment.order) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'REFUNDED' },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          refundId: result.refundId,
          amount: result.amount,
          status: result.status,
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: result.error || 'Refund failed',
    });
  } catch (error) {
    console.error('Refund processing failed:', error);
    return NextResponse.json(
      { success: false, error: 'Refund processing failed' },
      { status: 500 }
    );
  }
}
