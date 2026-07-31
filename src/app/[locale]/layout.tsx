import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocaleProvider } from "@/components/providers/locale-provider";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const pathname = await getPathname(`/${locale}`);
  const base = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  const canonical = `${SITE_URL}${pathname}`;
  const arUrl = `${SITE_URL}/ar${base}`;
  const enUrl = `${SITE_URL}/en${base}`;

  const title = isArabic
    ? "المنجز | AL-MUNJIZ - منصة الخدمات الإلكترونية"
    : "AL-MUNJIZ - Electronic Services Platform";
  const description = isArabic
    ? "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية. نقدم حلولاً سريعة وموثوقة تلبي احتياجاتك."
    : "AL-MUNJIZ leading platform for electronic services in Saudi Arabia. Fast and reliable solutions for your needs.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: arUrl,
        en: enUrl,
        "x-default": arUrl,
      },
    },
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
