import { NextRequest } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp";
import { getOTPProvider } from "@/lib/otp";
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

    const code = generateOTP();
    const storeResult = storeOTP(identifier, code);

    if (!storeResult.success) {
      return error(storeResult.error || "حدث خطأ", 429);
    }

    let providerNameUsed = providerName || "unifonic";
    try {
      const provider = getOTPProvider(providerNameUsed);
      await provider.sendOTP(identifier, code);
      providerNameUsed = provider.name;
    } catch {
      // Provider failed, but OTP is stored — continue
    }

    const isDev = process.env.NODE_ENV !== "production";
    const message = isDev
      ? `تم إرسال رمز التحقق${identifier.includes("@") ? " إلى بريدك الإلكتروني" : " إلى هاتفك"}. للتجربة، الرمز هو: ${code}`
      : "تم إرسال رمز التحقق بنجاح";

    const responseData: Record<string, string> = { identifier, provider: providerNameUsed };
    if (isDev) responseData.devCode = code;

    return success(responseData, message);
  } catch {
    return error("حدث خطأ أثناء إرسال الكود", 500);
  }
}
