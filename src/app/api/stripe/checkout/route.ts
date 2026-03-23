import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, PLANS } from "@/lib/stripe/client";
import type { BillingPlanKey } from "@/lib/billing/catalog";

async function ensureStripeCustomer({
  stripe,
  userId,
  email,
  displayName,
  existingCustomerId,
}: {
  stripe: ReturnType<typeof getStripeClient>;
  userId: string;
  email: string;
  displayName: string | null;
  existingCustomerId: string | null;
}) {
  let customerId = existingCustomerId;

  if (!customerId) {
    const existingCustomers = await stripe.customers.list({ email, limit: 10 });
    const exactMatch = existingCustomers.data.find((customer) => customer.email === email);
    customerId = exactMatch?.id ?? null;
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: displayName ?? undefined,
      metadata: { supabase_user_id: userId },
    });
    return customer.id;
  }

  const customer = await stripe.customers.retrieve(customerId);

  if (!("deleted" in customer) || !customer.deleted) {
    await stripe.customers.update(customer.id, {
      email,
      name: displayName ?? customer.name ?? undefined,
      metadata: {
        ...customer.metadata,
        supabase_user_id: userId,
      },
    });
  }

  return customerId;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const planKey = (body.plan as BillingPlanKey) ?? "premium_monthly";
  const plan = PLANS[planKey];

  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripe = getStripeClient();

  const [{ data: latestSubscription }, { data: userData }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("users").select("email, display_name").eq("id", user.id).single(),
  ]);

  const email = userData?.email ?? user.email;

  if (!email) {
    return NextResponse.json({ error: "Missing user email" }, { status: 400 });
  }

  const customerId = await ensureStripeCustomer({
    stripe,
    userId: user.id,
    email,
    displayName: userData?.display_name ?? null,
    existingCustomerId: latestSubscription?.stripe_customer_id ?? null,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const paymentUrl = new URL(plan.paymentLink);
  paymentUrl.searchParams.set("prefilled_email", email);
  paymentUrl.searchParams.set("client_reference_id", user.id);
  paymentUrl.searchParams.set("success_url", `${appUrl}/subscription?success=true&plan=${planKey}`);
  paymentUrl.searchParams.set("customer", customerId);

  return NextResponse.json({ url: paymentUrl.toString() });
}
