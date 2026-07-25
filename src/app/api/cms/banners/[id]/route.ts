import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const banner = await prisma.banner.findUnique({ where: { id } });

    if (!banner) {
      return NextResponse.json(
        { success: false, data: null, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.subtitleEn !== undefined && { subtitleEn: body.subtitleEn }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.link !== undefined && { link: body.link }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Banner not found' },
        { status: 404 }
      );
    }

    await prisma.banner.delete({ where: { id } });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
