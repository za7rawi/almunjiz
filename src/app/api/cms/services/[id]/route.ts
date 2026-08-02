import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
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
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
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
        ...(body.fullDescription !== undefined && { fullDescription: body.fullDescription }),
        ...(body.fullDescriptionEn !== undefined && { fullDescriptionEn: body.fullDescriptionEn }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.categoryAr !== undefined && { categoryAr: body.categoryAr }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.priceNote !== undefined && { priceNote: body.priceNote }),
        ...(body.priceNoteEn !== undefined && { priceNoteEn: body.priceNoteEn }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.durationEn !== undefined && { durationEn: body.durationEn }),
        ...(body.durationUnit !== undefined && { durationUnit: body.durationUnit }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isPopular !== undefined && { isPopular: body.isPopular }),
        ...(body.features !== undefined && { features: body.features }),
        ...(body.featuresEn !== undefined && { featuresEn: body.featuresEn }),
        ...(body.requirements !== undefined && { requirements: body.requirements }),
        ...(body.requirementsEn !== undefined && { requirementsEn: body.requirementsEn }),
        ...(body.steps !== undefined && { steps: body.steps }),
        ...(body.stepsEn !== undefined && { stepsEn: body.stepsEn }),
        ...(body.faq !== undefined && { faq: body.faq }),
        ...(body.faqEn !== undefined && { faqEn: body.faqEn }),
        ...(body.requiredDocuments !== undefined && { requiredDocuments: body.requiredDocuments }),
        ...(body.requiredDocumentsEn !== undefined && { requiredDocumentsEn: body.requiredDocumentsEn }),
        ...(body.gradient !== undefined && { gradient: body.gradient }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
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
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to delete service' },
      { status: 500 }
    );
  }
}
