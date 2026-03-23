export type SubscriptionTier = "free" | "premium" | "high_priestess";

export type BillingPlanKey = "premium_monthly" | "premium_annual" | "high_priestess_annual";

export interface BillingPlan {
  key: BillingPlanKey;
  label: string;
  shortLabel: string;
  tier: Exclude<SubscriptionTier, "free">;
  interval: "month" | "year";
  price: number;
  displayPrice: string;
  renewalLabel: string;
  trialDays: number;
  paymentLink: string;
  badge?: string;
  tagline?: string;
  monthlyEquivalent?: string;
  features: string[];
}

export const FREE_PLAN = {
  label: "Free",
  displayPrice: "$0",
  renewalLabel: "forever",
  features: [
    "One daily reading",
    "Basic chart summary",
    "Libra archetype result",
    "Limited AI companion (5 messages/day)",
    "3 journal entries/month",
    "1 compatibility check/week",
  ],
} as const;

export const BILLING_PLANS: Record<BillingPlanKey, BillingPlan> = {
  premium_monthly: {
    key: "premium_monthly",
    label: "The Daily Libra Premium",
    shortLabel: "Premium Monthly",
    tier: "premium",
    interval: "month",
    price: 5,
    displayPrice: "$5",
    renewalLabel: "/ month",
    trialDays: 3,
    paymentLink: "https://buy.stripe.com/5kQ28r0Ep6tB2Ia7Dics800",
    badge: "Most Flexible",
    tagline: "Start with the full Premium experience for a low monthly price.",
    features: [
      "Unlimited AI readings across all categories",
      "All reading tones, including blunt, poetic, practical, and seductive",
      "Unlimited AI companion sessions",
      "Unlimited compatibility readings",
      "Decision Decoder and Aesthetic Profile",
    ],
  },
  premium_annual: {
    key: "premium_annual",
    label: "The Daily Libra Premium Yearly",
    shortLabel: "Premium Yearly",
    tier: "premium",
    interval: "year",
    price: 40,
    displayPrice: "$40",
    renewalLabel: "/ year",
    trialDays: 3,
    paymentLink: "https://buy.stripe.com/eVq5kDcn719h0A28Hmcs801",
    badge: "Best Value",
    tagline: "Lock in the full Premium suite for the year at the lowest rate.",
    monthlyEquivalent: "$3.33/mo effective",
    features: [
      "Everything in Premium Monthly",
      "Lower yearly effective cost",
      "Unlimited journal + AI trend analysis",
      "Unlimited save-and-return access to your Premium tools",
      "Best option if you use the app daily",
    ],
  },
  high_priestess_annual: {
    key: "high_priestess_annual",
    label: "High Priestess Tier",
    shortLabel: "High Priestess",
    tier: "high_priestess",
    interval: "year",
    price: 160,
    displayPrice: "$160",
    renewalLabel: "/ year",
    trialDays: 3,
    paymentLink: "https://buy.stripe.com/5kQaEX72N3hp0A2g9Ocs802",
    badge: "Guide Studio",
    tagline: "Everything in Premium, plus the client-facing Guide Studio tools.",
    monthlyEquivalent: "$13.33/mo effective",
    features: [
      "Everything in Premium",
      "Guide Studio for up to 3 client profiles",
      "Custom readings sent directly to clients",
      "Client inbox, tracking, and private notes",
      "High Priestess badge and Guide access across the app",
    ],
  },
};

export const BILLING_PLAN_ORDER: BillingPlanKey[] = [
  "premium_monthly",
  "premium_annual",
  "high_priestess_annual",
];

export function getBillingPlan(planKey: string | null | undefined): BillingPlan | null {
  if (!planKey) return null;
  return BILLING_PLANS[planKey as BillingPlanKey] ?? null;
}

export function tierRank(tier: SubscriptionTier | null | undefined): number {
  switch (tier) {
    case "high_priestess":
      return 2;
    case "premium":
      return 1;
    default:
      return 0;
  }
}

export function deriveTierFromPlanKeys(
  planKeys: Array<string | null | undefined>,
  fallback: SubscriptionTier = "free"
): SubscriptionTier {
  let highestTier = fallback;

  for (const planKey of planKeys) {
    const plan = getBillingPlan(planKey);
    if (plan && tierRank(plan.tier) > tierRank(highestTier)) {
      highestTier = plan.tier;
    }
  }

  return highestTier;
}

export function hasActiveBillingStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
