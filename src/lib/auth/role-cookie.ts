import crypto from "crypto";
import { NextResponse } from "next/server";

const ROLE_COOKIE_NAME = "almunjiz-role";
const ROLE_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export function hmacSign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function setRoleCookie(
  body: Record<string, unknown>,
  role: string,
  status = 200
): NextResponse {
  const secret = process.env.NEXTAUTH_SECRET || "";
  const signature = hmacSign(role, secret);
  const cookieValue = `${role}|${signature}`;

  const nextResponse = NextResponse.json(body, { status });

  nextResponse.cookies.set(ROLE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ROLE_COOKIE_MAX_AGE,
    path: "/",
  });

  return nextResponse;
}

export function setRoleCookieOnRedirect(
  redirectUrl: string,
  role: string
): NextResponse {
  const secret = process.env.NEXTAUTH_SECRET || "";
  const signature = hmacSign(role, secret);
  const cookieValue = `${role}|${signature}`;

  const nextResponse = NextResponse.redirect(redirectUrl);

  nextResponse.cookies.set(ROLE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ROLE_COOKIE_MAX_AGE,
    path: "/",
  });

  return nextResponse;
}
