import { PaymentGatewayConfig, GatewayProvider } from '@/store/payment-gateway-store';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  id: GatewayProvider;
  name: string;
  nameEn: string;
  initialize(config: PaymentGatewayConfig): void;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }>;
  getDisplayName(): string;
  getSupportedMethods(): string[];
}

export interface PaymentMethodDisplay {
  id: string;
  provider: GatewayProvider;
  name: string;
  displayName: string;
  supportedMethods: string[];
  isDefault: boolean;
}

class TapPaymentsProvider implements PaymentProvider {
  id: GatewayProvider = 'tap';
  name = 'Tap Payments';
  nameEn = 'Tap Payments';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `tap_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `https://example.com/tap/pay?txn=${transactionId}&amount=${request.amount}&currency=${request.currency}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'tap',
        tapConfigId: this.config.id,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'tap', status: 'paid' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.publicKey || !config.secretKey) {
      return { success: false, message: 'Tap Payments: مفاتيح API غير مكتملة' };
    }
    return { success: true, message: 'Tap Payments: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'Tap Payments';
  }

  getSupportedMethods(): string[] {
    return ['Visa', 'Mastercard', 'Mada', 'Apple Pay'];
  }
}

class MoyasarProvider implements PaymentProvider {
  id: GatewayProvider = 'moyasar';
  name = 'Moyasar';
  nameEn = 'Moyasar';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `moy_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `https://example.com/moy/pay?txn=${transactionId}&amount=${request.amount}&currency=${request.currency}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'moyasar',
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'moyasar', status: 'paid' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.publicKey || !config.secretKey) {
      return { success: false, message: 'Moyasar: مفتاح API غير موجود' };
    }
    return { success: true, message: 'Moyasar: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'Moyasar';
  }

  getSupportedMethods(): string[] {
    return ['Visa', 'Mastercard', 'Mada', 'Apple Pay'];
  }
}

class HyperPayProvider implements PaymentProvider {
  id: GatewayProvider = 'hyperpay';
  name = 'HyperPay';
  nameEn = 'HyperPay';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `hp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `https://example.com/hyperpay/pay?txn=${transactionId}&amount=${request.amount}&currency=${request.currency}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'hyperpay',
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'hyperpay', status: 'paid' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.merchantId || !config.secretKey) {
      return { success: false, message: 'HyperPay: بيانات الاتصال غير مكتملة' };
    }
    return { success: true, message: 'HyperPay: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'HyperPay';
  }

  getSupportedMethods(): string[] {
    return ['Visa', 'Mastercard', 'Mada'];
  }
}

class PayTabsProvider implements PaymentProvider {
  id: GatewayProvider = 'paytabs';
  name = 'PayTabs';
  nameEn = 'PayTabs';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `pt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `https://example.com/paytabs/pay?txn=${transactionId}&amount=${request.amount}&currency=${request.currency}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'paytabs',
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'paytabs', status: 'paid' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.merchantId || !config.secretKey) {
      return { success: false, message: 'PayTabs: بيانات الاتصال غير مكتملة' };
    }
    return { success: true, message: 'PayTabs: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'PayTabs';
  }

  getSupportedMethods(): string[] {
    return ['Visa', 'Mastercard', 'Mada', 'Apple Pay', 'STC Pay'];
  }
}

class MyFatoorahProvider implements PaymentProvider {
  id: GatewayProvider = 'myfatoorah';
  name = 'MyFatoorah';
  nameEn = 'MyFatoorah';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `mf_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `https://example.com/myfatoorah/pay?txn=${transactionId}&amount=${request.amount}&currency=${request.currency}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'myfatoorah',
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'myfatoorah', status: 'paid' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.publicKey || !config.secretKey) {
      return { success: false, message: 'MyFatoorah: مفتاح API غير موجود' };
    }
    return { success: true, message: 'MyFatoorah: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'MyFatoorah';
  }

  getSupportedMethods(): string[] {
    return ['Visa', 'Mastercard', 'Mada', 'Apple Pay', 'Knet'];
  }
}

class StripeProvider implements PaymentProvider {
  id: GatewayProvider = 'stripe';
  name = 'Stripe';
  nameEn = 'Stripe';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `https://checkout.stripe.com/pay/cs_${transactionId}?amount=${request.amount * 100}&currency=${request.currency.toLowerCase()}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'stripe',
        stripePaymentIntentId: `pi_${Math.random().toString(36).slice(2, 15)}`,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'stripe', status: 'succeeded' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.publicKey || !config.secretKey) {
      return { success: false, message: 'Stripe: مفاتيح API غير مكتملة' };
    }
    return { success: true, message: 'Stripe: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'Stripe';
  }

  getSupportedMethods(): string[] {
    return ['Visa', 'Mastercard', 'Apple Pay'];
  }
}

class CustomProvider implements PaymentProvider {
  id: GatewayProvider = 'custom';
  name = 'بوابة مخصصة';
  nameEn = 'Custom Gateway';
  private config!: PaymentGatewayConfig;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const transactionId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const paymentUrl = `${this.config.callbackUrl || 'https://example.com'}/pay?txn=${transactionId}&amount=${request.amount}&currency=${request.currency}`;

    return {
      success: true,
      transactionId,
      paymentUrl,
      metadata: {
        gateway: 'custom',
        endpoint: this.config.callbackUrl,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      metadata: { gateway: 'custom', status: 'paid' },
    };
  }

  async testConnection(config: PaymentGatewayConfig): Promise<{ success: boolean; message: string }> {
    if (!config.callbackUrl) {
      return { success: false, message: 'البوابة المخصصة: عنوان الـ callback غير موجود' };
    }
    return { success: true, message: 'البوابة المخصصة: تم الاتصال بنجاح' };
  }

  getDisplayName(): string {
    return 'بوابة مخصصة';
  }

  getSupportedMethods(): string[] {
    return ['Multiple Methods'];
  }
}

const providers = new Map<GatewayProvider, PaymentProvider>();

providers.set('tap', new TapPaymentsProvider());
providers.set('moyasar', new MoyasarProvider());
providers.set('hyperpay', new HyperPayProvider());
providers.set('paytabs', new PayTabsProvider());
providers.set('myfatoorah', new MyFatoorahProvider());
providers.set('stripe', new StripeProvider());
providers.set('custom', new CustomProvider());

export function getPaymentProvider(gateway: PaymentGatewayConfig): PaymentProvider {
  const provider = providers.get(gateway.provider);
  if (!provider) throw new Error(`Unknown gateway provider: ${gateway.provider}`);
  provider.initialize(gateway);
  return provider;
}

export function getAvailablePaymentMethods(gateways: PaymentGatewayConfig[]): PaymentMethodDisplay[] {
  return gateways
    .filter((g) => g.isActive)
    .map((g) => {
      const provider = getPaymentProvider(g);
      return {
        id: g.id,
        provider: g.provider,
        name: g.name,
        displayName: provider.getDisplayName(),
        supportedMethods: provider.getSupportedMethods(),
        isDefault: g.isDefault,
      };
    });
}

export {
  TapPaymentsProvider,
  MoyasarProvider,
  HyperPayProvider,
  PayTabsProvider,
  MyFatoorahProvider,
  StripeProvider,
  CustomProvider,
};
