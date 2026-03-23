import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import { getResendClient, FROM_EMAIL } from "@/lib/email/client";
import { SubscriptionConfirmedEmail } from "@/lib/email/templates/subscription-confirmed";
import { render } from "@react-email/components";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        const isActive = ["active", "trialing"].includes(subscription.status);
        const isNewSubscription = event.type === "customer.subscription.created";

        const priceId = subscription.items.data[0]?.price?.id ?? "";
        const planName = priceId.includes("annual") ? "premium_annual" : "premium_monthly";

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan_name: planName,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        await supabase
          .from("users")
          .update({ subscription_tier: isActive ? "premium" : "free" })
          .eq("id", userId);

        // Send subscription confirmation email on new active subscription
        if (isNewSubscription && isActive) {
          const { data: userData } = await supabase
            .from("users")
            .select("display_name, email")
            .eq("id", userId)
            .single();

          if (userData?.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";
            const html = await render(
              SubscriptionConfirmedEmail({
                displayName: userData.display_name ?? "Libra",
                planName,
                appUrl,
              })
            );
            await getResendClient().emails.send({
              from: FROM_EMAIL,
              to: userData.email,
              subject: "Premium is active. You're in.",
              html,
            });
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          status: "canceled",
        });

        await supabase.from("users").update({ subscription_tier: "free" }).eq("id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
