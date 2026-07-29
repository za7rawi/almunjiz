import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/app/api/auth/[...nextauth]/route";
import { sendWelcomeEmail } from "@/lib/email/service";
import { setRoleCookieOnRedirect } from "@/lib/auth/role-cookie";
import { SITE_URL } from "@/config";

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
  const storedState = request.cookies.get("google_oauth_state")?.value;

  const baseUrl = SITE_URL;
  const acceptLanguage = request.headers.get("accept-language") || "";
  const locale = acceptLanguage.startsWith("en") ? "en" : "ar";

  if (error || !code) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/login?error=google_denied`, baseUrl)
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }

  if (!state || !storedState) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/login?error=google_state_missing`, baseUrl)
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }

  const decodedState = decodeURIComponent(state);
  const colonIndex = decodedState.indexOf(":");
  if (colonIndex === -1) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/login?error=google_state_invalid`, baseUrl)
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }

  const stateToken = decodedState.substring(0, colonIndex);
  const rawRedirect = decodedState.substring(colonIndex + 1);

  if (stateToken !== storedState) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/login?error=google_state_mismatch`, baseUrl)
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }

  const redirectPath = rawRedirect.startsWith('/') && !rawRedirect.includes('://') ? rawRedirect : '/services';

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const tokenData = await exchangeCodeForTokens(code, redirectUri);
    if (!tokenData?.access_token) {
      const response = NextResponse.redirect(
        new URL(`/${locale}/login?error=google_token`, baseUrl)
      );
      response.cookies.delete("google_oauth_state");
      return response;
    }

    const googleUser = await fetchUserInfo(tokenData.access_token);
    if (!googleUser?.email) {
      const response = NextResponse.redirect(
        new URL(`/${locale}/login?error=google_profile`, baseUrl)
      );
      response.cookies.delete("google_oauth_state");
      return response;
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

    const roleResponse = await setRoleCookieOnRedirect(loginUrl.toString(), user.role);
    roleResponse.cookies.delete("google_oauth_state");
    return roleResponse;
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    const response = NextResponse.redirect(
      new URL(`/${locale}/login?error=google_error`, baseUrl)
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }
}
