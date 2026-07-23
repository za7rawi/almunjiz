export interface OTPProvider {
  name: string;
  sendOTP(phone: string, code: string): Promise<{ success: boolean; error?: string }>;
  verifyOTP(phone: string, code: string): Promise<{ success: boolean; error?: string }>;
}
