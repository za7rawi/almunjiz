import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptGatewayKeys } from '@/lib/encryption';
import { writeAuditLog } from '@/lib/audit-log';
import { requireAdmin } from '@/lib/admin-auth';

const SENSITIVE_FIELDS = ['secretKey', 'webhookSecret', 'publicKey'];

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const gateways = await prisma.paymentGateway.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        provider: true,
        displayName: true,
        displayNameEn: true,
        description: true,
        logo: true,
        publicKey: true,
        merchantId: true,
        environment: true,
        isActive: true,
        isDefault: true,
        sortOrder: true,
        supportsApplePay: true,
        supportsGooglePay: true,
        supportsInstallments: true,
        supportedCurrencies: true,
        supportedCountries: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const safeGateways = gateways.map((g) => ({
      ...g,
      secretKey: '••••••••',
    }));

    return NextResponse.json({ success: true, data: safeGateways });
  } catch (error) {
    console.error('Failed to fetch gateways:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gateways' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();
    const {
      name, slug, provider, displayName, displayNameEn, description, logo,
      publicKey, secretKey, merchantId, webhookSecret, apiEndpoint, environment,
      isActive, supportsApplePay, supportsGooglePay, supportsInstallments,
      supportedCurrencies, supportedCountries, config,
    } = body;

    if (!name || !slug || !provider || !secretKey) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, provider, and secretKey are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.paymentGateway.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A gateway with this slug already exists' },
        { status: 409 }
      );
    }

    const encrypted = encryptGatewayKeys(
      { secretKey, webhookSecret, publicKey },
      SENSITIVE_FIELDS,
    );

    const maxSort = await prisma.paymentGateway.aggregate({ _max: { sortOrder: true } });

    const gateway = await prisma.paymentGateway.create({
      data: {
        name, slug, provider,
        displayName: displayName || name,
        displayNameEn: displayNameEn || name,
        description, logo,
        publicKey: encrypted.publicKey,
        secretKey: encrypted.secretKey,
        merchantId,
        webhookSecret: encrypted.webhookSecret,
        apiEndpoint,
        environment: environment || 'SANDBOX',
        isActive: isActive ?? false,
        isDefault: false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        supportsApplePay: supportsApplePay ?? false,
        supportsGooglePay: supportsGooglePay ?? false,
        supportsInstallments: supportsInstallments ?? false,
        supportedCurrencies: supportedCurrencies || ['SAR'],
        supportedCountries: supportedCountries || ['SA'],
        config: config || undefined,
      },
    });

    await writeAuditLog({
      action: 'gateway.created',
      resource: 'PaymentGateway',
      resourceId: gateway.id,
      metadata: { slug: gateway.slug, provider: gateway.provider },
    });

    return NextResponse.json({
      success: true,
      data: { ...gateway, secretKey: '••••••••' },
    });
  } catch (error) {
    console.error('Failed to create gateway:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gateway' },
      { status: 500 }
    );
  }
}
