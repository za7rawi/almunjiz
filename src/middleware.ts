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

function isAdminRoute(pathname: string): boolean {
  const adminPatterns = ['/admin/'];
  return adminPatterns.some((p) => pathname.includes(p));
}

function isDashboardRoute(pathname: string): boolean {
  return pathname.includes('/dashboard');
}

function isAdminLogin(pathname: string): boolean {
  return pathname.includes('/admin/login');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isStaticAsset(pathname)) {
    const response = NextResponse.next();
    if (pathname.startsWith("/api/")) {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      response.headers.set("Pragma", "no-cache");
    }
    return response;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocaleFromHeaders(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  if (isAdminRoute(pathname) && !isAdminLogin(pathname)) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isDashboardRoute(pathname)) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|_next/static|_next/image|favicon.ico|public|uploads).*)",
  ],
};
