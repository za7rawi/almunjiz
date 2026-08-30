import { prisma } from '@/lib/prisma';
import { SERVICE_CATEGORIES, CONTACT_INFO } from '@/constants';

export interface PromoBarData {
  enabled?: boolean;
  textAr?: string;
  textEn?: string;
  link?: string;
}

export interface StorefrontCategory {
  key: string;
  labelAr: string;
  labelEn: string;
  count: number;
}

export interface PaymentBadge {
  slug: string;
  displayName: string;
  displayNameEn: string;
  logo?: string | null;
}

export interface StorefrontContact {
  phone: string;
  whatsapp: string;
  email: string;
  social: Record<string, string>;
}

export interface StorefrontMeta {
  promoBar: PromoBarData | null;
  categories: StorefrontCategory[];
  payments: PaymentBadge[];
  contact: StorefrontContact;
}

export async function getStorefrontMeta(): Promise<StorefrontMeta> {
  const [settings, grouped, gateways] = await Promise.all([
    prisma.settings.findMany(),
    prisma.service.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { _all: true },
    }),
    prisma.paymentGateway.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        slug: true,
        displayName: true,
        displayNameEn: true,
        logo: true,
        isDefault: true,
      },
    }),
  ]);

  const map = new Map(settings.map((s) => [s.key, s.value]));

  const rawPromo = map.get('promoBar');
  const promoBar: PromoBarData | null =
    rawPromo && typeof rawPromo === 'object'
      ? (rawPromo as PromoBarData)
      : null;

  const socialRaw =
    (map.get('social_media') as Record<string, string> | undefined) ?? {};
  const social: Record<string, string> = {};
  for (const [k, v] of Object.entries(socialRaw)) {
    if (typeof v === 'string' && v) social[k] = v;
  }

  const contact: StorefrontContact = {
    phone:
      (map.get('phone') as string) ||
      (map.get('contact_phone') as string) ||
      CONTACT_INFO.phone,
    whatsapp:
      (map.get('whatsapp') as string) ||
      (map.get('contact_whatsapp') as string) ||
      CONTACT_INFO.whatsapp,
    email:
      (map.get('contact_email') as string) ||
      (map.get('email') as string) ||
      CONTACT_INFO.email,
    social,
  };

  const categories: StorefrontCategory[] = grouped
    .map((g) => {
      const meta = (SERVICE_CATEGORIES as Record<
        string,
        { label: string; labelEn: string } | undefined
      >)[g.category];
      return {
        key: g.category,
        labelAr: meta?.label ?? g.category,
        labelEn: meta?.labelEn ?? g.category,
        count: g._count._all,
      };
    })
    .sort((a, b) => b.count - a.count);

  const payments: PaymentBadge[] = gateways.map((g) => ({
    slug: g.slug,
    displayName: g.displayName,
    displayNameEn: g.displayNameEn || g.displayName,
    logo: g.logo,
  }));

  return { promoBar, categories, payments, contact };
}