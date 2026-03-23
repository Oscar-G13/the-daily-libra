import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripeClient();

  const [{ data: subscriptions }, { data: profile }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("users").select("email").eq("id", user.id).single(),
  ]);

  let customerId =
    subscriptions?.find((subscription) => subscription.stripe_customer_id)?.stripe_customer_id ??
    null;

  if (!customerId && profile?.email) {
    const customers = await stripe.customers.list({ email: profile.email, limit: 10 });
    customerId = customers.data.find((customer) => customer.email === profile.email)?.id ?? null;
  }

  if (!customerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/subscription`,
  });

  return NextResponse.json({ url: portalSession.url });
}
