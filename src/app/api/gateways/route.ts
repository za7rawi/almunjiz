import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        provider: true,
        displayName: true,
        displayNameEn: true,
        description: true,
        logo: true,
        environment: true,
        isActive: true,
        isDefault: true,
        sortOrder: true,
        supportsApplePay: true,
        supportsGooglePay: true,
        supportsInstallments: true,
        supportedCurrencies: true,
        supportedCountries: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: gateways });
  } catch (error) {
    console.error('Failed to fetch gateways:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gateways' },
      { status: 500 }
    );
  }
}
