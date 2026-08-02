import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { prisma } from "@/lib/prisma";
import { blogsData } from "@/lib/blogs-data";

const SITE_URL = "https://munjiz.store";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

async function getPathname(defaultPath = "/ar"): Promise<string> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  if (pathname) return pathname;
  return defaultPath;
}

const NOINDEX_PATTERNS = [/^\/(?:ar|en)\/(?:checkout|request|payment|admin|dashboard)(?:\/|$)/];

const PAGE_META: Record<
  string,
  { ar: { title: string; description: string; keywords?: string[] }; en: { title: string; description: string; keywords?: string[] } }
> = {
  "/services": {
    ar: { title: "خدماتنا الإلكترونية | المنجز AL-MUNJIZ", description: "تصفح خدمات المنجز الإلكترونية: تأشيرات، عقود، معاملات حكومية، سفر، أعمال والمزيد في المملكة العربية السعودية.", keywords: ["خدمات إلكترونية", "تأشيرات", "المنجز", "السعودية"] },
    en: { title: "Our Electronic Services | AL-MUNJIZ", description: "Browse AL-MUNJIZ electronic services: visas, contracts, government transactions, travel, business and more in Saudi Arabia.", keywords: ["electronic services", "visas", "AL-MUNJIZ", "Saudi Arabia"] },
  },
  "/about": {
    ar: { title: "من نحن | المنجز AL-MUNJIZ", description: "تعرف على منصة المنجز ورسالتها في تقديم خدمات إلكترونية سريعة وموثوقة في المملكة العربية السعودية." },
    en: { title: "About Us | AL-MUNJIZ", description: "Learn about AL-MUNJIZ platform and its mission to deliver fast, reliable electronic services in Saudi Arabia." },
  },
  "/contact": {
    ar: { title: "تواصل معنا | المنجز AL-MUNJIZ", description: "تواصل مع فريق المنجز للاستفسارات والدعم عبر الهاتف أو البريد الإلكتروني أو واتساب." },
    en: { title: "Contact Us | AL-MUNJIZ", description: "Contact the AL-MUNJIZ team for inquiries and support via phone, email or WhatsApp." },
  },
  "/faq": {
    ar: { title: "الأسئلة الشائعة | المنجز AL-MUNJIZ", description: "إجابات على الأسئلة الشائعة حول خدمات منصة المنجز الإلكترونية." },
    en: { title: "Frequently Asked Questions | AL-MUNJIZ", description: "Answers to frequently asked questions about AL-MUNJIZ electronic services." },
  },
  "/offers": {
    ar: { title: "العروض والتخفيضات | المنجز AL-MUNJIZ", description: "استفد من عروض وتخفيضات منصة المنجز على الخدمات الإلكترونية." },
    en: { title: "Offers & Discounts | AL-MUNJIZ", description: "Take advantage of AL-MUNJIZ offers and discounts on electronic services." },
  },
  "/blog": {
    ar: { title: "المدونة | المنجز AL-MUNJIZ", description: "مقالات وأخبار منصة المنجز: نصائح، إرشادات، وآخر المستجدات." },
    en: { title: "Blog | AL-MUNJIZ", description: "AL-MUNJIZ blog: tips, guides and the latest updates." },
  },
  "/terms": {
    ar: { title: "الشروط والأحكام | المنجز AL-MUNJIZ", description: "الشروط والأحكام الخاصة باستخدام منصة المنجز." },
    en: { title: "Terms & Conditions | AL-MUNJIZ", description: "Terms and conditions for using the AL-MUNJIZ platform." },
  },
  "/privacy": {
    ar: { title: "سياسة الخصوصية | المنجز AL-MUNJIZ", description: "سياسة الخصوصية وحماية البيانات في منصة المنجز." },
    en: { title: "Privacy Policy | AL-MUNJIZ", description: "Privacy policy and data protection at AL-MUNJIZ." },
  },
  "/track-order": {
    ar: { title: "تتبع الطلب | المنجز AL-MUNJIZ", description: "تتبع حالة طلبك على منصة المنجز بسهولة." },
    en: { title: "Track Order | AL-MUNJIZ", description: "Track the status of your order on AL-MUNJIZ easily." },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const pathname = await getPathname(`/${locale}`);
  const base = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  const canonical = `${SITE_URL}${pathname}`;
  const arUrl = `${SITE_URL}/ar${base}`;
  const enUrl = `${SITE_URL}/en${base}`;

  const noindex = NOINDEX_PATTERNS.some((re) => re.test(pathname));

  let meta: { title: string; description: string; keywords?: string[] } | undefined;

  if (/^\/services\/[^/]+/.test(base)) {
    const id = base.split("/")[2];
    const service = await prisma.service.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: { name: true, nameEn: true, description: true, descriptionEn: true, price: true },
    });
    if (service) {
      meta = isArabic
        ? { title: `${service.name} | المنجز AL-MUNJIZ`, description: service.description || `اطلب خدمة ${service.name} من منصة المنجز بسرعة وسهولة.` }
        : { title: `${service.nameEn || service.name} | AL-MUNJIZ`, description: service.descriptionEn || `Order ${service.nameEn || service.name} from AL-MUNJIZ fast and easy.` };
    }
  } else if (/^\/blog\/[^/]+/.test(base)) {
    const slug = base.split("/")[2];
    const post = blogsData.find((p) => p.slug === slug);
    if (post) {
      meta = isArabic
        ? { title: `${post.title} | المنجز AL-MUNJIZ`, description: post.excerpt || "" }
        : { title: `${post.titleEn || post.title} | AL-MUNJIZ`, description: post.excerptEn || "" };
    }
  }

  if (!meta) {
    const pageRecord = PAGE_META[base];
    if (pageRecord) {
      meta = isArabic ? pageRecord.ar : pageRecord.en;
    } else {
      meta = isArabic
        ? { title: "المنجز | AL-MUNJIZ - منصة الخدمات الإلكترونية", description: "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية. نقدم حلولاً سريعة وموثوقة تلبي احتياجاتك." }
        : { title: "AL-MUNJIZ - Electronic Services Platform", description: "AL-MUNJIZ leading platform for electronic services in Saudi Arabia. Fast and reliable solutions for your needs." };
    }
  }

  const title = meta.title;
  const description = meta.description;

  return {
    title,
    description,
    keywords: meta.keywords,
    alternates: {
      canonical,
      languages: {
        ar: arUrl,
        en: enUrl,
        "x-default": arUrl,
      },
    },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: isArabic ? "ar_SA" : "en_US",
      url: canonical,
      siteName: "المنجز AL-MUNJIZ",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function Breadcrumb({ pathname, locale }: { pathname: string; locale: string }) {
  const isArabic = locale === "ar";
  const segments = pathname.split("/").filter(Boolean).slice(1);

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: isArabic ? "الرئيسية" : "Home",
      item: `${SITE_URL}/${locale}`,
    },
    ...segments.map((seg, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: seg,
      item: `${SITE_URL}/${locale}/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const pathname = await getPathname(`/${locale}`);

  return (
    <LocaleProvider locale={locale}>
      <Breadcrumb pathname={pathname} locale={locale} />
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
