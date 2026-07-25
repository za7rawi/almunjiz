import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    const data: Record<string, unknown> = {};
    for (const setting of settings) {
      data[setting.key] = setting.value;
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: {}, error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updates: Record<string, unknown> = body;

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, data: {}, error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(updates)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value: value as any, updatedAt: new Date() },
        create: { key, value: value as any, updatedAt: new Date() },
      });
    }

    const settings = await prisma.settings.findMany();
    const data: Record<string, unknown> = {};
    for (const setting of settings) {
      data[setting.key] = setting.value;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: {}, error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
