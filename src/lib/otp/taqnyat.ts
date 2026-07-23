import type { OTPProvider } from "./provider";

export const taqnyatProvider: OTPProvider = {
  name: "taqnyat",

  async sendOTP(phone: string, code: string) {
    console.log(`[Taqnyat Demo] Sending OTP ${code} to ${phone}`);
    return { success: true };
  },

  async verifyOTP(phone: string, code: string) {
    console.log(`[Taqnyat Demo] Verifying OTP ${code} for ${phone}`);
    return { success: true };
  },
};
