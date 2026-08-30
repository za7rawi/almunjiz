import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/api/response";
import { sendWelcomeEmail } from "@/lib/email/service";
import { authLimiter } from "@/lib/rate-limit";
import { setRoleCookie } from "@/lib/auth/role-cookie";

// SECURITY: Per-account login attempt tracking
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ACCOUNT_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkAccountLockout(email: string): { allowed: boolean; remainingMs?: number } {
  const entry = loginAttempts.get(email.toLowerCase());
  if (!entry) return { allowed: true };
  if (Date.now() > entry.lockedUntil) {
    loginAttempts.delete(email.toLowerCase());
    return { allowed: true };
  }
  return { allowed: false, remainingMs: entry.lockedUntil - Date.now() };
}

function recordFailedAttempt(email: string): void {
  const key = email.toLowerCase();
  const entry = loginAttempts.get(key);
  if (!entry) {
    loginAttempts.set(key, { count: 1, lockedUntil: Date.now() + ACCOUNT_LOCKOUT_MS });
    return;
  }
  entry.count++;
  if (entry.count >= MAX_ACCOUNT_ATTEMPTS) {
    entry.lockedUntil = Date.now() + ACCOUNT_LOCKOUT_MS;
  }
}

function clearFailedAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const result = authLimiter(ip);
    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً / Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(result.resetMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { email } = body;
    const password = body.password || '';

    if (!email || !password) {
      return error("البريد الإلكتروني وكلمة المرور مطلوبان");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error("البريد الإلكتروني غير صحيح");
    }

    if (password.length < 6) {
      return error("كلمة المرور غير صحيحة", 401);
    }

    // SECURITY: Check per-account lockout
    const lockout = checkAccountLockout(email);
    if (!lockout.allowed) {
      const remainingMinutes = Math.ceil((lockout.remainingMs || 0) / 60000);
      return NextResponse.json(
        { success: false, error: `تم تجاوز الحد المسموح. حاول مرة أخرى بعد ${remainingMinutes} دقيقة` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return error("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    // SECURITY: Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني' },
        { status: 403 }
      );
    }

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // SECURITY: Record failed attempt for account lockout
      recordFailedAttempt(email);
      return error("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    // SECURITY: Clear failed attempts on successful login
    clearFailedAttempts(email);

    const isFirstLogin = !user.lastLoginAt;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (isFirstLogin) {
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error("[Login] Failed to send welcome email:", err)
      );
    }

    const token = crypto.randomUUID();

    return setRoleCookie(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role.toLowerCase(),
            avatar: user.avatar || "",
            createdAt: user.createdAt.toISOString(),
          },
          token,
        },
      },
      user.role
    );
  } catch (e) {
    console.error("[Login] Auth login error:", e instanceof Error ? e.message : e);
    return error("حدث خطأ أثناء تسجيل الدخول", 500);
  }
}
