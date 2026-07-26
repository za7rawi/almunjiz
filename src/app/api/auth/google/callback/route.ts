import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/app/api/auth/[...nextauth]/route";
import { sendWelcomeEmail } from "@/lib/email/service";

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

async function fetchUserInfo(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://munjiz.store";
  const locale = "ar";

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=google_denied`, baseUrl)
    );
  }

  const redirectPath = state ? decodeURIComponent(state) : "/dashboard";

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const tokenData = await exchangeCodeForTokens(code, redirectUri);
    if (!tokenData?.access_token) {
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=google_token`, baseUrl)
      );
    }

    const googleUser = await fetchUserInfo(tokenData.access_token);
    if (!googleUser?.email) {
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=google_profile`, baseUrl)
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      const bcrypt = await import("bcryptjs");
      const defaultPassword = await bcrypt.hash(crypto.randomUUID(), 12);

      user = await prisma.user.create({
        data: {
          name: googleUser.name || "مستخدم Google",
          email: googleUser.email,
          password: defaultPassword,
          avatar: googleUser.picture || null,
          role: "CUSTOMER",
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });

      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error("[Google OAuth] Failed to send welcome email:", err)
      );
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          avatar: googleUser.picture || user.avatar,
          emailVerified: true,
        },
      });
    }

    const token = createVerificationToken(user.email, "google");
    const loginUrl = new URL(`/${locale}/login`, baseUrl);
    loginUrl.searchParams.set("googleToken", token);
    loginUrl.searchParams.set("googleEmail", user.email);
    loginUrl.searchParams.set("redirect", redirectPath);

    return NextResponse.redirect(loginUrl.toString());
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=google_error`, baseUrl)
    );
  }
}
