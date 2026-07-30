import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const dbServices = await prisma.service.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const enriched = dbServices.map((svc) => ({
      id: svc.id,
      name: svc.name,
      nameEn: svc.nameEn,
      description: svc.description,
      descriptionEn: svc.descriptionEn,
      icon: svc.icon,
      category: svc.category,
      categoryAr: svc.categoryAr || svc.category,
      price: Number(svc.price),
      priceNote: svc.priceNote || 'يبدأ من',
      priceNoteEn: svc.priceNoteEn || 'Starting from',
      duration: svc.duration || '',
      durationEn: svc.durationEn || svc.duration || '',
      isPopular: svc.isPopular,
      isActive: svc.isActive,
      image: svc.image || null,
      gradient: svc.gradient || '',
    }));

    let filtered = enriched;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.description.includes(q) ||
          s.descriptionEn.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return success({
      data: paged,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error('Error fetching services:', e);
    return error('حدث خطأ في جلب الخدمات', 500);
  }
}
