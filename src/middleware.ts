import { NextRequest, NextResponse } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

function getLocaleFromHeaders(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim())
      .find((lang) => locales.some((l) => lang.startsWith(l)));

    if (preferred) {
      return locales.find((l) => preferred.startsWith(l)) ?? defaultLocale;
    }
  }
  return defaultLocale;
}

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    "/api/",
    "/_next/",
    "/favicon.ico",
    "/uploads/",
    "/robots.txt",
    "/sitemap.xml",
  ];
  return publicPaths.some((p) => pathname.startsWith(p));
}

function isStaticAsset(pathname: string): boolean {
  const extensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"];
  return extensions.some((ext) => pathname.endsWith(ext));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getLocaleFromHeaders(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    "/((?!_next|_next/static|_next/image|favicon.ico|public|uploads).*)",
  ],
};
