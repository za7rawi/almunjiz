import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SOCIAL_KEY = 'social_links';
const DEFAULT_SOCIAL = {
  twitter: '',
  instagram: '',
  linkedin: '',
  facebook: '',
  youtube: '',
  tiktok: '',
};

export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({ where: { key: SOCIAL_KEY } });

    return NextResponse.json({
      success: true,
      data: setting?.value ?? DEFAULT_SOCIAL,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: DEFAULT_SOCIAL, error: error instanceof Error ? error.message : 'Failed to fetch social links' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const value = {
      twitter: body.twitter ?? '',
      instagram: body.instagram ?? '',
      linkedin: body.linkedin ?? '',
      facebook: body.facebook ?? '',
      youtube: body.youtube ?? '',
      tiktok: body.tiktok ?? '',
    };

    const setting = await prisma.settings.upsert({
      where: { key: SOCIAL_KEY },
      update: { value },
      create: { key: SOCIAL_KEY, value },
    });

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update social links' },
      { status: 500 }
    );
  }
}
