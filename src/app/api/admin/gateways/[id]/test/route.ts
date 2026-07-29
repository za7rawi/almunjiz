import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/config';
import { prisma } from '@/lib/prisma';
import { createPaymentProvider } from '@/lib/payment-providers';
import type { CreatePaymentParams, PaymentProvider } from '@/lib/payment-providers';
import { writeAuditLog } from '@/lib/audit-log';
import { requireAdmin } from '@/lib/admin-auth';

interface TestResult {
  provider: string;
  connection: { success: boolean; message: string; durationMs: number };
  payment?: { success: boolean; transactionId?: string; paymentUrl?: string; durationMs: number; error?: string };
  verification?: { success: boolean; status?: string; durationMs: number; error?: string };
  overall: 'pass' | 'fail' | 'partial';
}

function createTestProvider(gateway: {
  id: string;
  slug: string;
  provider: string;
  publicKey: string | null;
  secretKey: string;
  merchantId: string | null;
  webhookSecret: string | null;
  apiEndpoint: string | null;
  environment: string;
  config: unknown;
}): PaymentProvider {
  return createPaymentProvider({
    id: gateway.id,
    slug: gateway.slug,
    provider: gateway.provider,
    publicKey: gateway.publicKey,
    secretKey: gateway.secretKey,
    merchantId: gateway.merchantId,
    webhookSecret: gateway.webhookSecret,
    apiEndpoint: gateway.apiEndpoint,
    environment: gateway.environment as 'SANDBOX' | 'PRODUCTION',
    config: gateway.config as Record<string, unknown> | null,
  });
}

async function testGateway(gateway: {
  id: string;
  slug: string;
  provider: string;
  publicKey: string | null;
  secretKey: string;
  merchantId: string | null;
  webhookSecret: string | null;
  apiEndpoint: string | null;
  environment: string;
  config: unknown;
}): Promise<TestResult> {
  const provider = createTestProvider(gateway);
  const result: TestResult = {
    provider: gateway.slug,
    connection: { success: false, message: '', durationMs: 0 },
    overall: 'fail',
  };

  // Step 1: Test Connection
  const connStart = Date.now();
  try {
    const connResult = await provider.testConnection();
    result.connection = {
      success: connResult.success,
      message: connResult.message,
      durationMs: Date.now() - connStart,
    };
  } catch (error) {
    result.connection = {
      success: false,
      message: error instanceof Error ? 'An error occurred' : 'Connection test failed',
      durationMs: Date.now() - connStart,
    };
  }

  if (!result.connection.success) {
    result.overall = 'fail';
    return result;
  }

  // Step 2: Create Test Payment (SAR 1.00)
  const siteUrl = SITE_URL;
  const testOrderId = `test-${Date.now().toString(36)}`;

  const paymentParams: CreatePaymentParams = {
    orderId: testOrderId,
    orderNumber: `TEST-${Date.now().toString(36).toUpperCase()}`,
    amount: 1.00,
    currency: 'SAR',
    description: 'E2E Sandbox Test Payment',
    customerName: 'Test Customer',
    customerEmail: 'test@almunjiz.com',
    customerPhone: '+966500000000',
    callbackUrl: `${siteUrl}/payment/callback?orderId=${testOrderId}`,
    webhookUrl: `${siteUrl}/api/webhooks/${gateway.slug}`,
  };

  const payStart = Date.now();
  try {
    const payResult = await provider.createPayment(paymentParams);
    result.payment = {
      success: payResult.success,
      transactionId: payResult.transactionId,
      paymentUrl: payResult.paymentUrl,
      durationMs: Date.now() - payStart,
      error: payResult.error,
    };

    if (!payResult.success || !payResult.transactionId) {
      result.overall = 'partial';
      return result;
    }

    // Step 3: Verify Payment
    const verifyStart = Date.now();
    try {
      const verifyResult = await provider.verifyPayment(payResult.transactionId);
      result.verification = {
        success: verifyResult.success,
        status: verifyResult.status,
        durationMs: Date.now() - verifyStart,
        error: verifyResult.error,
      };
      result.overall = verifyResult.success ? 'pass' : 'partial';
    } catch (error) {
      result.verification = {
        success: false,
        durationMs: Date.now() - verifyStart,
        error: error instanceof Error ? 'An error occurred' : 'Verification failed',
      };
      result.overall = 'partial';
    }
  } catch (error) {
    result.payment = {
      success: false,
      durationMs: Date.now() - payStart,
      error: error instanceof Error ? 'An error occurred' : 'Payment creation failed',
    };
    result.overall = 'fail';
  }

  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const { id } = await params;
    const { all = false } = await request.json().catch(() => ({}));

    let gateways;
    if (all) {
      gateways = await prisma.paymentGateway.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } else {
      const gateway = await prisma.paymentGateway.findUnique({ where: { id } });
      if (!gateway) {
        return NextResponse.json({ success: false, error: 'Gateway not found' }, { status: 404 });
      }
      gateways = [gateway];
    }

    if (gateways.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active gateways to test' },
        { status: 400 }
      );
    }

    const results = await Promise.all(gateways.map(testGateway));

    const summary = {
      total: results.length,
      passed: results.filter((r) => r.overall === 'pass').length,
      partial: results.filter((r) => r.overall === 'partial').length,
      failed: results.filter((r) => r.overall === 'fail').length,
    };

    await writeAuditLog({
      action: 'gateway.tested',
      resource: 'PaymentGateway',
      metadata: { gatewayIds: gateways.map((g) => g.id), summary },
    });

    return NextResponse.json({
      success: true,
      data: { results, summary },
    });
  } catch (error) {
    console.error('E2E test runner failed:', error);
    return NextResponse.json(
      { success: false, error: 'E2E test runner failed' },
      { status: 500 }
    );
  }
}
