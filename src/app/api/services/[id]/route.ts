import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const brief = searchParams.get('brief') === 'true';

    let service = await prisma.service.findUnique({ where: { id } });

    if (!service) {
      service = await prisma.service.findUnique({ where: { slug: id } });
    }

    if (!service) {
      return notFound('الخدمة غير موجودة');
    }

    if (brief) {
      return success({
        id: service.id,
        name: service.name,
        nameEn: service.nameEn,
        description: service.description,
        descriptionEn: service.descriptionEn,
        price: Number(service.price),
        priceNote: service.priceNote || 'يبدأ من',
        priceNoteEn: service.priceNoteEn || 'Starting from',
        duration: service.duration || '',
        durationEn: service.durationEn || service.duration || '',
        requiredDocuments: service.requiredDocuments,
      });
    }

    const enriched = {
      id: service.id,
      name: service.name,
      nameEn: service.nameEn,
      description: service.description,
      descriptionEn: service.descriptionEn,
      fullDescription: service.fullDescription || service.description,
      fullDescriptionEn: service.fullDescriptionEn || service.descriptionEn,
      icon: service.icon,
      category: service.category,
      categoryAr: service.categoryAr || service.category,
      price: Number(service.price),
      priceNote: service.priceNote || 'يبدأ من',
      priceNoteEn: service.priceNoteEn || 'Starting from',
      duration: service.duration || '',
      durationEn: service.durationEn || service.duration || '',
      features: service.features,
      featuresEn: service.featuresEn.length > 0 ? service.featuresEn : service.features,
      requirements: service.requirements,
      requirementsEn: service.requirementsEn.length > 0 ? service.requirementsEn : service.requirements,
      steps: (service.steps as { title: string; description: string; icon: string }[] | null) || [],
      stepsEn: (service.stepsEn as { title: string; description: string; icon: string }[] | null) || [],
      faq: (service.faq as { question: string; answer: string }[] | null) || [],
      faqEn: (service.faqEn as { question: string; answer: string }[] | null) || [],
      requiredDocuments: service.requiredDocuments,
      requiredDocumentsEn: service.requiredDocumentsEn.length > 0 ? service.requiredDocumentsEn : service.requiredDocuments,
      isPopular: service.isPopular,
      gradient: service.gradient || '',
    };

    return success(enriched);
  } catch (e) {
    console.error('Error fetching service:', e);
    return error('حدث خطأ في جلب الخدمة', 500);
  }
}
