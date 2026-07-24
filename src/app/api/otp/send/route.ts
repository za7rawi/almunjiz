import { NextRequest } from "next/server";
import { generateOTP, storeOTP, getOTPProvider } from "@/lib/otp";
import { isValidEmail, isValidPhone } from "@/lib/api/validation";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { phone, email, provider: providerName } = await request.json();

    const identifier = phone || email;

    if (!identifier) {
      return error("رقم الهاتف أو البريد الإلكتروني مطلوب");
    }

    if (phone && !isValidPhone(phone)) {
      return error("رقم الهاتف غير صحيح");
    }

    if (email && !isValidEmail(email)) {
      return error("البريد الإلكتروني غير صحيح");
    }

    const activeProvider = providerName || process.env.OTP_PROVIDER || "twilio";
    const provider = getOTPProvider(activeProvider);

    console.log(`[OTP Send] Provider: ${provider.name}, Identifier: ${identifier}`);

    if (provider.name === "twilio") {
      // Twilio Verify generates its own code — no local storage needed
      const result = await provider.sendOTP(identifier, "");

      if (!result.success) {
        console.error(`[OTP Send] Twilio failed: ${result.error}`);
        return error(result.error || "فشل إرسال رمز التحقق", 500);
      }

      console.log(`[OTP Send] Twilio OTP sent successfully to ${identifier}`);
      return success(
        { identifier, provider: provider.name },
        "تم إرسال رمز التحقق بنجاح"
      );
    }

    // For non-Twilio providers: generate code locally, store, and send
    const code = generateOTP();
    const storeResult = storeOTP(identifier, code);

    if (!storeResult.success) {
      return error(storeResult.error || "حدث خطأ", 429);
    }

    try {
      const result = await provider.sendOTP(identifier, code);
      if (!result.success) {
        console.error(`[OTP Send] Provider ${provider.name} failed: ${result.error}`);
      }
    } catch (err) {
      console.error(`[OTP Send] Provider ${provider.name} exception:`, err);
    }

    const isDev = process.env.NODE_ENV !== "production";
    const message = isDev
      ? `تم إرسال رمز التحقق${identifier.includes("@") ? " إلى بريدك الإلكتروني" : " إلى هاتفك"}. للتجربة، الرمز هو: ${code}`
      : "تم إرسال رمز التحقق بنجاح";

    const responseData: Record<string, string> = { identifier, provider: provider.name };
    if (isDev) responseData.devCode = code;

    return success(responseData, message);
  } catch (err) {
    console.error("[OTP Send] Unhandled error:", err);
    return error("حدث خطأ أثناء إرسال الكود", 500);
  }
}
