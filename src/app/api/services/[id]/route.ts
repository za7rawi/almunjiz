import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { servicesData } from '@/lib/services-data';
import { success, error, notFound } from '@/lib/api/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      service = await prisma.service.findUnique({ where: { slug: id } });
    }

    if (!service) {
      return notFound('الخدمة غير موجودة');
    }

    const seed = servicesData.find((s) => s.id === service!.id);

    const enriched = {
      id: service.id,
      name: service.name,
      nameEn: service.nameEn,
      description: service.description,
      descriptionEn: service.descriptionEn,
      fullDescription: seed?.fullDescription ?? service.description,
      fullDescriptionEn: seed?.fullDescriptionEn ?? service.descriptionEn,
      icon: service.icon,
      category: service.category,
      categoryAr: seed?.categoryAr ?? service.category,
      price: Number(service.price),
      priceNote: seed?.priceNote ?? 'يبدأ من',
      priceNoteEn: seed?.priceNoteEn ?? 'Starting from',
      duration: service.duration ?? seed?.duration ?? '',
      durationEn: seed?.durationEn ?? service.duration ?? '',
      features: service.features,
      featuresEn: seed?.featuresEn ?? service.features,
      requirements: service.requirements,
      requirementsEn: seed?.requirementsEn ?? service.requirements,
      steps: seed?.steps ?? [],
      stepsEn: seed?.stepsEn ?? [],
      faq: seed?.faq ?? [],
      faqEn: seed?.faqEn ?? [],
      requiredDocuments: seed?.requiredDocuments ?? [],
      requiredDocumentsEn: seed?.requiredDocumentsEn ?? [],
      isPopular: seed?.isPopular ?? false,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      gradient: seed?.gradient ?? '',
    };

    return success(enriched);
  } catch (e) {
    console.error('Error fetching service:', e);
    return error('حدث خطأ في جلب الخدمة', 500);
  }
}
