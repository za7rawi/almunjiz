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

interface PayTabsResponse {
  tran_ref: string;
  tran_type: string;
  payment_url: string;
  cart_id: string;
  redirect_url?: string;
}

interface PayTabsVerifyResponse {
  tran_ref: string;
  tran_status: string;
  tran_total: string;
  cart_id: string;
}

export class PayTabsProvider extends PaymentProvider {
  get name() { return 'PayTabs'; }
  get slug() { return 'paytabs'; }
  protected get sandboxUrl() { return 'https://secure.paytabs.com'; }
  protected get productionUrl() { return 'https://secure.paytabs.com'; }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `${this.config.secretKey}`,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const config = (this.config.config || {}) as Record<string, unknown>;
      const profileId = config.profileId || '';

      const body: Record<string, unknown> = {
        profile_id: profileId,
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: params.orderNumber,
        cart_description: params.description,
        cart_amount: params.amount,
        cart_currency: params.currency,
        callback: params.callbackUrl,
        return: params.callbackUrl,
        customer_details: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone || '',
          street1: '',
          city: '',
          state: '',
          country: 'SA',
          zip: '',
        },
        shipping_details: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone || '',
          street1: '',
          city: '',
          state: '',
          country: 'SA',
          zip: '',
        },
      };

      const result = await this.post<PayTabsResponse>('/payment/request', body);

      return {
        success: true,
        transactionId: result.tran_ref,
        paymentUrl: result.payment_url || result.redirect_url,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayTabs payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.post<PayTabsVerifyResponse>('/payment/query', {
        tran_ref: transactionId,
      });

      return {
        success: result.tran_status === 'A' || result.tran_status === 'CAPTURED',
        status: this.mapStatus(result.tran_status),
        transactionId: result.tran_ref,
        amount: parseFloat(result.tran_total),
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'PayTabs verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {
        tran_ref: params.transactionId,
      };
      if (params.amount !== undefined) {
        body.amount = params.amount;
      }
      if (params.reason) {
        body.reason = params.reason;
      }
      const result = await this.post<{
        tran_ref: string;
        tran_status: string;
        response_status: string;
        cart_total?: number;
      }>('/payment/refund', body);
      return {
        success: result.response_status === 'A' || result.response_status === 'R',
        refundId: result.tran_ref,
        amount: result.cart_total || params.amount,
        status: result.response_status === 'R' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayTabs refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    return {
      received: true,
      transactionId: body.tran_ref as string,
      status: this.mapStatus(body.tran_status as string),
      amount: parseFloat(body.tran_total as string || '0'),
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    return this.verifyHmacSignature(payload, 'x-paytabs-signature');
  }

  private mapStatus(status: string): PaymentVerification['status'] {
    switch (status?.toUpperCase()) {
      case 'A': return 'COMPLETED';
      case 'CAPTURED': return 'COMPLETED';
      case 'DECLINED': return 'FAILED';
      case 'CANCELED': return 'CANCELLED';
      case 'C': return 'CANCELLED';
      default: return 'PENDING';
    }
  }

  protected async onTestConnection(): Promise<void> {
    await this.post('/payment/query', { tran_ref: 'test' });
  }
}
