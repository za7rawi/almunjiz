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

interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  url?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  paid_at?: string;
}

export class MoyasarProvider extends PaymentProvider {
  get name() { return 'Moyasar'; }
  get slug() { return 'moyasar'; }
  protected get sandboxUrl() { return 'https://api.moyasar.com/v1'; }
  protected get productionUrl() { return 'https://api.moyasar.com/v1'; }

  protected get headers() {
    const encoded = Buffer.from(`${this.config.secretKey}:`).toString('base64');
    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const body: Record<string, unknown> = {
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        description: params.description,
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
          ...params.metadata,
        },
        source: {
          type: 'credit_card',
        },
        callback_url: params.callbackUrl,
        webhook_url: params.webhookUrl,
      };

      const result = await this.post<MoyasarPayment>('/payments', body);

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: result.url,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Moyasar payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<MoyasarPayment>(`/payments/${transactionId}`);
      return {
        success: result.status === 'paid',
        status: this.mapStatus(result.status),
        transactionId: result.id,
        amount: result.amount / 100,
        currency: result.currency,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Moyasar verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {};
      if (params.amount !== undefined) {
        body.amount = Math.round(params.amount * 100);
      }
      if (params.reason) {
        body.reason = params.reason;
      }
      const result = await this.post<{
        id: string;
        status: string;
        amount: number;
        currency: string;
      }>(`/payments/${params.transactionId}/refund`, body);
      return {
        success: true,
        refundId: result.id,
        amount: result.amount / 100,
        status: result.status === 'paid' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Moyasar refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    return {
      received: true,
      transactionId: body.id as string,
      status: this.mapStatus(body.status as string),
      amount: ((body.amount as number) || 0) / 100,
      metadata: body.metadata as Record<string, unknown>,
    };
  }

  async verifyWebhookSignature(_payload: WebhookPayload): Promise<boolean> {
    return true;
  }

  private mapStatus(status: string): PaymentVerification['status'] {
    switch (status?.toLowerCase()) {
      case 'paid': return 'COMPLETED';
      case 'failed': return 'FAILED';
      case 'cancelled': return 'CANCELLED';
      default: return 'PENDING';
    }
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/payment_methods');
  }
}
