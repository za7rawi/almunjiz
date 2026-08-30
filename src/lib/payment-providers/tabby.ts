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

interface TabbyPaymentResponse {
  id: string;
  status: string;
  redirect_url: string;
  available_products?: {
    installments?: { enabled: boolean };
    tabby_card?: { enabled: boolean };
  };
}

interface TabbyPaymentStatus {
  id: string;
  status: string;
  amount: { amount: string; currency: string };
  description?: string;
}

export class TabbyProvider extends PaymentProvider {
  get name() { return 'Tabby'; }
  get slug() { return 'tabby'; }
  protected get sandboxUrl() { return 'https://api.tabby.dev/api/v1'; }
  protected get productionUrl() { return 'https://api.tabby.ai/api/v1'; }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
      'X-Tabby-Merchant-Key': this.config.secretKey,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const items = params.items || [{ name: params.description, quantity: 1, price: params.amount }];

      const body: Record<string, unknown> = {
        amount: String(params.amount),
        currency: params.currency,
        description: params.description,
        buyer: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone || '',
        },
        buyer_history: {
          registered_since: new Date().toISOString(),
          registered: false,
        },
        order: {
          id: params.orderNumber,
          amount: String(params.amount),
          tax_amount: '0',
          shipping_amount: '0',
          discount_amount: '0',
          items: items.map((item) => ({
            id: item.name.replace(/\s+/g, '-').toLowerCase(),
            title: item.name,
            description: item.description || item.name,
            quantity: item.quantity,
            unit_price: String(item.price),
            category: 'service',
          })),
        },
        merchant_url: params.callbackUrl,
        success_url: params.callbackUrl,
        cancel_url: params.callbackUrl,
        failure_url: params.callbackUrl,
        webhook_url: params.webhookUrl,
      };

      const result = await this.post<TabbyPaymentResponse>('/payments', body);

      return {
        success: true,
        transactionId: result.id,
        paymentUrl: result.redirect_url,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tabby payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<TabbyPaymentStatus>(`/payments/${transactionId}`);

      return {
        success: result.status === 'AUTHORIZED' || result.status === 'CAPTURED',
        status: this.mapStatus(result.status),
        transactionId: result.id,
        amount: parseFloat(result.amount?.amount || '0'),
        currency: result.amount?.currency,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Tabby verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {};
      if (params.amount !== undefined) {
        body.amount = String(params.amount);
      }
      if (params.reason) {
        body.reason = params.reason;
      }
      const result = await this.post<{
        id: string;
        status: string;
        amount?: { amount: string; currency: string };
      }>(`/payments/${params.transactionId}/refund`, body);
      return {
        success: true,
        refundId: result.id,
        amount: result.amount ? parseFloat(result.amount.amount) : params.amount,
        status: result.status === 'REFUNDED' || result.status === 'CAPTURED' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tabby refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    return {
      received: true,
      transactionId: body.id as string,
      status: this.mapStatus(body.status as string),
      amount: parseFloat((body.amount as string) || '0'),
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    const secret = this.config.webhookSecret;
    if (!secret) return false;

    const signature = payload.headers['x-tabby-signature'];
    if (!signature) return false;

    const rawBody = payload.rawBody || JSON.stringify(payload.body);

    return verifyHmacSha256(secret, rawBody, signature);
  }

  private mapStatus(status: string): PaymentVerification['status'] {
    switch (status?.toUpperCase()) {
      case 'AUTHORIZED': return 'COMPLETED';
      case 'CAPTURED': return 'COMPLETED';
      case 'DECLINED': return 'FAILED';
      case 'EXPIRED': return 'CANCELLED';
      case 'CANCELED': return 'CANCELLED';
      default: return 'PENDING';
    }
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/merchants/me');
  }
}
