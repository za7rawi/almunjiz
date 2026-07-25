import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || `service-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['name', 'nameEn', 'description', 'descriptionEn', 'category', 'price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, data: null, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!body.slug) {
      body.slug = generateSlug(body.nameEn);
    }

    // Check slug uniqueness
    const existing = await prisma.service.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'A service with this slug already exists' },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        description: body.description,
        descriptionEn: body.descriptionEn,
        slug: body.slug,
        icon: body.icon || null,
        image: body.image || null,
        category: body.category,
        price: body.price,
        duration: body.duration || null,
        durationUnit: body.durationUnit || null,
        isActive: body.isActive ?? true,
        features: body.features || [],
        requirements: body.requirements || [],
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to create service' },
      { status: 500 }
    );
  }
}
