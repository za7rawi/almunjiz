const otpStore = new Map<string, { code: string; attempts: number; lastAttempt: number; createdAt: number }>();

const OTP_TTL = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(identifier: string, code: string): Promise<void> {
  otpStore.set(identifier, {
    code,
    attempts: 0,
    lastAttempt: 0,
    createdAt: Date.now(),
  });
}

export function verifyStoredOTP(
  identifier: string,
  code: string
): { success: boolean; error?: string } {
  const entry = otpStore.get(identifier);

  if (!entry) {
    return { success: false, error: "لم يتم إرسال رمز تحقق لهذا البريد" };
  }

  if (Date.now() - entry.createdAt > OTP_TTL) {
    otpStore.delete(identifier);
    return { success: false, error: "انتهت صلاحية الرمز. يرجى طلب رمز جديد" };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    if (Date.now() - entry.lastAttempt < LOCKOUT_DURATION) {
      const remaining = Math.ceil(
        (LOCKOUT_DURATION - (Date.now() - entry.lastAttempt)) / 60000
      );
      return {
        success: false,
        error: `تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى بعد ${remaining} دقيقة`,
      };
    }
    entry.attempts = 0;
  }

  entry.attempts++;
  entry.lastAttempt = Date.now();

  if (entry.code !== code) {
    const remaining = MAX_ATTEMPTS - entry.attempts;
    return {
      success: false,
      error:
        remaining > 0
          ? `الرمز غير صحيح. متبقي ${remaining} محاولات`
          : "تم تجاوز الحد المسموح من المحاولات",
    };
  }

  otpStore.delete(identifier);
  return { success: true };
}
