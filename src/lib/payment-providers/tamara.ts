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

interface TamaraOrderResponse {
  order_id: string;
  status: string;
  payment_url: string;
  customer_token?: string;
}

interface TamaraOrderStatus {
  order_id: string;
  status: string;
  total_amount: { amount: number; currency: string };
  payments?: Array<{ payment_id: string; status: string; amount: { amount: number } }>;
}

export class TamaraProvider extends PaymentProvider {
  get name() { return 'Tamara'; }
  get slug() { return 'tamara'; }
  protected get sandboxUrl() { return 'https://sandbox.tamara.co/api/v2'; }
  protected get productionUrl() { return 'https://api.tamara.co/api/v2'; }

  protected get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const items = (params.items || [{ name: params.description, quantity: 1, price: params.amount }]);

      const body: Record<string, unknown> = {
        total_amount: { amount: params.amount, currency: params.currency },
        shipping_amount: { amount: 0, currency: params.currency },
        tax_amount: { amount: 0, currency: params.currency },
        order_reference_id: params.orderNumber,
        description: params.description,
        customer: {
          first_name: params.customerName.split(' ')[0] || params.customerName,
          last_name: params.customerName.split(' ').slice(1).join(' ') || '.',
          email: params.customerEmail,
          phone_number: params.customerPhone || '',
        },
        items: items.map((item) => ({
          name: item.name,
          description: item.description || item.name,
          quantity: item.quantity,
          unit_price: { amount: item.price, currency: params.currency },
          total_amount: { amount: item.price * item.quantity, currency: params.currency },
        })),
        country_code: 'SA',
        payment_type: 'PAY_BY_INSTALLMENTS',
        installment_configuration: {
          number_of_installments: 3,
        },
        billing_address: {
          first_name: params.customerName.split(' ')[0] || params.customerName,
          last_name: params.customerName.split(' ').slice(1).join(' ') || '.',
          line1: '',
          country_code: 'SA',
          city: '',
          state: '',
        },
        shipping_address: {
          first_name: params.customerName.split(' ')[0] || params.customerName,
          last_name: params.customerName.split(' ').slice(1).join(' ') || '.',
          line1: '',
          country_code: 'SA',
          city: '',
          state: '',
        },
        callback_url: params.callbackUrl,
        cancel_url: params.callbackUrl,
        metadata: {
          order_id: params.orderId,
          order_number: params.orderNumber,
          ...params.metadata,
        },
      };

      const result = await this.post<TamaraOrderResponse>('/orders', body);

      return {
        success: true,
        transactionId: result.order_id,
        paymentUrl: result.payment_url,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tamara payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.get<TamaraOrderStatus>(`/orders/${transactionId}`);

      const latestPayment = result.payments?.[result.payments.length - 1];

      return {
        success: result.status === 'CREATED' && latestPayment?.status === 'AUTHORIZED',
        status: this.mapStatus(result.status, latestPayment?.status),
        transactionId: result.order_id,
        amount: result.total_amount?.amount,
        currency: result.total_amount?.currency,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Tamara verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {};
      if (params.amount !== undefined) {
        body.refund_amount = { amount: params.amount, currency: 'SAR' };
      }
      if (params.reason) {
        body.reason = params.reason;
      }
      const result = await this.post<{
        order_id: string;
        status: string;
        refund_id?: string;
        refund_amount?: { amount: number; currency: string };
      }>(`/orders/${params.transactionId}/refund`, body);
      return {
        success: true,
        refundId: result.refund_id || result.order_id,
        amount: result.refund_amount?.amount || params.amount,
        status: result.status === 'REFUNDED' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tamara refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    return {
      received: true,
      transactionId: body.order_id as string,
      status: this.mapStatus(body.status as string, body.payment_status as string),
      amount: (body.total_amount as { amount: number })?.amount,
      metadata: body.metadata as Record<string, unknown>,
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    const secret = this.config.webhookSecret;
    if (!secret) return false;

    const signature = payload.headers['x-tamara-signature'];
    if (!signature) return false;

    const rawBody = payload.rawBody || JSON.stringify(payload.body);

    return verifyHmacSha256(secret, rawBody, signature);
  }

  private mapStatus(orderStatus: string, paymentStatus?: string): PaymentVerification['status'] {
    if (paymentStatus === 'AUTHORIZED' || paymentStatus === 'CAPTURED') return 'COMPLETED';
    if (paymentStatus === 'FAILED' || paymentStatus === 'DECLINED') return 'FAILED';
    if (orderStatus === 'CANCELED' || orderStatus === 'CANCELLED') return 'CANCELLED';
    if (orderStatus === 'EXPIRED') return 'CANCELLED';
    return 'PENDING';
  }

  protected async onTestConnection(): Promise<void> {
    await this.get('/merchants/me');
  }
}
