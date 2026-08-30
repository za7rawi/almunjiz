import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const locales = ["ar", "en"];
const defaultLocale = "ar";

const ADMIN_API_PREFIXES = ["/api/admin/", "/api/cms/"];
const PROTECTED_API_PREFIXES = ["/api/users", "/api/invoices", "/api/coupons"];
const PUBLIC_API_PREFIXES = [
  "/api/auth/",
  "/api/webhooks/",
  "/api/services",
  "/api/faqs",
  "/api/gateways",
  "/api/contact",
  "/api/track/",
  "/api/otp/",
  "/api/seed/",
  "/api/orders",
  "/api/upload",
  "/api/files",
  "/api/payments",
  "/api/notifications",
];

const ADMIN_API_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"];

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAdminApi(pathname: string): boolean {
  return ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p));
}

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
}

async function handleApiProtection(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (isPublicApi(pathname)) return null;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isAdminApi(pathname)) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }
    const role = token.role as string | undefined;
    if (!role || !ADMIN_API_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح - صلاحيات الإدارة مطلوبة" },
        { status: 403 }
      );
    }
    return null;
  }

  if (isProtectedApi(pathname)) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }
    return null;
  }

  return null;
}

function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    "/api/",
    "/_next/",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json",
    "/site.webmanifest",
  ];
  return publicPaths.some((p) => pathname.startsWith(p));
}

function isStaticAsset(pathname: string): boolean {
  const extensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".json", ".webmanifest"];
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
  // SECURITY: Cookie format is now "ROLE|TIMESTAMP|SIGNATURE"
  const parts = cookie.split("|");
  if (parts.length === 3) {
    const [role, timestampStr, signature] = parts;
    const timestamp = Number(timestampStr);
    // Reject if cookie is older than max age (7 days)
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return null;
    const expectedSignature = await hmacSign(`${role}|${timestamp}`, secret);
    if (signature !== expectedSignature) return null;
    return role;
  }
  // Backward compatibility: old format "ROLE|SIGNATURE"
  if (parts.length === 2) {
    const [role, signature] = parts;
    const expectedSignature = await hmacSign(role, secret);
    if (signature !== expectedSignature) return null;
    return role;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const apiProtection = await handleApiProtection(request);
    if (apiProtection) return apiProtection;
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
  }

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

  // SECURITY: Only accept server-side session token for request routes
  // Client-side almunjiz-auth cookie is NOT accepted for route protection
  if (pathname.includes('/request/')) {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (!sessionToken) {
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
