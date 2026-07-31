import { NextRequest, NextResponse } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    "/api/",
    "/_next/",
    "/favicon.ico",
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
  return adminPatterns.some((p) => pathname.includes(p)) || pathname.endsWith('/admin');
}

function isDashboardRoute(pathname: string): boolean {
  return pathname.includes('/dashboard');
}

function isAdminLogin(pathname: string): boolean {
  return pathname.includes('/admin/login') || pathname.endsWith('/admin/login');
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyRoleCookie(cookie: string, secret: string): Promise<string | null> {
  const separatorIndex = cookie.lastIndexOf("|");
  if (separatorIndex === -1) return null;
  const role = cookie.substring(0, separatorIndex);
  const signature = cookie.substring(separatorIndex + 1);
  const expectedSignature = await hmacSign(role, secret);
  if (signature !== expectedSignature) return null;
  return role;
}

export async function proxy(request: NextRequest) {
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
    const newUrl = new URL(request.url);
    newUrl.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(newUrl);
  }

  if (isAdminRoute(pathname) && !isAdminLogin(pathname)) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname.replace(`/${locale}`, ''));
      return NextResponse.redirect(loginUrl);
    }

    const roleCookie = request.cookies.get('almunjiz-role')?.value;
    if (!roleCookie) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname.replace(`/${locale}`, ''));
      return NextResponse.redirect(loginUrl);
    }

    const secret = process.env.NEXTAUTH_SECRET || '';
    const role = await verifyRoleCookie(roleCookie, secret);
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER"];
    if (!role || !allowedRoles.includes(role)) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname.replace(`/${locale}`, ''));
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isDashboardRoute(pathname)) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname.replace(`/${locale}`, ''));
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect customer request routes
  if (pathname.includes('/request/')) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;
    const authState = request.cookies.get('almunjiz-auth')?.value;
    
    if (!sessionToken && !authState) {
      const locale = pathname.split('/')[1] || 'ar';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname.replace(`/${locale}`, ''));
      return NextResponse.redirect(loginUrl);
    }
  }

  const locale = pathname.startsWith('/en') ? 'en' : 'ar';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-locale', locale);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
