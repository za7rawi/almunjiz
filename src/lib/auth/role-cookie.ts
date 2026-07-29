import { NextResponse } from "next/server";

const ROLE_COOKIE_NAME = "almunjiz-role";
const ROLE_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function setRoleCookie(
  response: Response,
  role: string
): Promise<NextResponse> {
  const secret = process.env.NEXTAUTH_SECRET || "";
  const signature = await hmacSign(role, secret);
  const cookieValue = `${role}|${signature}`;

  const body = await response.json();
  const nextResponse = NextResponse.json(body, { status: response.status });

  nextResponse.cookies.set(ROLE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ROLE_COOKIE_MAX_AGE,
    path: "/",
  });

  return nextResponse;
}

export async function setRoleCookieOnRedirect(
  redirectUrl: string,
  role: string
): Promise<NextResponse> {
  const secret = process.env.NEXTAUTH_SECRET || "";
  const signature = await hmacSign(role, secret);
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
