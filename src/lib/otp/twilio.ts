import type { OTPProvider } from "./provider";

export const twilioProvider: OTPProvider = {
  name: "twilio",

  async sendOTP(phone: string, code: string) {
    console.log(`[Twilio Demo] Sending OTP ${code} to ${phone}`);
    return { success: true };
  },

  async verifyOTP(phone: string, code: string) {
    console.log(`[Twilio Demo] Verifying OTP ${code} for ${phone}`);
    return { success: true };
  },
};
