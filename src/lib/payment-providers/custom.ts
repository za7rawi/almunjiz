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

export class CustomProvider extends PaymentProvider {
  get name() { return 'Custom'; }
  get slug() { return 'custom'; }
  protected get sandboxUrl() { return this.config.apiEndpoint || ''; }
  protected get productionUrl() { return this.config.apiEndpoint || ''; }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const config = (this.config.config || {}) as Record<string, unknown>;
      const customPayload = (config.customPayload || {}) as Record<string, unknown>;
      const body = {
        ...customPayload,
        amount: params.amount,
        currency: params.currency,
        order_id: params.orderId,
        order_number: params.orderNumber,
        description: params.description,
        customer_email: params.customerEmail,
        callback_url: params.callbackUrl,
        webhook_url: params.webhookUrl,
      };

      const result = await this.post<Record<string, unknown>>(String(config.createPath || '/payment/create'), body);

      return {
        success: true,
        transactionId: (result.id || result.transaction_id || result.payment_id) as string,
        paymentUrl: (result.payment_url || result.url || result.redirect_url) as string,
        rawData: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Custom payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const config = (this.config.config || {}) as Record<string, unknown>;
      const result = await this.get<Record<string, unknown>>(
        `${String(config.verifyPath || '/payment/verify')}/${transactionId}`
      );

      return {
        success: result.status === 'success' || result.status === 'completed',
        status: result.status === 'success' ? 'COMPLETED' : 'PENDING',
        transactionId: (result.id || result.transaction_id) as string,
        rawData: result,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Custom verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    void params;
    return {
      success: false,
      error: `Refund not supported by ${this.name}`,
    };
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    return {
      received: true,
      transactionId: (body.transaction_id || body.id) as string,
      status: body.status === 'success' || body.status === 'completed' ? 'COMPLETED' : 'PENDING',
      amount: body.amount as number,
      metadata: body.metadata as Record<string, unknown>,
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    return this.verifyHmacSignature(payload, 'x-custom-signature');
  }

  protected async onTestConnection(): Promise<void> {
    const config = (this.config.config || {}) as Record<string, unknown>;
    if (config.testPath) {
      await this.get(config.testPath as string);
    }
  }
}
