import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildBillingSummary } from "@/lib/billing/summary";
import type { SubscriptionTier } from "@/lib/billing/catalog";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    { data: subscriptions, error: subscriptionError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(
        "id, access_started_at, cancel_at_period_end, current_period_end, current_period_start, plan_key, plan_name, status, stripe_customer_id, stripe_subscription_id"
      )
      .eq("user_id", user.id)
      .order("current_period_end", { ascending: true }),
    supabase.from("users").select("subscription_tier, pro_member_since").eq("id", user.id).single(),
  ]);

  if (subscriptionError || profileError) {
    return NextResponse.json({ error: "Failed to load billing summary." }, { status: 500 });
  }

  const summary = buildBillingSummary({
    subscriptions: subscriptions ?? [],
    subscriptionTier: (profile?.subscription_tier ?? "free") as SubscriptionTier,
    proMemberSince: profile?.pro_member_since ?? null,
  });

  return NextResponse.json({ summary });
}
