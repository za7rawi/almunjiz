import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? 'An error occurred' : 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
