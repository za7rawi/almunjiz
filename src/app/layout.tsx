import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
