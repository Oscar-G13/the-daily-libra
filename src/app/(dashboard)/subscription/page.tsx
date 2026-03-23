import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "@/components/subscription/subscription-client";

export const metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: subscription }, profileResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, plan_name, current_period_end, stripe_customer_id")
      .eq("user_id", user!.id)
      .maybeSingle(),
    (supabase as any)
      .from("users")
      .select("subscription_tier")
      .eq("id", user!.id)
      .single(),
  ]);

  const isActive = subscription?.status === "active";
  const tier = profileResult.data?.subscription_tier ?? "free";

  return (
    <SubscriptionClient
      isActive={isActive}
      planName={subscription?.plan_name ?? null}
      periodEnd={subscription?.current_period_end ?? null}
      hasCustomer={!!subscription?.stripe_customer_id}
      tier={tier}
    />
  );
}
