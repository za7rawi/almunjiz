import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/config";

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_config", request.url));
  }

  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") || "/services";

  const safeRedirect = redirect.startsWith('/') && !redirect.includes('://') ? redirect : '/services';

  const baseUrl = SITE_URL;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const stateToken = crypto.randomUUID();
  const state = encodeURIComponent(`${stateToken}:${safeRedirect}`);

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set("google_oauth_state", stateToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
