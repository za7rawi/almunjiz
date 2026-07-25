import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      return NextResponse.json(
        { success: false, data: null, error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to fetch service' },
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

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Service not found' },
        { status: 404 }
      );
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.service.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return NextResponse.json(
          { success: false, data: null, error: 'A service with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.durationUnit !== undefined && { durationUnit: body.durationUnit }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.features !== undefined && { features: body.features }),
        ...(body.requirements !== undefined && { requirements: body.requirements }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update service' },
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

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Delete related orders first, then the service
    await prisma.order.deleteMany({ where: { serviceId: id } });
    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to delete service' },
      { status: 500 }
    );
  }
}
