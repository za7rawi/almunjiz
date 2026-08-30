import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readHomepageContent } from '@/lib/homepage-content';
import { getStorefrontMeta, type StorefrontMeta } from '@/lib/storefront-data';
import { SERVICE_CATEGORIES } from '@/constants';

export const dynamic = 'force-dynamic';

async function buildStorefront(): Promise<{
  meta: StorefrontMeta;
  homepage: Record<string, unknown>;
  services: Record<string, unknown>[];
  categories: { key: string; labelAr: string; labelEn: string; count: number; icon: string }[];
  banners: Record<string, unknown>[];
  offers: Record<string, unknown>[];
}> {
  const [meta, homepage, dbServices, banners, offers] = await Promise.all([
    getStorefrontMeta(),
    readHomepageContent(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    }),
  ]);

  const services = dbServices.map((svc) => ({
    id: svc.id,
    slug: svc.slug,
    name: svc.name,
    nameEn: svc.nameEn,
    description: svc.description,
    descriptionEn: svc.descriptionEn,
    icon: svc.icon,
    image: svc.image || null,
    category: svc.category,
    categoryAr: svc.categoryAr || svc.category,
    price: Number(svc.price),
    priceNote: svc.priceNote || 'يبدأ من',
    priceNoteEn: svc.priceNoteEn || 'Starting from',
    duration: svc.duration || '',
    durationEn: svc.durationEn || svc.duration || '',
    isPopular: svc.isPopular,
    isActive: svc.isActive,
    gradient: svc.gradient || '',
  }));

  const grouped = new Map<string, number>();
  for (const s of services) {
    const key = s.category as string;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  const categories = Array.from(grouped.entries())
    .map(([key, count]) => {
      const metaCfg = (SERVICE_CATEGORIES as Record<
        string,
        { icon: string; label: string; labelEn: string } | undefined
      >)[key];
      return {
        key,
        labelAr: metaCfg?.label ?? key,
        labelEn: metaCfg?.labelEn ?? key,
        icon: metaCfg?.icon ?? '',
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    meta,
    homepage,
    services,
    categories,
    banners,
    offers,
  };
}

export async function GET() {
  try {
    const data = await buildStorefront();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to build storefront data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load storefront data' },
      { status: 500 }
    );
  }
}