import Stripe from "stripe";
import { BILLING_PLANS, type BillingPlanKey } from "@/lib/billing/catalog";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}

export const PLANS = BILLING_PLANS;

const configuredPriceIds: Partial<Record<BillingPlanKey, string>> = {
  premium_monthly:
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? process.env.STRIPE_PREMIUM_PRICE_ID,
  premium_annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
  high_priestess_annual: process.env.STRIPE_HIGH_PRIESTESS_PRICE_ID,
};

export function getStripePriceId(planKey: BillingPlanKey): string | null {
  const priceId = configuredPriceIds[planKey];
  return priceId && !priceId.includes("placeholder") ? priceId : null;
}

function inferPlanKeyFromText(text: string): BillingPlanKey | null {
  const normalized = text.toLowerCase();

  if (normalized.includes("high priestess") || normalized.includes("high_priestess")) {
    return "high_priestess_annual";
  }

  if (
    normalized.includes("premium") &&
    (normalized.includes("annual") || normalized.includes("year"))
  ) {
    return "premium_annual";
  }

  if (
    normalized.includes("premium") &&
    (normalized.includes("month") || normalized.includes("monthly"))
  ) {
    return "premium_monthly";
  }

  return null;
}

export function resolvePlanKeyFromStripePrice(
  price: Stripe.Price | Stripe.SubscriptionItem["price"] | null | undefined
): BillingPlanKey | null {
  if (!price) return null;

  const priceId = price.id;

  for (const [planKey, configuredPriceId] of Object.entries(configuredPriceIds) as Array<
    [BillingPlanKey, string | undefined]
  >) {
    if (configuredPriceId && configuredPriceId === priceId) {
      return planKey;
    }
  }

  const inferredFromMetadata = inferPlanKeyFromText(
    [price.nickname, price.lookup_key, price.id].filter(Boolean).join(" ")
  );

  if (inferredFromMetadata) {
    return inferredFromMetadata;
  }

  if (price.recurring?.interval === "year") {
    return "premium_annual";
  }

  if (price.recurring?.interval === "month") {
    return "premium_monthly";
  }

  return null;
}
