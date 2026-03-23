import { createClient } from "@/lib/supabase/server";
import { buildBillingSummary } from "@/lib/billing/summary";
import type { SubscriptionTier } from "@/lib/billing/catalog";
import { SubscriptionClient } from "@/components/subscription/subscription-client";

export const metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: subscriptions }, profileResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(
        "id, access_started_at, cancel_at_period_end, current_period_end, current_period_start, plan_key, plan_name, status, stripe_customer_id, stripe_subscription_id"
      )
      .eq("user_id", user!.id),
    supabase
      .from("users")
      .select("subscription_tier, pro_member_since")
      .eq("id", user!.id)
      .single(),
  ]);

  const summary = buildBillingSummary({
    subscriptions: subscriptions ?? [],
    subscriptionTier: (profileResult.data?.subscription_tier ?? "free") as SubscriptionTier,
    proMemberSince: profileResult.data?.pro_member_since ?? null,
  });

  return <SubscriptionClient summary={summary} />;
}
