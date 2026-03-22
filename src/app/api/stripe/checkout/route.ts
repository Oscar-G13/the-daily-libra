import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, PLANS } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const planKey = (body.plan as keyof typeof PLANS) ?? "premium_monthly";
  const plan = PLANS[planKey];

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripeClient();

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const { data: userData } = await supabase
      .from("users")
      .select("email, display_name")
      .eq("id", user.id)
      .single();

    const customer = await stripe.customers.create({
      email: userData?.email ?? user.email,
      name: userData?.display_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });

    customerId = customer.id;

    await supabase.from("subscriptions").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      provider: "stripe",
      status: "inactive",
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${appUrl}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/subscription?canceled=true`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
