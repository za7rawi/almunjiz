import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServicesFromData() {
  const { servicesData } = await import('../src/lib/services-data');

  for (const s of servicesData) {
    const existing = await prisma.service.findUnique({ where: { id: s.id } });

    const data = {
      id: s.id,
      name: s.name,
      nameEn: s.nameEn,
      description: s.description,
      descriptionEn: s.descriptionEn,
      fullDescription: s.fullDescription || null,
      fullDescriptionEn: s.fullDescriptionEn || null,
      slug: s.id,
      icon: s.icon,
      category: s.category as never,
      categoryAr: s.categoryAr || null,
      price: s.price,
      priceNote: s.priceNote || 'يبدأ من',
      priceNoteEn: s.priceNoteEn || 'Starting from',
      duration: s.duration || null,
      durationEn: s.durationEn || null,
      isActive: s.isActive,
      isPopular: s.isPopular || false,
      features: s.features,
      featuresEn: s.featuresEn || s.features,
      requirements: s.requirements,
      requirementsEn: s.requirementsEn || s.requirements,
      steps: s.steps || [],
      stepsEn: s.stepsEn || s.steps || [],
      faq: s.faq || [],
      faqEn: s.faqEn || s.faq || [],
      requiredDocuments: s.requiredDocuments || [],
      requiredDocumentsEn: s.requiredDocumentsEn || s.requiredDocuments || [],
      image: s.image || null,
      gradient: s.gradient || null,
      sortOrder: servicesData.indexOf(s),
    };

    if (existing) {
      await prisma.service.update({
        where: { id: s.id },
        data,
      });
      console.log(`Updated: ${s.id}`);
    } else {
      await prisma.service.create({ data });
      console.log(`Created: ${s.id}`);
    }
  }

  console.log(`Seeded ${servicesData.length} services`);
  await prisma.$disconnect();
}

seedServicesFromData().catch((e) => {
  console.error('Service seed failed:', e);
  process.exit(1);
});
