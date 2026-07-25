import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { servicesData } from '@/lib/services-data';
import { success, error } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let dbServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (dbServices.length === 0) {
      for (const s of servicesData) {
        const existing = await prisma.service.findUnique({ where: { id: s.id } });
        if (!existing) {
          await prisma.service.create({
            data: {
              id: s.id,
              name: s.name,
              nameEn: s.nameEn,
              description: s.description,
              descriptionEn: s.descriptionEn,
              slug: s.id,
              icon: s.icon,
              category: s.category as never,
              price: s.price,
              duration: s.duration,
              isActive: s.isActive,
              features: s.features,
              requirements: s.requirements,
              sortOrder: servicesData.indexOf(s),
            },
          });
        }
      }
      dbServices = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    }

    const enriched = dbServices.map((svc) => {
      const seed = servicesData.find((s) => s.id === svc.id);
      return {
        id: svc.id,
        name: svc.name,
        nameEn: svc.nameEn,
        description: svc.description,
        descriptionEn: svc.descriptionEn,
        fullDescription: seed?.fullDescription ?? svc.description,
        fullDescriptionEn: seed?.fullDescriptionEn ?? svc.descriptionEn,
        icon: svc.icon,
        category: svc.category,
        categoryAr: seed?.categoryAr ?? svc.category,
        price: Number(svc.price),
        priceNote: seed?.priceNote ?? 'يبدأ من',
        priceNoteEn: seed?.priceNoteEn ?? 'Starting from',
        duration: svc.duration ?? seed?.duration ?? '',
        durationEn: seed?.durationEn ?? svc.duration ?? '',
        features: svc.features,
        featuresEn: seed?.featuresEn ?? svc.features,
        requirements: svc.requirements,
        requirementsEn: seed?.requirementsEn ?? svc.requirements,
        steps: seed?.steps ?? [],
        stepsEn: seed?.stepsEn ?? [],
        faq: seed?.faq ?? [],
        faqEn: seed?.faqEn ?? [],
        requiredDocuments: seed?.requiredDocuments ?? [],
        requiredDocumentsEn: seed?.requiredDocumentsEn ?? [],
        isPopular: seed?.isPopular ?? false,
        isActive: svc.isActive,
        sortOrder: svc.sortOrder,
        gradient: seed?.gradient ?? '',
      };
    });

    let filtered = enriched;

    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }

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
