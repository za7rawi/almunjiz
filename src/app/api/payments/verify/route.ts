import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentProvider } from '@/lib/payment-providers';
import { writeAuditLog } from '@/lib/audit-log';
import { sendPaymentSuccessEmail } from '@/lib/email/service';
import { requireAuth } from '@/lib/admin-auth';
import { generateInvoiceNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { transactionId, gatewayId, orderId } = body;

    if (!transactionId || !gatewayId) {
      return NextResponse.json(
        { success: false, error: 'transactionId and gatewayId are required' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } });
    if (!order || order.userId !== auth.session.userId) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح / Unauthorized' },
        { status: 403 }
      );
    }

    const gateway = await prisma.paymentGateway.findUnique({ where: { id: gatewayId } });
    if (!gateway) {
      return NextResponse.json(
        { success: false, error: 'Gateway not found' },
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

    const result = await provider.verifyPayment(transactionId);

    if (result.success && orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        const newPaymentStatus = result.status === 'COMPLETED' ? 'PAID' : result.status === 'FAILED' ? 'FAILED' : 'PENDING';
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: newPaymentStatus,
            status: result.status === 'COMPLETED' ? 'UNDER_REVIEW' : order.status,
            paidAt: result.status === 'COMPLETED' ? new Date() : null,
          },
        });

        await prisma.payment.updateMany({
          where: { transactionId },
          data: {
            status: result.status === 'COMPLETED' ? 'COMPLETED' : result.status === 'FAILED' ? 'FAILED' : 'PENDING',
            gatewayData: result.rawData ? JSON.parse(JSON.stringify(result.rawData)) : undefined,
          },
        });

        if (result.status === 'COMPLETED') {
          const existingInvoice = await prisma.invoice.findUnique({ where: { orderId } });
          if (!existingInvoice) {
            const invoiceNumber = generateInvoiceNumber();
            await prisma.invoice.create({
              data: {
                invoiceNumber,
                orderId,
                userId: order.userId,
                subtotal: order.amount,
                tax: order.tax || 0,
                discount: order.discount || 0,
                total: order.total,
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
            resourceId: orderId,
            metadata: { transactionId, gateway: gateway.slug, amount: order.total },
          });

          await writeAuditLog({
            action: 'payment.verified',
            resource: 'payment',
            resourceId: orderId,
            userId: order.userId,
            metadata: { transactionId, amount: Number(order.total), orderNumber: order.orderNumber },
          });

          const customerUser = order.userId ? await prisma.user.findUnique({ where: { id: order.userId } }) : null;
          if (customerUser) {
            sendPaymentSuccessEmail({
              email: customerUser.email,
              name: customerUser.name,
              transactionId,
              amount: String(order.total),
              currency: order.currency,
              orderNumber: order.orderNumber,
              paymentMethod: gateway.slug,
            }).catch((err) => console.error("[Payment] Failed to send payment email:", err));
          }
        } else {
          await writeAuditLog({
            action: 'payment.failed',
            resource: 'Payment',
            resourceId: orderId,
            metadata: { transactionId, status: result.status, error: result.error },
          });
        }
      }
    }

    return NextResponse.json({
      success: result.success,
      status: result.status,
      transactionId: result.transactionId,
      amount: result.amount,
      currency: result.currency,
      error: result.error,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
