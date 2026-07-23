import type { OTPProvider } from "./provider";

export const unifonicProvider: OTPProvider = {
  name: "unifonic",

  async sendOTP(phone: string, code: string) {
    console.log(`[Unifonic Demo] Sending OTP ${code} to ${phone}`);
    return { success: true };
  },

  async verifyOTP(phone: string, code: string) {
    console.log(`[Unifonic Demo] Verifying OTP ${code} for ${phone}`);
    return { success: true };
  },
};
