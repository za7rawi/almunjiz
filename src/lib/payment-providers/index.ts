export type {
  GatewayProviderSlug,
  PaymentEnvironment,
  GatewayConfig,
  CreatePaymentParams,
  PaymentItem,
  PaymentResult,
  PaymentVerification,
  WebhookPayload,
  WebhookResult,
  RefundParams,
  RefundResult,
} from './types';

export { PaymentProvider } from './base';
export { TapProvider } from './tap';
export { MoyasarProvider } from './moyasar';
export { StripeProvider } from './stripe';
export { MyFatoorahProvider } from './myfatoorah';
export { PayTabsProvider } from './paytabs';
export { HyperPayProvider } from './hyperpay';
export { EdfaPayProvider } from './edfapay';
export { TamaraProvider } from './tamara';
export { TabbyProvider } from './tabby';
export { CustomProvider } from './custom';

import type { GatewayConfig, GatewayProviderSlug } from './types';
import { PaymentProvider } from './base';
import { TapProvider } from './tap';
import { MoyasarProvider } from './moyasar';
import { StripeProvider } from './stripe';
import { MyFatoorahProvider } from './myfatoorah';
import { PayTabsProvider } from './paytabs';
import { HyperPayProvider } from './hyperpay';
import { EdfaPayProvider } from './edfapay';
import { TamaraProvider } from './tamara';
import { TabbyProvider } from './tabby';
import { CustomProvider } from './custom';

const providerMap: Record<GatewayProviderSlug, new (config: GatewayConfig) => PaymentProvider> = {
  tap: TapProvider,
  moyasar: MoyasarProvider,
  stripe: StripeProvider,
  myfatoorah: MyFatoorahProvider,
  paytabs: PayTabsProvider,
  hyperpay: HyperPayProvider,
  edfapay: EdfaPayProvider,
  tamara: TamaraProvider,
  tabby: TabbyProvider,
  custom: CustomProvider,
};

export function createPaymentProvider(config: GatewayConfig): PaymentProvider {
  const Provider = providerMap[config.slug as GatewayProviderSlug];
  if (!Provider) {
    throw new Error(`Unknown payment provider: ${config.slug}`);
  }
  return new Provider(config);
}

export function getProviderDisplayName(slug: string): string {
  const names: Record<string, string> = {
    tap: 'Tap Payments',
    moyasar: 'Moyasar',
    stripe: 'Stripe',
    myfatoorah: 'MyFatoorah',
    paytabs: 'PayTabs',
    hyperpay: 'HyperPay',
    edfapay: 'EdfaPay',
    tamara: 'Tamara',
    tabby: 'Tabby',
    custom: 'Custom',
  };
  return names[slug] || slug;
}

export function getProviderLogo(slug: string): string {
  const logos: Record<string, string> = {
    tap: '/payment-logos/tap.svg',
    moyasar: '/payment-logos/moyasar.svg',
    stripe: '/payment-logos/stripe.svg',
    myfatoorah: '/payment-logos/myfatoorah.svg',
    paytabs: '/payment-logos/paytabs.svg',
    hyperpay: '/payment-logos/hyperpay.svg',
    edfapay: '/payment-logos/edfapay.svg',
    tamara: '/payment-logos/tamara.svg',
    tabby: '/payment-logos/tabby.svg',
    custom: '/payment-logos/custom.svg',
  };
  return logos[slug] || '/payment-logos/default.svg';
}

export const BNPL_PROVIDERS = ['tamara', 'tabby'];
export const CARD_PROVIDERS = ['tap', 'moyasar', 'stripe', 'myfatoorah', 'paytabs', 'hyperpay', 'edfapay'];

export interface PaymentMethodDisplay {
  id: string;
  name: string;
  slug: string;
  type: 'card' | 'bnpl' | 'wallet' | 'custom';
  supportedMethods: string[];
  isDefault: boolean;
  supportsApplePay: boolean;
  supportsGooglePay: boolean;
  supportsInstallments: boolean;
  logo?: string;
}

export function getAvailablePaymentMethods(gateways: Array<{
  id: string;
  name?: string;
  displayName?: string;
  displayNameEn?: string;
  slug: string;
  isActive: boolean;
  isDefault: boolean;
  supportsApplePay?: boolean;
  supportsGooglePay?: boolean;
  supportsInstallments?: boolean;
  logo?: string;
}>): PaymentMethodDisplay[] {
  return gateways
    .filter((g) => g.isActive)
    .sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0))
    .map((g) => ({
      id: g.id,
      name: g.displayName || g.displayNameEn || g.name || g.slug,
      slug: g.slug,
      type: (BNPL_PROVIDERS.includes(g.slug) ? 'bnpl' : 'card') as PaymentMethodDisplay['type'],
      supportedMethods: getSupportedMethods(g.slug),
      isDefault: g.isDefault,
      supportsApplePay: g.supportsApplePay || false,
      supportsGooglePay: g.supportsGooglePay || false,
      supportsInstallments: g.supportsInstallments || false,
      logo: g.logo,
    }));
}

function getSupportedMethods(slug: string): string[] {
  const methods: Record<string, string[]> = {
    tap: ['Visa', 'Mastercard', 'Mada', 'Apple Pay'],
    moyasar: ['Visa', 'Mastercard', 'Mada'],
    stripe: ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay'],
    myfatoorah: ['Visa', 'Mastercard', 'Mada', 'KNET'],
    paytabs: ['Visa', 'Mastercard', 'Mada'],
    hyperpay: ['Visa', 'Mastercard', 'Mada'],
    edfapay: ['Visa', 'Mastercard', 'Mada'],
    tamara: ['تقسيط - Tamara'],
    tabby: ['تقسيط - Tabby'],
    custom: ['Custom'],
  };
  return methods[slug] || ['Card'];
}
