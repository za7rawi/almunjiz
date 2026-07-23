import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocaleProvider } from "@/components/providers/locale-provider";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: isArabic
      ? "المنجز | AL-MUNJIZ - منصة الخدمات الإلكترونية"
      : "AL-MUNJIZ - Electronic Services Platform",
    description: isArabic
      ? "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية. نقدم حلولاً سريعة وموثوقة تلبي احتياجاتك."
      : "AL-MUNJIZ leading platform for electronic services in Saudi Arabia. Fast and reliable solutions for your needs.",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  return (
    <LocaleProvider locale={locale}>
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
