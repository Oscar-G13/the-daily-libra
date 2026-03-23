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
  high_priestess_annual: {
    // Set up in Stripe dashboard: $160/yr product named "High Priestess"
    // Nickname field must contain "high_priestess" for webhook detection
    paymentLink: "https://buy.stripe.com/5kQaEX72N3hp0A2g9Ocs802",
    name: "High Priestess",
    price: 160,
    interval: "year" as const,
    description: "Guide Studio · Up to 3 client profiles",
  },
} as const;
