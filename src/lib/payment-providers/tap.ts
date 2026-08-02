import { PaymentProvider } from './base';
import { computeHmacSha256 } from '@/lib/encryption';
import type {
  CreatePaymentParams,
  PaymentResult,
  PaymentVerification,
  WebhookPayload,
  WebhookResult,
  RefundParams,
  RefundResult,
} from './types';

interface TapCharge {
  id: string;
  status: string;
  amount: number;
  currency: string;
  transaction_url?: string;
  reference_no?: string;
  response_code?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export class TapProvider extends PaymentProvider {
  get name() { return 'Tap'; }
  get slug() { return 'tap'; }
  protected get sandboxUrl() { return 'https://api.tap.company/v2'; }
  protected get productionUrl() { return 'https://api.tap.company/v2'; }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const body: Record<string, unknown> = {
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        threeDSecure: true,
        save_card: false,
        description: params.description,
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
          ...params.metadata,
        },
        reference: {
          order: params.orderNumber,
        },
        receipt: {
          email: true,
          sms: false,
        },
        customer: {
          first_name: params.customerName.split(' ')[0] || params.customerName,
          last_name: params.customerName.split(' ').slice(1).join(' ') || '.',
          email: params.customerEmail,
          phone: params.customerPhone ? { country_code: '966', number: params.customerPhone.replace('+', '') } : undefined,
        },
        source: {
          id: 'src_all',
        },
        post: {
          url: params.callbackUrl,
        },
        redirect: {
          url: params.callbackUrl,
        },
      };

      const result = await this.post<TapCharge>('/charges', body);

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: result.transaction_url,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tap payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<TapCharge>(`/charges/${transactionId}`);
      return {
        success: result.status === 'CAPTURED' || result.status === 'AUTHENTICATED',
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
        error: error instanceof Error ? error.message : 'Tap verification failed',
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
        body.description = params.reason;
      }
      const result = await this.post<{
        id: string;
        status: string;
        amount: number;
        currency: string;
      }>(`/charges/${params.transactionId}/refunds`, body);
      return {
        success: true,
        refundId: result.id,
        amount: result.amount / 100,
        status: result.status === 'CAPTURED' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tap refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    const obj = body.object as Record<string, unknown> | undefined;
    return {
      received: true,
      transactionId: body.id as string || obj?.id as string,
      status: this.mapStatus(body.status as string || obj?.status as string),
      amount: ((obj?.amount as number) || 0) / 100,
      metadata: (obj?.metadata as Record<string, unknown>) || (body.metadata as Record<string, unknown>),
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    const secret = this.config.webhookSecret;
    if (!secret) return false;

    const signature = payload.headers['x-tap-signature'];
    if (!signature) return false;

    const rawBody = payload.rawBody || JSON.stringify(payload.body);
    const expected = computeHmacSha256(secret, rawBody);

    return expected === signature;
  }

  private mapStatus(status: string): PaymentVerification['status'] {
    switch (status?.toUpperCase()) {
      case 'CAPTURED': return 'COMPLETED';
      case 'AUTHENTICATED': return 'COMPLETED';
      case 'DECLINED': return 'FAILED';
      case 'CANCELLED': return 'CANCELLED';
      case 'FAILED': return 'FAILED';
      default: return 'PENDING';
    }
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/tokens');
  }
}
