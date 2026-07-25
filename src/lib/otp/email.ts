import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "OTP <noreply@munjiz.store>";

function getClient() {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables");
  }
  return new Resend(RESEND_API_KEY);
}

export async function sendEmailOTP(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getClient();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "رمز التحقق - المنجز AL-MUNJIZ",
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; margin: 0; padding: 20px; }
            .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #2580eb, #14b8a6); padding: 32px 24px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }
            .body { padding: 32px 24px; text-align: center; }
            .otp-label { color: #666; font-size: 14px; margin-bottom: 16px; }
            .otp-code { font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #2580eb; background: #f0f7ff; border-radius: 12px; padding: 20px 16px; display: inline-block; direction: ltr; }
            .note { color: #999; font-size: 12px; margin-top: 24px; }
            .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #eee; }
            .footer p { color: #999; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>المنجز AL-MUNJIZ</h1>
              <p>خدمة التحقق من البريد الإلكتروني</p>
            </div>
            <div class="body">
              <p class="otp-label">رمز التحقق الخاص بك هو:</p>
              <div class="otp-code">${code}</div>
              <p class="note">هذا الرمز صالح لمدة 5 دقائق فقط. لا تشاركه مع أي شخص.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} المنجز AL-MUNJIZ. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[EmailOTP] Resend error:", error);
      return { success: false, error: error.message || "فشل إرسال البريد الإلكتروني" };
    }

    return { success: true };
  } catch (err) {
    console.error("[EmailOTP] send error:", err);
    return { success: false, error: "حدث خطأ أثناء إرسال رمز التحقق" };
  }
}
