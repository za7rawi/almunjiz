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

interface StripePaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  client_secret: string;
  metadata?: Record<string, string>;
  payment_method_types?: string[];
}

interface StripeCharge {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export class StripeProvider extends PaymentProvider {
  get name() { return 'Stripe'; }
  get slug() { return 'stripe'; }
  protected get sandboxUrl() { return 'https://api.stripe.com/v1'; }
  protected get productionUrl() { return 'https://api.stripe.com/v1'; }

  protected get headers() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  protected async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const formBody = this.flattenForStripe(body);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: formBody,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }
    return data as T;
  }

  private flattenForStripe(obj: Record<string, unknown>, prefix = ''): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (value === undefined || value === null) continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        parts.push(this.flattenForStripe(value as Record<string, unknown>, fullKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === 'object') {
            parts.push(this.flattenForStripe(item as Record<string, unknown>, `${fullKey}[${i}]`));
          } else {
            parts.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(String(item))}`);
          }
        });
      } else {
        parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
      }
    }
    return parts.filter(Boolean).join('&');
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const body: Record<string, unknown> = {
        amount: Math.round(params.amount * 100),
        currency: params.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
          ...params.metadata,
        },
        description: params.description,
        receipt_email: params.customerEmail,
      };

      const result = await this.post<StripePaymentIntent>('/payment_intents', body);

      return {
        success: true,
        transactionId: result.id,
        clientSecret: result.client_secret,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<StripeCharge>(`/payment_intents/${transactionId}`);
      return {
        success: result.status === 'succeeded',
        status: this.mapStatus(result.status),
        transactionId: result.id,
        amount: result.amount / 100,
        currency: result.currency?.toUpperCase(),
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Stripe verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {
        payment_intent: params.transactionId,
      };
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
      }>(`/refunds`, body);
      return {
        success: true,
        refundId: result.id,
        amount: result.amount / 100,
        status: result.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    const type = body.type as string;
    const data = body.data as Record<string, unknown>;
    const obj = data?.object as Record<string, unknown>;

    let status: WebhookResult['status'] = 'PENDING';
    if (type === 'payment_intent.succeeded') status = 'COMPLETED';
    else if (type === 'payment_intent.payment_failed') status = 'FAILED';
    else if (type === 'payment_intent.canceled') status = 'CANCELLED';

    return {
      received: true,
      transactionId: obj?.id as string,
      status,
      amount: ((obj?.amount as number) || 0) / 100,
      metadata: obj?.metadata as Record<string, unknown>,
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    const secret = this.config.webhookSecret;
    if (!secret) return true;

    const signatureHeader = payload.headers['stripe-signature'];
    if (!signatureHeader) return false;

    const parts = signatureHeader.split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const signaturePart = parts.find((p) => p.startsWith('v1='));
    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.slice(2);
    const signature = signaturePart.slice(3);

    const now = Math.floor(Date.now() / 1000);
    const age = now - parseInt(timestamp, 10);
    if (age > 300 || age < -300) return false;

    const rawBody = payload.rawBody || JSON.stringify(payload.body);
    const payloadToVerify = `${timestamp}.${rawBody}`;
    const expected = computeHmacSha256(secret, payloadToVerify);

    return expected === signature;
  }

  private mapStatus(status: string): PaymentVerification['status'] {
    switch (status?.toLowerCase()) {
      case 'succeeded': return 'COMPLETED';
      case 'requires_payment_method': return 'PENDING';
      case 'requires_confirmation': return 'PENDING';
      case 'requires_action': return 'PENDING';
      case 'processing': return 'PENDING';
      case 'canceled': return 'CANCELLED';
      case 'requires_capture': return 'COMPLETED';
      default: return 'PENDING';
    }
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/balance');
  }
}
