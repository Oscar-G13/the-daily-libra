import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-10-28.acacia",
    });
  }
  return stripeClient;
}

export const PLANS = {
  premium_monthly: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    name: "Premium Monthly",
    price: 12,
    interval: "month" as const,
  },
  premium_annual: {
    priceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!,
    name: "Premium Annual",
    price: 96,
    interval: "year" as const,
    savingsNote: "Save 33% vs monthly",
  },
} as const;
