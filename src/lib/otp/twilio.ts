import type { OTPProvider } from "./provider";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error(
      "[Twilio] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in environment variables"
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require("twilio");
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

function getServiceSid(): string {
  if (!TWILIO_VERIFY_SERVICE_SID) {
    throw new Error(
      "[Twilio] Missing TWILIO_VERIFY_SERVICE_SID in environment variables"
    );
  }
  return TWILIO_VERIFY_SERVICE_SID;
}

export const twilioProvider: OTPProvider = {
  name: "twilio",

  async sendOTP(phone: string, _code: string) {
    try {
      const client = getTwilioClient();
      const serviceSid = getServiceSid();

      console.log(`[Twilio Verify] Sending OTP to ${phone} via service ${serviceSid}`);

      const verification = await client.verify.v2
        .services(serviceSid)
        .verifications.create({
          to: phone,
          channel: "sms",
        });

      console.log(`[Twilio Verify] OTP sent successfully. Status: ${verification.status}, SID: ${verification.sid}`);

      return { success: true };
    } catch (err: unknown) {
      const twilioError = err as {
        code?: number;
        message?: string;
        status?: number;
        moreInfo?: string;
      };
      console.error("[Twilio Verify] Send OTP failed:", {
        code: twilioError.code,
        message: twilioError.message,
        status: twilioError.status,
        moreInfo: twilioError.moreInfo,
      });
      return {
        success: false,
        error: twilioError.message || "فشل إرسال رمز التحقق عبر Twilio",
      };
    }
  },

  async verifyOTP(phone: string, code: string) {
    try {
      const client = getTwilioClient();
      const serviceSid = getServiceSid();

      console.log(`[Twilio Verify] Checking code for ${phone}`);

      const check = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({
          to: phone,
          code: code,
        });

      console.log(`[Twilio Verify] Check result: ${check.status}`);

      if (check.status === "approved") {
        return { success: true };
      }

      return { success: false, error: "الكود غير صحيح أو منتهي الصلاحية" };
    } catch (err: unknown) {
      const twilioError = err as {
        code?: number;
        message?: string;
        status?: number;
        moreInfo?: string;
      };
      console.error("[Twilio Verify] Check code failed:", {
        code: twilioError.code,
        message: twilioError.message,
        status: twilioError.status,
        moreInfo: twilioError.moreInfo,
      });
      return {
        success: false,
        error: twilioError.message || "فشل التحقق من الرمز عبر Twilio",
      };
    }
  },
};
