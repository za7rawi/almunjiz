import { NextRequest } from "next/server";
import { verifyStoredOTP, getOTPProvider } from "@/lib/otp";
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

    if (provider.name === "twilio") {
      // Use Twilio Verify's verification check API
      const result = await provider.verifyOTP(identifier, code);

      if (!result.success) {
        console.error(`[OTP Verify] Twilio check failed: ${result.error}`);
        return error(result.error || "الكود غير صحيح");
      }

      console.log(`[OTP Verify] Twilio verification approved for ${identifier}`);

      const namePart = identifier.includes("@")
        ? identifier.split("@")[0]
        : identifier;

      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: namePart,
        email: identifier.includes("@") ? identifier : `${identifier}@twilio.com`,
        phone: identifier.includes("@") ? "" : identifier,
        role: "CUSTOMER",
        avatar: "",
      };

      const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      return success({ user, token }, "تم التحقق بنجاح");
    }

    // For non-Twilio providers: verify against local store
    const result = verifyStoredOTP(identifier, code);

    if (!result.success) {
      return error(result.error || "الكود غير صحيح");
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return success(
      { user: result.user, token },
      "تم التحقق بنجاح"
    );
  } catch (err) {
    console.error("[OTP Verify] Unhandled error:", err);
    return error("حدث خطأ أثناء التحقق", 500);
  }
}
