import {
  deriveTierFromPlanKeys,
  getBillingPlan,
  hasActiveBillingStatus,
  tierRank,
  type BillingPlanKey,
  type SubscriptionTier,
} from "@/lib/billing/catalog";
import type { Tables } from "@/types/database.types";

type SubscriptionRow = Pick<
  Tables<"subscriptions">,
  | "id"
  | "access_started_at"
  | "cancel_at_period_end"
  | "current_period_end"
  | "current_period_start"
  | "plan_key"
  | "plan_name"
  | "status"
  | "stripe_customer_id"
  | "stripe_subscription_id"
>;

export interface BillingProductSummary {
  id: string;
  planKey: BillingPlanKey | null;
  planLabel: string;
  status: string;
  tier: SubscriptionTier;
  accessStartedAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  daysRemaining: number | null;
  progressPercent: number | null;
  cancelAtPeriodEnd: boolean;
  isPrimary: boolean;
  stateCopy: string;
  renewalDateCopy: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface BillingSummary {
  highestTier: SubscriptionTier;
  proMemberSince: string | null;
  hasCustomer: boolean;
  customerId: string | null;
  products: BillingProductSummary[];
}

function toDayCount(dateString: string | null): number | null {
  if (!dateString) return null;

  const end = new Date(dateString).getTime();
  if (Number.isNaN(end)) return null;

  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function toProgressPercent(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const nowMs = Date.now();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return null;

  const percent = ((nowMs - startMs) / (endMs - startMs)) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatRemainingLabel(daysRemaining: number | null): string {
  if (daysRemaining === null) return "soon";
  if (daysRemaining <= 0) return "today";
  if (daysRemaining === 1) return "1 day";
  return `${daysRemaining} days`;
}

function buildStateCopy(
  status: string,
  cancelAtPeriodEnd: boolean,
  daysRemaining: number | null
): string {
  const remainingLabel = formatRemainingLabel(daysRemaining);

  if (status === "trialing") {
    return `Trial ends in ${remainingLabel}`;
  }

  if (cancelAtPeriodEnd) {
    return `Ends in ${remainingLabel}`;
  }

  return `Renews in ${remainingLabel}`;
}

export function buildBillingSummary({
  subscriptions,
  subscriptionTier,
  proMemberSince,
}: {
  subscriptions: SubscriptionRow[] | null | undefined;
  subscriptionTier: SubscriptionTier;
  proMemberSince: string | null;
}): BillingSummary {
  const activeProducts = (subscriptions ?? [])
    .filter((subscription) => hasActiveBillingStatus(subscription.status))
    .map((subscription) => {
      const plan = getBillingPlan(subscription.plan_key ?? subscription.plan_name);
      const planTier = plan?.tier ?? subscriptionTier;
      const daysRemaining = toDayCount(subscription.current_period_end);

      return {
        id: subscription.id,
        planKey: (plan?.key ?? null) as BillingPlanKey | null,
        planLabel: plan?.shortLabel ?? subscription.plan_name?.replace(/_/g, " ") ?? "Paid plan",
        status: subscription.status,
        tier: planTier,
        accessStartedAt: subscription.access_started_at,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        daysRemaining,
        progressPercent: toProgressPercent(
          subscription.current_period_start,
          subscription.current_period_end
        ),
        cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
        isPrimary: false,
        stateCopy: buildStateCopy(
          subscription.status,
          subscription.cancel_at_period_end ?? false,
          daysRemaining
        ),
        renewalDateCopy: formatDate(subscription.current_period_end),
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
      };
    })
    .sort((a, b) => {
      const tierDelta = tierRank(b.tier) - tierRank(a.tier);
      if (tierDelta !== 0) return tierDelta;

      const endA = a.currentPeriodEnd ? new Date(a.currentPeriodEnd).getTime() : 0;
      const endB = b.currentPeriodEnd ? new Date(b.currentPeriodEnd).getTime() : 0;
      return endA - endB;
    });

  if (activeProducts[0]) {
    activeProducts[0].isPrimary = true;
  }

  const derivedTier = activeProducts.length
    ? deriveTierFromPlanKeys(
        activeProducts.map((product) => product.planKey),
        subscriptionTier
      )
    : subscriptionTier;

  const derivedProMemberSince =
    proMemberSince ??
    activeProducts
      .map((subscription) => subscription.accessStartedAt ?? subscription.currentPeriodStart)
      .filter((value): value is string => Boolean(value))
      .sort()[0] ??
    null;

  const customerId =
    activeProducts.find((product) => product.stripeCustomerId)?.stripeCustomerId ?? null;

  return {
    highestTier: derivedTier,
    proMemberSince: activeProducts.length ? derivedProMemberSince : null,
    hasCustomer: Boolean(customerId),
    customerId,
    products: activeProducts,
  };
}
