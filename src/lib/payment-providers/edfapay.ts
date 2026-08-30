import { PaymentProvider } from './base';
import { verifyHmacSha256 } from '@/lib/encryption';
import type {
  CreatePaymentParams,
  PaymentResult,
  PaymentVerification,
  WebhookPayload,
  WebhookResult,
  RefundParams,
  RefundResult,
} from './types';

interface EdfaPayResponse {
  status: boolean;
  message: string;
  data: {
    invoice_id: string;
    payment_url: string;
    amount: number;
    currency: string;
  };
}

interface EdfaPayStatusResponse {
  status: boolean;
  message: string;
  data: {
    invoice_id: string;
    payment_status: string;
    amount: number;
    currency: string;
    transaction_id?: string;
  };
}

export class EdfaPayProvider extends PaymentProvider {
  get name() { return 'EdfaPay'; }
  get slug() { return 'edfapay'; }
  protected get sandboxUrl() { return 'https://sandbox.edfapay.com/api/v1'; }
  protected get productionUrl() { return 'https://api.edfapay.com/v1'; }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const config = (this.config.config || {}) as Record<string, unknown>;

      const body: Record<string, unknown> = {
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        customer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone || '',
        },
        callback_url: params.callbackUrl,
        webhook_url: params.webhookUrl,
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
          ...params.metadata,
        },
        expiry_minutes: config.expiryMinutes || 60,
      };

      const result = await this.post<EdfaPayResponse>('/payments/create', body);

      if (!result.status) {
        throw new Error(result.message);
      }

      return {
        success: true,
        transactionId: result.data.invoice_id,
        paymentUrl: result.data.payment_url,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'EdfaPay payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<EdfaPayStatusResponse>(`/payments/${transactionId}`);

      if (!result.status) {
        throw new Error(result.message);
      }

      return {
        success: result.data.payment_status === 'paid',
        status: this.mapStatus(result.data.payment_status),
        transactionId: result.data.invoice_id,
        amount: result.data.amount,
        currency: result.data.currency,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'EdfaPay verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {};
      if (params.amount !== undefined) {
        body.amount = params.amount;
      }
      if (params.reason) {
        body.reason = params.reason;
      }
      const result = await this.post<{
        status: boolean;
        message: string;
        data?: {
          refund_id?: string;
          refund_status?: string;
          refund_amount?: number;
        };
      }>(`/payments/${params.transactionId}/refund`, body);
      if (!result.status) {
        throw new Error(result.message);
      }
      return {
        success: true,
        refundId: result.data?.refund_id,
        amount: result.data?.refund_amount || params.amount,
        status: result.data?.refund_status === 'refunded' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'EdfaPay refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    return {
      received: true,
      transactionId: body.invoice_id as string || body.transaction_id as string,
      status: this.mapStatus(body.payment_status as string),
      amount: body.amount as number,
      metadata: body.metadata as Record<string, unknown>,
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    const secret = this.config.webhookSecret;
    if (!secret) return false;

    const signature = payload.headers['x-edfapay-signature'];
    if (!signature) return false;

    const rawBody = payload.rawBody || JSON.stringify(payload.body);

    return verifyHmacSha256(secret, rawBody, signature);
  }

  private mapStatus(status: string): PaymentVerification['status'] {
    switch (status?.toLowerCase()) {
      case 'paid': return 'COMPLETED';
      case 'failed': return 'FAILED';
      case 'expired': return 'CANCELLED';
      case 'cancelled': return 'CANCELLED';
      default: return 'PENDING';
    }
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/payment-methods');
  }
}
