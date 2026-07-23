import { NextRequest } from "next/server";
import { verifyStoredOTP } from "@/lib/otp";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { phone, email, code } = await request.json();

    const identifier = phone || email;

    if (!identifier || !code) {
      return error("رقم الهاتف/البريد الإلكتروني والكود مطلوبان");
    }

    if (!/^\d{6}$/.test(code)) {
      return error("الكود يجب أن يكون 6 أرقام");
    }

    const result = verifyStoredOTP(identifier, code);

    if (!result.success) {
      return error(result.error || "الكود غير صحيح");
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return success(
      { user: result.user, token },
      "تم التحقق بنجاح"
    );
  } catch {
    return error("حدث خطأ أثناء التحقق", 500);
  }
}
