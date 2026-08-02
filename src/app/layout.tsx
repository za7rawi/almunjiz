import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Tajawal } from "next/font/google";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { RootSplash } from "@/components/providers/root-splash";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://munjiz.store"),
  title: "المنجز | AL-MUNJIZ - منصة الخدمات الإلكترونية",
  description:
    "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية. نقدم حلولاً سريعة وموثوقة تلبي احتياجاتك.",
  keywords: [
    "خدمات إلكترونية",
    "المنجز",
    "AL-MUNJIZ",
    "السعودية",
    "طلبات إلكترونية",
  ],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.jpg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "المنجز | AL-MUNJIZ",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://munjiz.store",
    siteName: "المنجز AL-MUNJIZ",
    title: "المنجز | AL-MUNJIZ - منصة الخدمات الإلكترونية",
    description:
      "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية.",
  },
  twitter: {
    card: "summary_large_image",
    title: "المنجز | AL-MUNJIZ",
    description:
      "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية.",
  },
  alternates: {
    canonical: "https://munjiz.store",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2580eb",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "المنجز | AL-MUNJIZ",
  alternateName: "Al-Munjiz Platform",
  url: "https://munjiz.store",
  logo: "https://munjiz.store/logo.jpg",
  description:
    "منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية. نقدم حلولاً سريعة وموثوقة تلبي احتياجاتك.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+962791038472",
    contactType: "customer service",
    areaServed: "SA",
    availableLanguage: ["ar", "en"],
  },
  sameAs: ["https://wa.me/962791038472"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "المنجز | AL-MUNJIZ",
  url: "https://munjiz.store",
  inLanguage: "ar",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://munjiz.store/ar/services?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isEnglish = pathname.startsWith("/en");
  const lang = isEnglish ? "en" : "ar";
  const dir = isEnglish ? "ltr" : "rtl";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <SessionProvider>
          <RootSplash />
          <ToasterProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
