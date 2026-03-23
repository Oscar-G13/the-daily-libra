import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}

export const PLANS = {
  premium_monthly: {
    paymentLink: "https://buy.stripe.com/5kQ28r0Ep6tB2Ia7Dics800",
    name: "Premium Monthly",
    price: 5,
    interval: "month" as const,
  },
  premium_annual: {
    paymentLink: "https://buy.stripe.com/eVq5kDcn719h0A28Hmcs801",
    name: "Premium Annual",
    price: 40,
    interval: "year" as const,
    savingsNote: "Save 33% — $3.33/mo",
  },
} as const;
