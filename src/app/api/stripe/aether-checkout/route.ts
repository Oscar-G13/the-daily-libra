import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";

// Aether packs: amount → Stripe Price ID env var key
const AETHER_PACKS: Record<string, { aether: number; priceEnvKey: string; label: string }> = {
  aether_100:  { aether: 100,  priceEnvKey: "STRIPE_AETHER_100_PRICE_ID",  label: "100 Aether"   },
  aether_280:  { aether: 280,  priceEnvKey: "STRIPE_AETHER_280_PRICE_ID",  label: "280 Aether"   },
  aether_650:  { aether: 650,  priceEnvKey: "STRIPE_AETHER_650_PRICE_ID",  label: "650 Aether"   },
  aether_1500: { aether: 1500, priceEnvKey: "STRIPE_AETHER_1500_PRICE_ID", label: "1500 Aether"  },
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pack_id } = await req.json() as { pack_id: string };
  const pack = AETHER_PACKS[pack_id];
  if (!pack) return NextResponse.json({ error: "Invalid pack." }, { status: 400 });

  const priceId = process.env[pack.priceEnvKey];
  if (!priceId) {
    return NextResponse.json(
      { error: "This Aether pack is not yet available. Check back soon." },
      { status: 503 }
    );
  }

  const { data: userData } = await supabase
    .from("users")
    .select("email, display_name")
    .eq("id", user.id)
    .single();

  const email = userData?.email ?? user.email;
  if (!email) return NextResponse.json({ error: "Missing user email." }, { status: 400 });

  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Find or create Stripe customer
  let customerId: string | null = null;
  const existingCustomers = await stripe.customers.list({ email, limit: 5 });
  const match = existingCustomers.data.find((c) => c.email === email);
  if (match) {
    customerId = match.id;
  } else {
    const newCustomer = await stripe.customers.create({
      email,
      name: userData?.display_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = newCustomer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      type: "aether_pack",
      pack_id,
      aether_amount: String(pack.aether),
      user_id: user.id,
    },
    success_url: `${appUrl}/shop?aether_success=1&amount=${pack.aether}`,
    cancel_url: `${appUrl}/shop`,
  });

  return NextResponse.json({ url: session.url });
}
