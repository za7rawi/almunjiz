import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    apple: "/favicon.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          <ToasterProvider />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
