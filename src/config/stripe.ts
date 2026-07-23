import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export const STRIPE_PLANS = {
  // Will be configured when Stripe account is set up
};
