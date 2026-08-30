import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export async function storeOTP(identifier: string, code: string): Promise<void> {
  await prisma.otpCode.create({
    data: {
      identifier: identifier.toLowerCase(),
      code,
      attempts: 0,
      used: false,
    },
  });
}

export async function verifyStoredOTP(
  identifier: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedId = identifier.toLowerCase();

  const entry = await prisma.otpCode.findFirst({
    where: { identifier: normalizedId, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!entry) {
    return { success: false, error: "لم يتم إرسال رمز تحقق لهذا البريد" };
  }

  if (Date.now() - entry.createdAt.getTime() > OTP_TTL_MS) {
    await prisma.otpCode.deleteMany({ where: { identifier: normalizedId } });
    return { success: false, error: "انتهت صلاحية الرمز. يرجى طلب رمز جديد" };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    if (entry.lastAttempt && Date.now() - entry.lastAttempt.getTime() < LOCKOUT_DURATION_MS) {
      const remaining = Math.ceil(
        (LOCKOUT_DURATION_MS - (Date.now() - entry.lastAttempt.getTime())) / 60000
      );
      return {
        success: false,
        error: `تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى بعد ${remaining} دقيقة`,
      };
    }
    await prisma.otpCode.update({
      where: { id: entry.id },
      data: { attempts: 0 },
    });
  }

  const newAttempts = entry.attempts + 1;

  if (entry.code !== code) {
    await prisma.otpCode.update({
      where: { id: entry.id },
      data: { attempts: newAttempts, lastAttempt: new Date() },
    });
    const remaining = MAX_ATTEMPTS - newAttempts;
    return {
      success: false,
      error:
        remaining > 0
          ? `الرمز غير صحيح. متبقي ${remaining} محاولات`
          : "تم تجاوز الحد المسموح من المحاولات",
    };
  }

  await prisma.otpCode.update({
    where: { id: entry.id },
    data: { used: true, attempts: newAttempts, lastAttempt: new Date() },
  });

  return { success: true };
}
