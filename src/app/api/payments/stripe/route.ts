import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/admin-auth';

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  serviceId: string;
  customerEmail: string;
  customerName: string;
  description: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  try {
    const body: PaymentIntentRequest = await request.json();

    const { amount, currency, serviceId, customerEmail, customerName, description } = body;

    if (!amount || !currency || !serviceId || !customerEmail || !customerName) {
      return Response.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        serviceId,
        customerEmail,
        customerName,
        description: description || '',
      },
      receipt_email: customerEmail,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe payment error:', error);
    return Response.json(
      { error: 'حدث خطأ أثناء إنشاء عملية الدفع' },
      { status: 500 },
    );
  }
}
