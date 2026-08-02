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

interface MyFatoorahResponse {
  IsSuccess: boolean;
  Message: string;
  Data: {
    InvoiceId: number;
    PaymentURL: string;
    InvoiceStatus?: string;
    CustomerInvoiceId?: string;
  };
}

interface MyFatoorahStatusResponse {
  IsSuccess: boolean;
  Message: string;
  Data: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceValue: number;
    CustomerName: string;
    UserDefinedField?: string;
  };
}

export class MyFatoorahProvider extends PaymentProvider {
  get name() { return 'MyFatoorah'; }
  get slug() { return 'myfatoorah'; }
  protected get sandboxUrl() { return 'https://apitest.myfatoorah.com/v2'; }
  protected get productionUrl() { return 'https://api.myfatoorah.com/v2'; }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const body: Record<string, unknown> = {
        InvoiceValue: params.amount,
        CustomerName: params.customerName,
        CustomerEmail: params.customerEmail,
        CustomerMobile: params.customerPhone?.replace('+', '') || '',
        Language: 'AR',
        DisplayCurrencyIso: params.currency,
        CallbackUrl: params.callbackUrl,
        NotificationOption: 'EMAIL',
        UserDefinedField: JSON.stringify({
          order_id: params.orderId,
          order_number: params.orderNumber,
          ...params.metadata,
        }),
      };

      const result = await this.post<MyFatoorahResponse>('/SendPayment', body);

      if (!result.IsSuccess) {
        throw new Error(result.Message);
      }

      return {
        success: true,
        transactionId: String(result.Data.InvoiceId),
        paymentUrl: result.Data.PaymentURL,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MyFatoorah payment creation failed',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    try {
      const result = await this.post<MyFatoorahStatusResponse>('/GetPaymentStatus', {
        Key: Number(transactionId),
        KeyType: 'InvoiceId',
      });

      if (!result.IsSuccess) {
        throw new Error(result.Message);
      }

      return {
        success: result.Data.InvoiceStatus === 'Paid',
        status: this.mapStatus(result.Data.InvoiceStatus),
        transactionId: String(result.Data.InvoiceId),
        amount: result.Data.InvoiceValue,
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'MyFatoorah verification failed',
      };
    }
  }

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    try {
      const body: Record<string, unknown> = {
        InvoiceId: Number(params.transactionId),
      };
      if (params.amount !== undefined) {
        body.RefundAmount = params.amount;
      }
      if (params.reason) {
        body.Reason = params.reason;
      }
      const result = await this.post<{
        IsSuccess: boolean;
        Message: string;
        Data?: { RefundId?: number; RefundStatus?: string; RefundAmount?: number };
      }>('/RefundInvoice', body);
      if (!result.IsSuccess) {
        throw new Error(result.Message);
      }
      return {
        success: true,
        refundId: result.Data?.RefundId ? String(result.Data.RefundId) : undefined,
        amount: result.Data?.RefundAmount || params.amount,
        status: result.Data?.RefundStatus === 'Refunded' ? 'COMPLETED' : 'PENDING',
        rawData: result as unknown as Record<string, unknown>,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MyFatoorah refund failed',
      };
    }
  }

  parseWebhook(payload: WebhookPayload): WebhookResult {
    const body = payload.body as Record<string, unknown>;
    const paymentResult = body.PaymentResult as Record<string, unknown> | undefined;
    const invoiceId = paymentResult?.InvoiceId as number || body.InvoiceId as number;
    const status = paymentResult?.InvoiceStatus as string || body.InvoiceStatus as string;

    return {
      received: true,
      transactionId: String(invoiceId),
      status: this.mapStatus(status),
      amount: paymentResult?.InvoiceValue as number || body.InvoiceValue as number,
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    return this.verifyHmacSignature(payload, 'x-myfatoorah-signature');
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
    await this.post('/GetPaymentStatus', { Key: 1, KeyType: 'InvoiceId' });
  }
}
