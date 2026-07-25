export type GatewayProviderSlug =
  | 'tap'
  | 'moyasar'
  | 'hyperpay'
  | 'paytabs'
  | 'myfatoorah'
  | 'stripe'
  | 'edfapay'
  | 'tamara'
  | 'tabby'
  | 'custom';

export type PaymentEnvironment = 'SANDBOX' | 'PRODUCTION';

export interface GatewayConfig {
  id: string;
  slug: string;
  provider: string;
  publicKey?: string | null;
  secretKey: string;
  merchantId?: string | null;
  webhookSecret?: string | null;
  apiEndpoint?: string | null;
  environment: PaymentEnvironment;
  config?: Record<string, unknown> | null;
}

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  callbackUrl: string;
  webhookUrl: string;
  items?: PaymentItem[];
  metadata?: Record<string, string>;
}

export interface PaymentItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  clientSecret?: string;
  redirectUrl?: string;
  accessToken?: string;
  rawData?: Record<string, unknown>;
  error?: string;
}

export interface PaymentVerification {
  success: boolean;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'CANCELLED';
  transactionId?: string;
  amount?: number;
  currency?: string;
  rawData?: Record<string, unknown>;
  error?: string;
}

export interface WebhookPayload {
  headers: Record<string, string>;
  body: Record<string, unknown>;
  rawBody?: string;
}

export interface WebhookResult {
  received: boolean;
  transactionId?: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface RefundParams {
  transactionId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: 'COMPLETED' | 'PENDING' | 'FAILED';
  rawData?: Record<string, unknown>;
  error?: string;
}
