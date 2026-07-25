import { NextRequest } from "next/server";
import { verifyStoredOTP, getOTPProvider } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { phone, email, code, provider: providerName } = await request.json();

    const identifier = phone || email;

    if (!identifier || !code) {
      return error("رقم الهاتف/البريد الإلكتروني والكود مطلوبان");
    }

    if (!/^\d{6}$/.test(code)) {
      return error("الكود يجب أن يكون 6 أرقام");
    }

    const activeProvider = providerName || process.env.OTP_PROVIDER || "twilio";
    const provider = getOTPProvider(activeProvider);

    console.log(`[OTP Verify] Provider: ${provider.name}, Identifier: ${identifier}`);

    let verified = false;

    if (provider.name === "twilio") {
      const result = await provider.verifyOTP(identifier, code);
      if (!result.success) {
        console.error(`[OTP Verify] Twilio check failed: ${result.error}`);
        return error(result.error || "الكود غير صحيح");
      }
      verified = true;
      console.log(`[OTP Verify] Twilio verification approved for ${identifier}`);
    } else {
      const result = verifyStoredOTP(identifier, code);
      if (!result.success) {
        return error(result.error || "الكود غير صحيح");
      }
      verified = true;
    }

    if (!verified) {
      return error("الكود غير صحيح");
    }

    const isPhone = !identifier.includes("@");
    const phoneNum = isPhone ? identifier : undefined;
    const emailAddr = isPhone ? `${identifier.replace(/^\+/, '')}@otp.almunjiz.com` : identifier;
    const nameFromPhone = isPhone ? `مستخدم ${identifier.slice(-4)}` : identifier.split("@")[0];

    let user = null;

    if (isPhone) {
      user = await prisma.user.findUnique({ where: { phone: phoneNum } });
    } else {
      user = await prisma.user.findUnique({ where: { email: emailAddr } });
    }

    if (!user) {
      const defaultPassword = await import('bcryptjs').then(b => b.hash('otp_' + Date.now(), 10));
      user = await prisma.user.create({
        data: {
          name: nameFromPhone,
          email: emailAddr,
          phone: phoneNum || `otp_${Date.now()}`,
          password: defaultPassword,
          role: 'CUSTOMER',
          emailVerified: isPhone ? false : true,
          phoneVerified: isPhone ? true : false,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          phoneVerified: isPhone ? true : user.phoneVerified,
          emailVerified: !isPhone ? true : user.emailVerified,
        },
      });
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return success(
      {
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
      "تم التحقق بنجاح"
    );
  } catch (err) {
    console.error("[OTP Verify] Unhandled error:", err);
    return error("حدث خطأ أثناء التحقق", 500);
  }
}
