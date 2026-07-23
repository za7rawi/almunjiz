import type { OTPProvider } from "./provider";
import { unifonicProvider } from "./unifonic";
import { taqnyatProvider } from "./taqnyat";
import { twilioProvider } from "./twilio";

const providers: Record<string, OTPProvider> = {
  unifonic: unifonicProvider,
  taqnyat: taqnyatProvider,
  twilio: twilioProvider,
};

export function getOTPProvider(name: string): OTPProvider {
  return providers[name] ?? unifonicProvider;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface StoredOTP {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

const otpStore = new Map<string, StoredOTP>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const bruteForceStore = new Map<string, { count: number; resetAt: number }>();

const OTP_TTL = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const BRUTE_FORCE_MAX = 5;
const BRUTE_FORCE_WINDOW = 15 * 60 * 1000;

function cleanExpired(): void {
  const now = Date.now();
  for (const [key, val] of otpStore) {
    if (val.expiresAt < now) otpStore.delete(key);
  }
  for (const [key, val] of rateLimitStore) {
    if (val.resetAt < now) rateLimitStore.delete(key);
  }
  for (const [key, val] of bruteForceStore) {
    if (val.resetAt < now) bruteForceStore.delete(key);
  }
}

export function storeOTP(identifier: string, code: string): { success: boolean; error?: string } {
  cleanExpired();

  const rl = rateLimitStore.get(identifier);
  if (rl && rl.count >= RATE_LIMIT_MAX && Date.now() < rl.resetAt) {
    return { success: false, error: "تم تجاوز الحد الأقصى للمحاولات. يرجى المحاولة لاحقاً" };
  }

  otpStore.set(identifier, {
    code,
    expiresAt: Date.now() + OTP_TTL,
    attempts: 0,
    createdAt: Date.now(),
  });

  const existing = rateLimitStore.get(identifier);
  if (!existing || Date.now() >= existing.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: Date.now() + RATE_LIMIT_WINDOW });
  } else {
    existing.count++;
  }

  return { success: true };
}

export function verifyStoredOTP(
  identifier: string,
  code: string
): { success: boolean; error?: string; user?: Record<string, string> } {
  cleanExpired();

  const bf = bruteForceStore.get(identifier);
  if (bf && bf.count >= BRUTE_FORCE_MAX && Date.now() < bf.resetAt) {
    return { success: false, error: "تم تجاوز الحد الأقصى للمحاولات الخاطئة. يرجى المحاولة بعد 15 دقيقة" };
  }

  const stored = otpStore.get(identifier);
  if (!stored) {
    return { success: false, error: "لم يتم إرسال كود بعد" };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    return { success: false, error: "انتهت صلاحية الكود" };
  }

  stored.attempts++;

  if (stored.code !== code) {
    const existing = bruteForceStore.get(identifier);
    if (!existing || Date.now() >= existing.resetAt) {
      bruteForceStore.set(identifier, { count: 1, resetAt: Date.now() + BRUTE_FORCE_WINDOW });
    } else {
      existing.count++;
    }
    return { success: false, error: "الكود غير صحيح" };
  }

  otpStore.delete(identifier);
  bruteForceStore.delete(identifier);

  const namePart = identifier.includes("@") ? identifier.split("@")[0] : identifier;

  return {
    success: true,
    user: {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: namePart,
      email: identifier.includes("@") ? identifier : `${identifier}@demo.com`,
      phone: identifier.includes("@") ? "" : identifier,
      role: "CUSTOMER",
      avatar: "",
    },
  };
}

export { otpStore, rateLimitStore, bruteForceStore };
