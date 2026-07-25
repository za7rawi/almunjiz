import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptGatewayKeys } from '@/lib/encryption';
import { writeAuditLog } from '@/lib/audit-log';

const SENSITIVE_FIELDS = ['secretKey', 'webhookSecret', 'publicKey'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gateway = await prisma.paymentGateway.findUnique({ where: { id } });
    if (!gateway) {
      return NextResponse.json({ success: false, error: 'Gateway not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: { ...gateway, secretKey: '••••••••' },
    });
  } catch (error) {
    console.error('Failed to fetch gateway:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch gateway' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.paymentGateway.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Gateway not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'slug', 'provider', 'displayName', 'displayNameEn',
      'description', 'logo', 'publicKey', 'merchantId', 'webhookSecret',
      'apiEndpoint', 'environment', 'isActive', 'isDefault', 'sortOrder',
      'supportsApplePay', 'supportsGooglePay', 'supportsInstallments',
      'supportedCurrencies', 'supportedCountries', 'config',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.secretKey && body.secretKey !== '••••••••') {
      updateData.secretKey = body.secretKey;
    }

    const encrypted = encryptGatewayKeys(
      updateData as Record<string, unknown>,
      SENSITIVE_FIELDS,
    );

    if (encrypted.isDefault === true) {
      await prisma.paymentGateway.updateMany({
        data: { isDefault: false },
      });
    }

    const gateway = await prisma.paymentGateway.update({
      where: { id },
      data: encrypted,
    });

    const wasActive = existing.isActive;
    const isActive = gateway.isActive;
    if (!wasActive && isActive) {
      await writeAuditLog({
        action: 'gateway.activated',
        resource: 'PaymentGateway',
        resourceId: gateway.id,
        metadata: { slug: gateway.slug },
      });
    } else if (wasActive && !isActive) {
      await writeAuditLog({
        action: 'gateway.deactivated',
        resource: 'PaymentGateway',
        resourceId: gateway.id,
        metadata: { slug: gateway.slug },
      });
    } else {
      await writeAuditLog({
        action: 'gateway.updated',
        resource: 'PaymentGateway',
        resourceId: gateway.id,
        metadata: { slug: gateway.slug, fields: Object.keys(updateData) },
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...gateway, secretKey: '••••••••' },
    });
  } catch (error) {
    console.error('Failed to update gateway:', error);
    return NextResponse.json({ success: false, error: 'Failed to update gateway' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.paymentGateway.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Gateway not found' }, { status: 404 });
    }

    await prisma.paymentGateway.delete({ where: { id } });

    await writeAuditLog({
      action: 'gateway.deleted',
      resource: 'PaymentGateway',
      resourceId: id,
      metadata: { slug: existing.slug, provider: existing.provider },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete gateway:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete gateway' }, { status: 500 });
  }
}
