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

  // Build payment link URL with prefilled customer context
  const paymentUrl = new URL(plan.paymentLink);
  paymentUrl.searchParams.set("prefilled_email", user.email ?? "");
  paymentUrl.searchParams.set("client_reference_id", user.id);
  paymentUrl.searchParams.set(
    "success_url",
    `${appUrl}/subscription?success=true`
  );

  // Attach Stripe customer if we have one
  if (customerId) {
    paymentUrl.searchParams.set("customer", customerId);
  }

  return NextResponse.json({ url: paymentUrl.toString() });
}
