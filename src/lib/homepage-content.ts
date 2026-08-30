import { prisma } from '@/lib/prisma';
import { DEFAULT_HOMEPAGE } from '@/constants/homepage';

function normalizeJobject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === 'object') return value as T;
  return fallback;
}

function normalizeList(value: unknown, fallback: unknown[]): unknown[] {
  if (Array.isArray(value) && value.length > 0) return value;
  return fallback;
}

function normalizeStats(stats: unknown) {
  if (!Array.isArray(stats) || stats.length === 0) return DEFAULT_HOMEPAGE.stats;
  const first = stats[0] as { number?: unknown; value?: unknown; label?: { ar?: string; en?: string } };
  if (first.number !== undefined) return stats;
  return stats.map((s) => {
    const item = s as { value?: unknown; label?: { ar?: string; en?: string } };
    return {
      number: String(item.value ?? ''),
      labelAr: item.label?.ar ?? '',
      labelEn: item.label?.en ?? '',
    };
  });
}

function normalizeHero(raw: unknown) {
  const hero = normalizeJobject<Record<string, unknown>>(raw, {});
  const merged = { ...DEFAULT_HOMEPAGE.hero, ...hero };
  const isLegacyBadge =
    hero.badgeAr === undefined &&
    (hero.titleAr === 'منصة المنجز' || hero.titleAr === 'Al-Munjiz Platform');
  if (isLegacyBadge) {
    merged.badgeAr = String(hero.titleAr ?? DEFAULT_HOMEPAGE.hero.badgeAr);
    merged.badgeEn = String(hero.titleEn ?? DEFAULT_HOMEPAGE.hero.badgeEn);
    merged.titleAr =
      typeof hero.subtitleAr === 'string' && hero.subtitleAr
        ? hero.subtitleAr
        : DEFAULT_HOMEPAGE.hero.titleAr;
    merged.titleEn =
      typeof hero.subtitleEn === 'string' && hero.subtitleEn
        ? hero.subtitleEn
        : DEFAULT_HOMEPAGE.hero.titleEn;
  }
  return merged;
}

export function normalizeHomepageData(raw: unknown) {
  const data = normalizeJobject<Record<string, unknown>>(raw, {});
  return {
    ...DEFAULT_HOMEPAGE,
    ...data,
    hero: normalizeHero(data.hero),
    stats: normalizeStats(data.stats),
    whyUs: normalizeList(data.whyUs, DEFAULT_HOMEPAGE.whyUs),
    steps: normalizeList(data.steps, DEFAULT_HOMEPAGE.steps),
    testimonials: normalizeList(data.testimonials, DEFAULT_HOMEPAGE.testimonials),
    faq: normalizeList(data.faq, DEFAULT_HOMEPAGE.faq),
  };
}

export async function readHomepageContent() {
  const content = await prisma.siteContent.findUnique({
    where: { section: 'homepage' },
  });
  return content ? normalizeHomepageData(content.data) : { ...DEFAULT_HOMEPAGE } as Record<string, unknown>;
}