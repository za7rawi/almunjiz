import { PaymentProvider } from './base';
import type {
  CreatePaymentParams,
  PaymentResult,
  PaymentVerification,
  WebhookPayload,
  WebhookResult,
  RefundParams,
  RefundResult,
} from './types';

interface HyperPayCheckout {
  id: string;
  result: { code: string; description: string };
  payment: { mode: string };
  timestamp: string;
}

interface HyperPayPaymentStatus {
  id: string;
  result: { code: string; description: string };
  payment: {
    mode: string;
    brand: string;
    bin: string;
    last4Digits: string;
  };
  amount: { value: string; currency: string };
  timestamp: string;
}

export class HyperPayProvider extends PaymentProvider {
  get name() { return 'HyperPay'; }
  get slug() { return 'hyperpay'; }
  protected get sandboxUrl() { return 'https://test-hyperpay.com'; }
  protected get productionUrl() { return 'https://hyperpay.com'; }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const config = (this.config.config || {}) as Record<string, unknown>;
      const merchantId = config.merchantId || this.config.merchantId;

      const body: Record<string, unknown> = {
        merchantId,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        customer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone || '',
        },
        billing: {
          name: params.customerName,
          email: params.customerEmail,
        },
        returnUrl: params.callbackUrl,
        cancelUrl: params.callbackUrl,
        errorUrl: params.callbackUrl,
        notificationUrl: params.webhookUrl,
      };

      const result = await this.post<HyperPayCheckout>('/v2/checkout', body);

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: `${this.baseUrl}/checkout/${result.id}`,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HyperPay payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<HyperPayPaymentStatus>(`/v2/payments/${transactionId}`);
      return {
        success: result.result?.code === '000.100.110',
        status: this.mapStatus(result.result?.code || ''),
        transactionId: result.id,
        amount: parseFloat(result.amount?.value || '0'),
        currency: result.amount?.currency,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'HyperPay verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {
        paymentId: params.transactionId,
      };
      if (params.amount !== undefined) {
        body.amount = params.amount;
      }
      if (params.reason) {
        body.reason = params.reason;
      }
      const result = await this.post<{
        id: string;
        result: { code: string; description: string };
        amount: { value: string; currency: string };
      }>('/v2/refund', body);
      return {
        success: result.result?.code?.startsWith('000.') || false,
        refundId: result.id,
        amount: parseFloat(result.amount?.value || '0'),
        status: result.result?.code?.startsWith('000.') ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HyperPay refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    const transaction = body.transaction as Record<string, unknown>;
    return {
      received: true,
      transactionId: body.id as string || transaction?.id as string,
      status: this.mapStatus(body.result_code as string || transaction?.result_code as string),
      amount: parseFloat(body.amount as string || transaction?.amount as string || '0'),
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    if (!this.config.webhookSecret) return true;
    const secret = payload.headers['authorization'];
    if (!secret) return false;
    return secret === `Bearer ${this.config.webhookSecret}`;
  }

  private mapStatus(code: string): PaymentVerification['status'] {
    if (code.startsWith('000.')) return 'COMPLETED';
    if (code.startsWith('000.100.11')) return 'PENDING';
    if (code.startsWith('8')) return 'FAILED';
    return 'PENDING';
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/v2/checkout/invalid');
  }
}
