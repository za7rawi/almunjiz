import type {
  GatewayConfig,
  CreatePaymentParams,
  PaymentResult,
  PaymentVerification,
  WebhookPayload,
  WebhookResult,
  RefundParams,
  RefundResult,
} from './types';

export abstract class PaymentProvider {
  protected config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  abstract get name(): string;
  abstract get slug(): string;

  protected get baseUrl(): string {
    if (this.config.apiEndpoint) return this.config.apiEndpoint;
    return this.config.environment === 'PRODUCTION'
      ? this.productionUrl
      : this.sandboxUrl;
  }

  protected abstract get sandboxUrl(): string;
  protected abstract get productionUrl(): string;

  protected get headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.secretKey}`,
    };
  }

  protected async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || data?.error?.message || `HTTP ${response.status}`);
    }
    return data as T;
  }

  protected async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, { method: 'GET', headers: this.headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || data?.error?.message || `HTTP ${response.status}`);
    }
    return data as T;
  }

  protected async del<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || data?.error?.message || `HTTP ${response.status}`);
    }
    return data as T;
  }

  abstract createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  abstract verifyPayment(transactionId: string): Promise<PaymentVerification>;
  abstract parseWebhook(payload: WebhookPayload): WebhookResult;

  async refundPayment(params: RefundParams): Promise<RefundResult> {
    void params;
    return {
      success: false,
      error: `Refund not supported by ${this.name}`,
    };
  }

  async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    void payload;
    return false;
  }

  protected async verifyHmacSignature(
    payload: WebhookPayload,
    signatureHeader: string,
    rawBodyKey = 'rawBody'
  ): Promise<boolean> {
    const secret = this.config.webhookSecret;
    if (!secret) return false;

    const signature = payload.headers[signatureHeader.toLowerCase()];
    if (!signature) return false;

    const rawBody = payload[rawBodyKey as keyof WebhookPayload]
      ? String(payload[rawBodyKey as keyof WebhookPayload])
      : JSON.stringify(payload.body);

    const { computeHmacSha256 } = await import('@/lib/encryption');
    return computeHmacSha256(secret, rawBody) === signature;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.onTestConnection();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  protected async onTestConnection(): Promise<void> {
    throw new Error('testConnection not implemented');
  }
}
